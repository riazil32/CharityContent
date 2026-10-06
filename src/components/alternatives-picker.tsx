"use client";

import { Check, X } from "lucide-react";
import type { ContentDraft, Platform } from "@/lib/types";
import { Button } from "./ui";

export function AlternativesPicker({
  drafts,
  onPick,
  onDismiss,
}: {
  drafts: ContentDraft[];
  platform: Platform;
  orgName: string;
  onPick: (d: ContentDraft) => void;
  onDismiss: () => void;
}) {
  return (
    <div className="animate-fade-up rounded-2xl border border-brand-200 bg-brand-50/60 p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-semibold text-brand-900">Pick an alternative</p>
        <button onClick={onDismiss} className="rounded-lg p-1 text-muted hover:bg-white" aria-label="Dismiss alternatives">
          <X className="size-4" />
        </button>
      </div>
      <div className="space-y-2.5">
        {drafts.map((d, i) => (
          <div key={i} className="rounded-xl border border-sand bg-white p-3.5">
            <p className="text-sm font-semibold">{d.headline}</p>
            <p className="mt-1 line-clamp-3 text-[13px] leading-relaxed whitespace-pre-line text-muted">{d.caption}</p>
            <Button size="sm" variant="secondary" className="mt-3" onClick={() => onPick(d)}>
              <Check className="size-3.5" /> Use option {i + 1}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
