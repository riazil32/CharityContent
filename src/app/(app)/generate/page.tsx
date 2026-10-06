"use client";

import clsx from "clsx";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import {
  BookOpen,
  CalendarPlus,
  Check,
  Copy,
  FileText,
  HandHeart,
  Lightbulb,
  Megaphone,
  MessageCircle,
  RefreshCw,
  Save,
  Sparkles,
  Trophy,
  Users,
  type LucideIcon,
} from "lucide-react";
import { LimitReachedError, useApp, type GenerationSource } from "@/components/app-provider";
import { Button, Card, ChoiceChip, Field, Input, PageHeader, Select, Textarea } from "@/components/ui";
import { PlatformIcon } from "@/components/brand";
import { PostPreview } from "@/components/post-preview";
import { RefineBar } from "@/components/refine-bar";
import { AlternativesPicker } from "@/components/alternatives-picker";
import { copyPost } from "@/components/content-editor";
import { useToast } from "@/components/toast";
import { CONTENT_TYPE_LABELS, PLATFORM_LABELS, TONE_LABELS } from "@/lib/labels";
import { CONTENT_TYPES, PLATFORMS, TONES, type ContentDraft, type ContentType, type Platform, type Tone } from "@/lib/types";
import { iso } from "@/lib/ai/month-plan";

const TYPE_ICONS: Record<ContentType, LucideIcon> = {
  social_post: MessageCircle,
  event_promotion: Megaphone,
  fundraising_appeal: HandHeart,
  awareness_post: Lightbulb,
  volunteer_recruitment: Users,
  success_story: Trophy,
  newsletter: FileText,
};

function Generator() {
  const { org, generate, createItem, remaining } = useApp();
  const params = useSearchParams();
  const toast = useToast();

  const initialType = params.get("type") as ContentType | null;
  const [campaignId, setCampaignId] = useState<string>(params.get("campaign") ?? "");
  const [platform, setPlatform] = useState<Platform>(org?.platforms[0] ?? "instagram");
  const [contentType, setContentType] = useState<ContentType>(initialType && CONTENT_TYPES.includes(initialType) ? initialType : "social_post");
  const [tone, setTone] = useState<Tone>(org?.tone ?? "friendly");
  const [brief, setBrief] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<{ message: string; limit: boolean } | null>(null);
  const [draft, setDraft] = useState<ContentDraft | null>(null);
  const [source, setSource] = useState<GenerationSource | null>(null);
  const [alternatives, setAlternatives] = useState<ContentDraft[] | null>(null);
  const [date, setDate] = useState("");
  const [saved, setSaved] = useState(false);

  if (!org) return null;

  const run = async (count: 1 | 3 = 1) => {
    setLoading(count === 1);
    setError(null);
    try {
      const res = await generate({ platform, contentType, tone, campaignId: campaignId || null, brief, count });
      setSource(res.source);
      if (res.warning) toast(res.warning, "info");
      if (count === 1) {
        setDraft(res.drafts[0]);
        setAlternatives(null);
        setSaved(false);
      } else {
        setAlternatives(res.drafts);
      }
    } catch (e) {
      setError({ message: (e as Error).message, limit: e instanceof LimitReachedError });
    } finally {
      setLoading(false);
    }
  };

  const save = async (withDate: boolean) => {
    if (!draft) return;
    await createItem(draft, {
      platform,
      contentType,
      tone,
      campaignId: campaignId || null,
      scheduledFor: withDate && date ? date : null,
    });
    setSaved(true);
    toast(withDate && date ? "Added to your calendar" : "Saved to your library");
  };

  const orderedPlatforms = [...org.platforms, ...PLATFORMS.filter((p) => !org.platforms.includes(p))];

  return (
    <>
      <PageHeader title="Create content" description="Choose what you need and we'll write it in your charity's voice." />

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,420px)_1fr]">
        <Card className="space-y-6 p-5 sm:p-6 lg:sticky lg:top-6">
          <Field label="Campaign" htmlFor="campaign">
            <Select id="campaign" value={campaignId} onChange={(e) => setCampaignId(e.target.value)}>
              <option value="">General (no specific campaign)</option>
              {org.campaigns.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Platform">
            <div className="grid grid-cols-2 gap-2">
              {orderedPlatforms.map((p) => (
                <ChoiceChip key={p} selected={platform === p} onClick={() => setPlatform(p)}>
                  <PlatformIcon platform={p} />
                  {PLATFORM_LABELS[p]}
                </ChoiceChip>
              ))}
            </div>
          </Field>

          <Field label="Content type">
            <div className="grid grid-cols-2 gap-2">
              {CONTENT_TYPES.map((t) => {
                const Icon = TYPE_ICONS[t];
                return (
                  <ChoiceChip key={t} selected={contentType === t} onClick={() => setContentType(t)} className="justify-start text-left text-[13.5px]">
                    <Icon className="size-4 shrink-0 text-brand-600" />
                    {CONTENT_TYPE_LABELS[t]}
                  </ChoiceChip>
                );
              })}
            </div>
          </Field>

          <Field label="Tone">
            <div className="flex flex-wrap gap-2">
              {TONES.map((t) => (
                <ChoiceChip key={t} selected={tone === t} onClick={() => setTone(t)} className="py-1.5">
                  {TONE_LABELS[t]}
                </ChoiceChip>
              ))}
            </div>
          </Field>

          <Field label="Anything specific to include? (optional)" htmlFor="brief">
            <Textarea
              id="brief"
              rows={2}
              className="min-h-0"
              value={brief}
              onChange={(e) => setBrief(e.target.value)}
              placeholder="e.g. Thank Kirkgate Market for this week's veg donation"
            />
          </Field>

          <div>
            <Button size="lg" className="w-full" onClick={() => run(1)} loading={loading}>
              {!loading && <Sparkles className="size-4" />} {draft ? "Generate again" : "Generate content"}
            </Button>
            <p className="mt-2 text-center text-xs text-muted">
              Uses 1 AI generation{remaining !== null && ` · ${remaining} left this month`}. Rewrites are free.
            </p>
            {error && (
              <p className="mt-3 rounded-xl bg-red-50 px-3.5 py-2.5 text-sm text-red-800">
                {error.message}{" "}
                {error.limit && (
                  <Link className="font-semibold underline" href="/settings?tab=subscription">
                    See plans
                  </Link>
                )}
              </p>
            )}
          </div>
        </Card>

        <div className="min-w-0">
          {loading ? (
            <LoadingCard />
          ) : !draft ? (
            <Card className="flex flex-col items-center px-6 py-20 text-center">
              <div className="grid size-14 place-items-center rounded-2xl bg-brand-50 text-brand-700">
                <BookOpen className="size-6" />
              </div>
              <h2 className="mt-5 font-display text-xl font-medium">Your post will appear here</h2>
              <p className="mt-2 max-w-sm text-sm text-muted">
                Every post comes with a headline, caption, call to action, hashtags and an image idea, ready to copy.
              </p>
            </Card>
          ) : (
            <div className="animate-fade-up space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-muted">
                  {CONTENT_TYPE_LABELS[contentType]} for {PLATFORM_LABELS[platform]} · {TONE_LABELS[tone]}
                  {source === "demo" && <span className="ml-2 rounded-full bg-cream px-2 py-0.5 text-xs ring-1 ring-sand">Built-in writer</span>}
                </p>
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost" onClick={() => run(1)}>
                    <RefreshCw className="size-3.5" /> Regenerate
                  </Button>
                  <Button size="sm" variant="outline" onClick={async () => toast((await copyPost(draft)) ? "Copied to clipboard" : "Couldn't access the clipboard", "info")}>
                    <Copy className="size-3.5" /> Copy
                  </Button>
                </div>
              </div>

              <PostPreview draft={draft} platform={platform} contentType={contentType} orgName={org.name} className="shadow-card" />

              <Card className="space-y-5 p-5">
                <RefineBar draft={draft} platform={platform} onRefined={(d) => { setDraft(d); setSaved(false); }} onAlternatives={() => run(3)} />
                {alternatives && (
                  <AlternativesPicker
                    drafts={alternatives}
                    platform={platform}
                    orgName={org.name}
                    onPick={(d) => {
                      setDraft(d);
                      setAlternatives(null);
                      setSaved(false);
                    }}
                    onDismiss={() => setAlternatives(null)}
                  />
                )}
              </Card>

              <Card className="flex flex-col gap-3 p-5 sm:flex-row sm:items-end">
                {saved ? (
                  <div className="flex flex-1 items-center gap-3 text-sm">
                    <span className="grid size-8 place-items-center rounded-full bg-brand-50 text-brand-700">
                      <Check className="size-4" />
                    </span>
                    Saved.{" "}
                    <Link href={date ? `/calendar?month=${date.slice(0, 7)}` : "/library"} className="font-medium text-brand-700 hover:underline">
                      {date ? "View in calendar" : "View in library"}
                    </Link>
                  </div>
                ) : (
                  <>
                    <Field label="Schedule for (optional)" className="flex-1">
                      <Input type="date" min={iso(new Date())} value={date} onChange={(e) => setDate(e.target.value)} />
                    </Field>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => save(false)}>
                        <Save className="size-4" /> Save to library
                      </Button>
                      <Button onClick={() => save(true)} disabled={!date}>
                        <CalendarPlus className="size-4" /> Add to calendar
                      </Button>
                    </div>
                  </>
                )}
              </Card>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function LoadingCard() {
  return (
    <Card className="p-6">
      <div className="flex items-center gap-3">
        <div className="size-9 animate-pulse rounded-full bg-sand" />
        <div className="space-y-2">
          <div className="h-3 w-40 animate-pulse rounded bg-sand" />
          <div className="h-2.5 w-24 animate-pulse rounded bg-sand/70" />
        </div>
      </div>
      <div className="mt-6 space-y-3">
        {[90, 100, 95, 70, 85].map((w, i) => (
          <div key={i} className={clsx("h-3 animate-pulse rounded bg-sand/70")} style={{ width: `${w}%`, animationDelay: `${i * 80}ms` }} />
        ))}
      </div>
      <p className="mt-6 flex items-center gap-2 text-sm text-muted">
        <Sparkles className="size-4 animate-pulse text-coral-500" /> Writing in {"your"} charity&apos;s voice…
      </p>
    </Card>
  );
}

export default function GeneratePage() {
  return (
    <Suspense>
      <Generator />
    </Suspense>
  );
}
