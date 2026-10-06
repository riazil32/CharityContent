"use client";

import clsx from "clsx";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CalendarCheck2, Sparkles } from "lucide-react";
import { LimitReachedError, useApp } from "./app-provider";
import { useToast } from "./toast";
import { Button, Modal } from "./ui";
import { PLATFORM_LABELS } from "@/lib/labels";

function monthOptions() {
  const now = new Date();
  const next = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const fmt = (d: Date) => d.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
  return [
    { key: "this", year: now.getFullYear(), month: now.getMonth() + 1, label: `Rest of ${fmt(now)}`, hint: "From today to the end of the month" },
    { key: "next", year: next.getFullYear(), month: next.getMonth() + 1, label: fmt(next), hint: "Plan ahead for the whole month" },
  ];
}

export function GenerateMonthModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { org, items, generateMonth, remaining } = useApp();
  const router = useRouter();
  const toast = useToast();
  const options = monthOptions();
  const [choice, setChoice] = useState(options[0].key);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<{ message: string; limit: boolean } | null>(null);
  if (!org) return null;

  const selected = options.find((o) => o.key === choice)!;
  const prefix = `${selected.year}-${String(selected.month).padStart(2, "0")}`;
  const existing = items.filter((i) => i.scheduledFor?.startsWith(prefix)).length;

  const run = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await generateMonth(selected.year, selected.month);
      toast(`${res.count} posts added to your calendar`);
      onClose();
      router.push(`/calendar?month=${prefix}`);
    } catch (e) {
      setError({ message: (e as Error).message, limit: e instanceof LimitReachedError });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={busy ? () => {} : onClose}
      title="Generate a month of content"
      description="We'll plan a realistic posting rhythm and write every post for you."
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button onClick={run} loading={busy}>
            {!busy && <Sparkles className="size-4" />}
            {busy ? "Writing your content…" : "Generate content"}
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        <div className="grid gap-2 sm:grid-cols-2">
          {options.map((o) => (
            <button
              key={o.key}
              onClick={() => setChoice(o.key)}
              className={clsx(
                "rounded-2xl border p-4 text-left transition-all",
                choice === o.key ? "border-brand-600 bg-brand-50 ring-2 ring-brand-500/15" : "border-sand hover:border-brand-300",
              )}
            >
              <p className="font-semibold">{o.label}</p>
              <p className="mt-0.5 text-sm text-muted">{o.hint}</p>
            </button>
          ))}
        </div>

        <ul className="space-y-2.5 rounded-2xl bg-cream p-4 text-sm">
          <li className="flex gap-2.5">
            <CalendarCheck2 className="mt-0.5 size-4 shrink-0 text-brand-600" />
            Posts on Mondays, Wednesdays, Fridays and Sundays, plus a monthly newsletter
          </li>
          <li className="flex gap-2.5">
            <CalendarCheck2 className="mt-0.5 size-4 shrink-0 text-brand-600" />
            Shared across {org.platforms.map((p) => PLATFORM_LABELS[p]).join(", ") || "your platforms"}
          </li>
          <li className="flex gap-2.5">
            <CalendarCheck2 className="mt-0.5 size-4 shrink-0 text-brand-600" />
            Linked to {org.campaigns.length ? `your ${org.campaigns.length} campaign${org.campaigns.length > 1 ? "s" : ""}` : "your mission"}, your events and relevant UK awareness days
          </li>
        </ul>

        {existing > 0 && (
          <p className="text-sm text-muted">
            You already have {existing} post{existing > 1 ? "s" : ""} in this month. New posts will be added alongside them.
          </p>
        )}
        <p className="text-xs text-muted">
          Uses 1 AI generation{remaining !== null ? ` · ${remaining} left this month` : ""}.
        </p>
        {error && (
          <div className="rounded-xl bg-red-50 px-3.5 py-2.5 text-sm text-red-800">
            {error.message}{" "}
            {error.limit && (
              <Link href="/settings?tab=subscription" className="font-semibold underline">
                See plans
              </Link>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}
