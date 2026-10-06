"use client";

import { Layers, Sparkles } from "lucide-react";
import { useState } from "react";
import type { ContentDraft, Platform, Refinement } from "@/lib/types";
import { REFINEMENTS } from "@/lib/types";
import { REFINEMENT_LABELS } from "@/lib/labels";
import { useApp } from "./app-provider";
import { useToast } from "./toast";
import { Button } from "./ui";

/** One-click rewrite buttons. Rewrites are free; alternatives use a generation. */
export function RefineBar({
  draft,
  platform,
  onRefined,
  onAlternatives,
}: {
  draft: ContentDraft;
  platform: Platform;
  onRefined: (d: ContentDraft) => void;
  onAlternatives?: () => Promise<void>;
}) {
  const { refine } = useApp();
  const toast = useToast();
  const [busy, setBusy] = useState<Refinement | "alt" | null>(null);

  const run = async (r: Refinement) => {
    setBusy(r);
    try {
      onRefined(await refine(draft, r, platform));
      toast(`Rewritten: ${REFINEMENT_LABELS[r].replace("Make it ", "").toLowerCase()}`);
    } catch (e) {
      toast((e as Error).message, "error");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div>
      <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold tracking-wide text-muted uppercase">
        <Sparkles className="size-3.5 text-coral-500" /> Rewrite with AI
      </p>
      <div className="flex flex-wrap gap-2">
        {REFINEMENTS.map((r) => (
          <Button key={r} size="sm" variant="outline" loading={busy === r} disabled={busy !== null} onClick={() => run(r)}>
            {REFINEMENT_LABELS[r]}
          </Button>
        ))}
        {onAlternatives && (
          <Button
            size="sm"
            variant="secondary"
            loading={busy === "alt"}
            disabled={busy !== null}
            onClick={async () => {
              setBusy("alt");
              try {
                await onAlternatives();
              } finally {
                setBusy(null);
              }
            }}
          >
            <Layers className="size-3.5" /> Give me 3 alternatives
          </Button>
        )}
      </div>
    </div>
  );
}
