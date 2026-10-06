import clsx from "clsx";
import { ImageIcon, MousePointerClick } from "lucide-react";
import type { ContentDraft, ContentType, Platform } from "@/lib/types";
import { CONTENT_TYPE_LABELS, PLATFORM_LABELS, PLATFORM_STYLES } from "@/lib/labels";
import { PlatformIcon } from "./brand";

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter((w) => /^[A-Z]/.test(w))
    .slice(0, 2)
    .map((w) => w[0])
    .join("");
}

export function PlatformBadge({ platform, className }: { platform: Platform; className?: string }) {
  return (
    <span className={clsx("inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset", PLATFORM_STYLES[platform].chip, className)}>
      <PlatformIcon platform={platform} className="size-3.5" />
      {PLATFORM_LABELS[platform]}
    </span>
  );
}

export function PostPreview({
  draft,
  platform,
  contentType,
  orgName,
  clamp,
  className,
}: {
  draft: ContentDraft;
  platform: Platform;
  contentType?: ContentType;
  orgName: string;
  clamp?: boolean;
  className?: string;
}) {
  return (
    <article className={clsx("rounded-2xl border border-sand bg-white", className)}>
      <header className="flex items-center gap-3 px-4 pt-4">
        <div className="grid size-9 shrink-0 place-items-center rounded-full bg-brand-100 text-[13px] font-semibold text-brand-800">
          {initials(orgName) || "C"}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{orgName}</p>
          <p className="text-xs text-muted">{contentType ? CONTENT_TYPE_LABELS[contentType] : "Draft"}</p>
        </div>
        <PlatformBadge platform={platform} />
      </header>
      <div className="space-y-3 px-4 py-4">
        <p className="font-display text-[17px] leading-snug font-medium text-ink">{draft.headline}</p>
        <p className={clsx("text-[14.5px] leading-relaxed whitespace-pre-line text-ink/90", clamp && "line-clamp-6")}>{draft.caption}</p>
        <p className="flex items-start gap-2 text-sm font-medium text-brand-700">
          <MousePointerClick className="mt-0.5 size-4 shrink-0" />
          {draft.cta}
        </p>
        {draft.hashtags.length > 0 && <p className="text-sm text-sky-800">{draft.hashtags.join(" ")}</p>}
      </div>
      {draft.imageIdea && (
        <div className="mx-4 mb-4 flex gap-3 rounded-xl border border-dashed border-sand-dark bg-cream/70 p-3">
          <ImageIcon className="mt-0.5 size-4 shrink-0 text-muted" />
          <p className="text-[13px] leading-relaxed text-muted">
            <span className="font-medium text-ink">Image idea: </span>
            {draft.imageIdea}
          </p>
        </div>
      )}
    </article>
  );
}
