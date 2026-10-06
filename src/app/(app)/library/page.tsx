"use client";

import clsx from "clsx";
import { useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import { Copy, FolderHeart, Heart, PencilLine, Search, Sparkles, Trash2 } from "lucide-react";
import { useApp } from "@/components/app-provider";
import { Button, ButtonLink, Card, EmptyState, Input, Modal, PageHeader, Select } from "@/components/ui";
import { PlatformBadge } from "@/components/post-preview";
import { ContentEditor, copyPost } from "@/components/content-editor";
import { useToast } from "@/components/toast";
import { CONTENT_TYPE_LABELS, PLATFORM_LABELS } from "@/lib/labels";
import { CONTENT_TYPES, PLATFORMS, type ContentItem, type ContentType, type Platform } from "@/lib/types";

type Sort = "newest" | "scheduled";

function Library() {
  const { items, org, toggleFavourite, deleteItem } = useApp();
  const toast = useToast();
  const params = useSearchParams();
  const [query, setQuery] = useState("");
  const [platform, setPlatform] = useState<Platform | "">("");
  const [type, setType] = useState<ContentType | "">("");
  const [favouritesOnly, setFavouritesOnly] = useState(params.get("favourites") === "1");
  const [sort, setSort] = useState<Sort>("scheduled");
  const [editing, setEditing] = useState<ContentItem | null>(null);
  const [deleting, setDeleting] = useState<ContentItem | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items
      .filter((i) => (!platform || i.platform === platform) && (!type || i.contentType === type) && (!favouritesOnly || i.favourite))
      .filter((i) => !q || `${i.headline} ${i.caption} ${i.hashtags.join(" ")}`.toLowerCase().includes(q))
      .sort((a, b) =>
        sort === "newest"
          ? b.createdAt.localeCompare(a.createdAt)
          : (b.scheduledFor ?? "9999").localeCompare(a.scheduledFor ?? "9999"),
      );
  }, [items, query, platform, type, favouritesOnly, sort]);

  const filtersActive = Boolean(query || platform || type || favouritesOnly);
  const campaignName = (id: string | null) => org?.campaigns.find((c) => c.id === id)?.name;

  return (
    <>
      <PageHeader
        title="Content library"
        description={`${items.length} saved post${items.length === 1 ? "" : "s"}. Edit, copy and reuse your best content.`}
        actions={
          <ButtonLink href="/generate">
            <Sparkles className="size-4" /> Create content
          </ButtonLink>
        }
      />

      <Card className="mb-6 grid grid-cols-1 gap-3 p-3 sm:grid-cols-2 lg:grid-cols-[1fr_170px_200px_150px_auto]">
        <div className="relative sm:col-span-2 lg:col-span-1">
          <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted" />
          <Input className="pl-10" placeholder="Search posts" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search posts" />
        </div>
        <Select value={platform} onChange={(e) => setPlatform(e.target.value as Platform | "")} aria-label="Filter by platform">
          <option value="">All platforms</option>
          {PLATFORMS.map((p) => (
            <option key={p} value={p}>
              {PLATFORM_LABELS[p]}
            </option>
          ))}
        </Select>
        <Select value={type} onChange={(e) => setType(e.target.value as ContentType | "")} aria-label="Filter by content type">
          <option value="">All content types</option>
          {CONTENT_TYPES.map((t) => (
            <option key={t} value={t}>
              {CONTENT_TYPE_LABELS[t]}
            </option>
          ))}
        </Select>
        <Select value={sort} onChange={(e) => setSort(e.target.value as Sort)} aria-label="Sort">
          <option value="scheduled">By post date</option>
          <option value="newest">Recently created</option>
        </Select>
        <Button variant={favouritesOnly ? "secondary" : "outline"} onClick={() => setFavouritesOnly(!favouritesOnly)} className="h-11">
          <Heart className={clsx("size-4", favouritesOnly && "fill-coral-500 text-coral-500")} /> Favourites
        </Button>
      </Card>

      {filtered.length === 0 ? (
        <Card>
          {filtersActive ? (
            <EmptyState
              icon={<Search className="size-5" />}
              title="No posts match those filters"
              description="Try a different platform, content type or search term."
              action={
                <Button
                  variant="outline"
                  onClick={() => {
                    setQuery("");
                    setPlatform("");
                    setType("");
                    setFavouritesOnly(false);
                  }}
                >
                  Clear filters
                </Button>
              }
            />
          ) : (
            <EmptyState
              icon={<FolderHeart className="size-5" />}
              title="Your library is empty"
              description="Content you generate and save will live here, ready to reuse."
              action={<ButtonLink href="/generate">Create your first post</ButtonLink>}
            />
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((item) => (
            <Card key={item.id} className="group flex flex-col transition-shadow hover:shadow-lift">
              <button onClick={() => setEditing(item)} className="flex-1 p-5 text-left">
                <div className="flex items-center justify-between gap-2">
                  <PlatformBadge platform={item.platform} />
                  <span className="text-xs text-muted">
                    {item.scheduledFor
                      ? new Date(`${item.scheduledFor}T12:00:00`).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
                      : "Not scheduled"}
                  </span>
                </div>
                <p className="mt-3 text-xs font-medium text-brand-700">
                  {CONTENT_TYPE_LABELS[item.contentType]}
                  {campaignName(item.campaignId) && <span className="text-muted"> · {campaignName(item.campaignId)}</span>}
                </p>
                <h3 className="mt-1 line-clamp-2 font-semibold leading-snug">{item.headline}</h3>
                <p className="mt-2 line-clamp-4 text-sm leading-relaxed whitespace-pre-line text-muted">{item.caption}</p>
              </button>
              <div className="flex items-center gap-1 border-t border-sand px-3 py-2">
                <IconButton label={item.favourite ? "Remove from favourites" : "Add to favourites"} onClick={() => toggleFavourite(item.id)}>
                  <Heart className={clsx("size-4", item.favourite && "fill-coral-500 text-coral-500")} />
                </IconButton>
                <IconButton label="Copy" onClick={async () => toast((await copyPost(item)) ? "Copied to clipboard" : "Couldn't access the clipboard", "info")}>
                  <Copy className="size-4" />
                </IconButton>
                <IconButton label="Edit" onClick={() => setEditing(item)}>
                  <PencilLine className="size-4" />
                </IconButton>
                <IconButton label="Delete" onClick={() => setDeleting(item)} className="ml-auto hover:text-red-700">
                  <Trash2 className="size-4" />
                </IconButton>
              </div>
            </Card>
          ))}
        </div>
      )}

      <ContentEditor item={editing} onClose={() => setEditing(null)} />
      <Modal
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        title="Delete this post?"
        description="This can't be undone."
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleting(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={async () => {
                if (!deleting) return;
                await deleteItem(deleting.id);
                setDeleting(null);
                toast("Post deleted");
              }}
            >
              <Trash2 className="size-4" /> Delete post
            </Button>
          </>
        }
      >
        <p className="font-medium">{deleting?.headline}</p>
        <p className="mt-1 line-clamp-3 text-sm text-muted">{deleting?.caption}</p>
      </Modal>
    </>
  );
}

function IconButton({ label, onClick, children, className }: { label: string; onClick: () => void; children: React.ReactNode; className?: string }) {
  return (
    <button onClick={onClick} title={label} aria-label={label} className={clsx("rounded-lg p-2 text-muted transition-colors hover:bg-cream hover:text-ink", className)}>
      {children}
    </button>
  );
}

export default function LibraryPage() {
  return (
    <Suspense>
      <Library />
    </Suspense>
  );
}
