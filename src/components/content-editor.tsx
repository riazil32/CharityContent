"use client";

import clsx from "clsx";
import { Copy, Eye, Heart, PencilLine, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import type { ContentDraft, ContentItem } from "@/lib/types";
import { CONTENT_TYPES, PLATFORMS } from "@/lib/types";
import { CONTENT_TYPE_LABELS, PLATFORM_LABELS, PLATFORM_LIMITS } from "@/lib/labels";
import { LimitReachedError, useApp } from "./app-provider";
import { useToast } from "./toast";
import { Button, Field, Input, Modal, Select, Textarea } from "./ui";
import { PostPreview } from "./post-preview";
import { RefineBar } from "./refine-bar";
import { AlternativesPicker } from "./alternatives-picker";

export function postAsText(d: ContentDraft): string {
  return [d.headline, d.caption, d.cta, d.hashtags.join(" ")].filter(Boolean).join("\n\n");
}

export async function copyPost(d: ContentDraft): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(postAsText(d));
    return true;
  } catch {
    return false;
  }
}

export function ContentEditor({ item, onClose }: { item: ContentItem | null; onClose: () => void }) {
  const { org, saveItem, deleteItem, toggleFavourite, generate, items } = useApp();
  const toast = useToast();
  const [draft, setDraft] = useState<ContentItem | null>(item);
  const [view, setView] = useState<"edit" | "preview">("edit");
  const [saving, setSaving] = useState(false);
  const [alternatives, setAlternatives] = useState<ContentDraft[] | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    setDraft(item);
    setView("edit");
    setAlternatives(null);
    setConfirmDelete(false);
  }, [item]);

  if (!item || !draft || !org) return null;
  const live = items.find((i) => i.id === item.id) ?? item;
  const dirty = JSON.stringify({ ...draft, favourite: 0 }) !== JSON.stringify({ ...item, favourite: 0 });
  const set = <K extends keyof ContentItem>(k: K, v: ContentItem[K]) => setDraft({ ...draft, [k]: v });
  const applyDraft = (d: ContentDraft) => setDraft({ ...draft, ...d });
  const length = draft.caption.length + draft.cta.length + draft.hashtags.join(" ").length;
  const limit = PLATFORM_LIMITS[draft.platform];

  const save = async () => {
    setSaving(true);
    try {
      await saveItem({ ...draft, favourite: live.favourite });
      toast("Changes saved");
      onClose();
    } catch (e) {
      toast((e as Error).message, "error");
    } finally {
      setSaving(false);
    }
  };

  const loadAlternatives = async () => {
    try {
      const res = await generate({
        platform: draft.platform,
        contentType: draft.contentType,
        tone: draft.tone,
        campaignId: draft.campaignId,
        count: 3,
      });
      setAlternatives(res.drafts);
    } catch (e) {
      toast(e instanceof LimitReachedError ? e.message : (e as Error).message, "error");
    }
  };

  return (
    <Modal
      open
      onClose={onClose}
      size="xl"
      title={draft.headline || "Untitled post"}
      description={
        <span>
          {PLATFORM_LABELS[draft.platform]} · {CONTENT_TYPE_LABELS[draft.contentType]}
          {draft.scheduledFor &&
            ` · ${new Date(`${draft.scheduledFor}T12:00:00`).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })}`}
        </span>
      }
      footer={
        <>
          {confirmDelete ? (
            <div className="mr-auto flex items-center gap-2">
              <span className="text-sm text-muted">Delete this post?</span>
              <Button
                size="sm"
                variant="danger"
                onClick={async () => {
                  await deleteItem(item.id);
                  toast("Post deleted");
                  onClose();
                }}
              >
                Yes, delete
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setConfirmDelete(false)}>
                Cancel
              </Button>
            </div>
          ) : (
            <div className="mr-auto flex gap-1">
              <Button size="sm" variant="ghost" onClick={() => setConfirmDelete(true)} aria-label="Delete">
                <Trash2 className="size-4" /> <span className="hidden sm:inline">Delete</span>
              </Button>
              <Button size="sm" variant="ghost" onClick={() => toggleFavourite(item.id)} aria-label="Favourite">
                <Heart className={clsx("size-4", live.favourite && "fill-coral-500 text-coral-500")} />
                <span className="hidden sm:inline">{live.favourite ? "Favourited" : "Favourite"}</span>
              </Button>
            </div>
          )}
          <Button
            variant="outline"
            onClick={async () => toast((await copyPost(draft)) ? "Copied to clipboard" : "Couldn't access the clipboard", "info")}
          >
            <Copy className="size-4" /> Copy
          </Button>
          <Button onClick={save} loading={saving} disabled={!dirty}>
            Save changes
          </Button>
        </>
      }
    >
      <div className="mb-5 inline-flex rounded-xl bg-cream p-1 ring-1 ring-sand lg:hidden">
        {(["edit", "preview"] as const).map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={clsx("flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium", view === v ? "bg-white shadow-sm" : "text-muted")}
          >
            {v === "edit" ? <PencilLine className="size-3.5" /> : <Eye className="size-3.5" />}
            {v === "edit" ? "Edit" : "Preview"}
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        <div className={clsx("space-y-4", view === "preview" && "hidden lg:block")}>
          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="Platform">
              <Select value={draft.platform} onChange={(e) => set("platform", e.target.value as ContentItem["platform"])}>
                {PLATFORMS.map((p) => (
                  <option key={p} value={p}>
                    {PLATFORM_LABELS[p]}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Type">
              <Select value={draft.contentType} onChange={(e) => set("contentType", e.target.value as ContentItem["contentType"])}>
                {CONTENT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {CONTENT_TYPE_LABELS[t]}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Date">
              <Input type="date" value={draft.scheduledFor ?? ""} onChange={(e) => set("scheduledFor", e.target.value || null)} />
            </Field>
          </div>
          <Field label={draft.contentType === "newsletter" ? "Subject line" : "Headline / hook"}>
            <Input value={draft.headline} onChange={(e) => set("headline", e.target.value)} />
          </Field>
          <Field
            label={draft.contentType === "newsletter" ? "Email body" : "Caption"}
            hint={
              <span className={clsx(length > limit && "font-medium text-red-700")}>
                {length.toLocaleString()} / {limit.toLocaleString()} characters for {PLATFORM_LABELS[draft.platform]}
              </span>
            }
          >
            <Textarea rows={8} value={draft.caption} onChange={(e) => set("caption", e.target.value)} />
          </Field>
          <Field label="Call to action">
            <Input value={draft.cta} onChange={(e) => set("cta", e.target.value)} />
          </Field>
          <Field label="Hashtags" hint="Separate with spaces.">
            <Input
              value={draft.hashtags.join(" ")}
              onChange={(e) =>
                set(
                  "hashtags",
                  e.target.value
                    .split(/\s+/)
                    .filter(Boolean)
                    .map((h) => (h.startsWith("#") ? h : `#${h}`)),
                )
              }
            />
          </Field>
          <Field label="Image idea">
            <Textarea rows={2} className="min-h-0" value={draft.imageIdea} onChange={(e) => set("imageIdea", e.target.value)} />
          </Field>
        </div>

        <div className={clsx("space-y-5", view === "edit" && "hidden lg:block")}>
          <RefineBar draft={draft} platform={draft.platform} onRefined={applyDraft} onAlternatives={loadAlternatives} />
          {alternatives && (
            <AlternativesPicker
              drafts={alternatives}
              platform={draft.platform}
              orgName={org.name}
              onPick={(d) => {
                applyDraft(d);
                setAlternatives(null);
                toast("Alternative applied. Save to keep it.", "info");
              }}
              onDismiss={() => setAlternatives(null)}
            />
          )}
          <PostPreview draft={draft} platform={draft.platform} contentType={draft.contentType} orgName={org.name} />
        </div>
      </div>
    </Modal>
  );
}
