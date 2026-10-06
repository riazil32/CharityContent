"use client";

import { Plus, Trash2, X } from "lucide-react";
import { useState, type KeyboardEvent } from "react";
import type { Campaign, KeyDate, Platform, Tone } from "@/lib/types";
import { PLATFORMS, TONES } from "@/lib/types";
import { PLATFORM_LABELS, TONE_LABELS } from "@/lib/labels";
import { PlatformIcon } from "./brand";
import { Button, ChoiceChip, Field, Input, Textarea } from "./ui";

export const TONE_DESCRIPTIONS: Record<Tone, string> = {
  professional: "Clear, credible and measured",
  friendly: "Warm, chatty and approachable",
  inspiring: "Hopeful and uplifting",
  urgent: "Direct, with a clear call to act now",
  educational: "Informative and explanatory",
};

export function PlatformPicker({ value, onChange }: { value: Platform[]; onChange: (v: Platform[]) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {PLATFORMS.map((p) => {
        const on = value.includes(p);
        return (
          <ChoiceChip key={p} selected={on} onClick={() => onChange(on ? value.filter((x) => x !== p) : [...value, p])}>
            <PlatformIcon platform={p} />
            {PLATFORM_LABELS[p]}
          </ChoiceChip>
        );
      })}
    </div>
  );
}

export function TonePicker({ value, onChange }: { value: Tone; onChange: (v: Tone) => void }) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {TONES.map((t) => (
        <ChoiceChip key={t} selected={value === t} onClick={() => onChange(t)} className="flex-col items-start! gap-0.5! py-2.5! text-left">
          <span>{TONE_LABELS[t]}</span>
          <span className="text-xs font-normal text-muted">{TONE_DESCRIPTIONS[t]}</span>
        </ChoiceChip>
      ))}
    </div>
  );
}

export function TagInput({ value, onChange, placeholder }: { value: string[]; onChange: (v: string[]) => void; placeholder?: string }) {
  // Text still being typed is included in `value` straight away (as trailing
  // entries) so nothing is lost if the user moves on without pressing Enter.
  const [draft, setDraft] = useState("");
  const parse = (s: string) => s.split(",").map((x) => x.trim()).filter(Boolean);
  const committed = value.slice(0, value.length - parse(draft).length);

  const onType = (text: string) => {
    const lastComma = text.lastIndexOf(",");
    if (lastComma === -1) {
      setDraft(text);
      onChange([...committed, ...parse(text)]);
      return;
    }
    const done = parse(text.slice(0, lastComma)).filter((s) => !committed.some((v) => v.toLowerCase() === s.toLowerCase()));
    const rest = text.slice(lastComma + 1).trimStart();
    setDraft(rest);
    onChange([...committed, ...done, ...parse(rest)]);
  };
  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      setDraft("");
    } else if (e.key === "Backspace" && !draft && committed.length) {
      onChange(committed.slice(0, -1));
    }
  };
  return (
    <div className="flex min-h-11 flex-wrap items-center gap-1.5 rounded-xl border border-sand-dark bg-white px-2 py-1.5 focus-within:border-brand-500 focus-within:ring-4 focus-within:ring-brand-500/10">
      {committed.map((tag) => (
        <span key={tag} className="inline-flex items-center gap-1 rounded-lg bg-brand-50 py-1 pr-1 pl-2.5 text-sm font-medium text-brand-800">
          {tag}
          <button
            type="button"
            onClick={() => onChange([...committed.filter((v) => v !== tag), ...parse(draft)])}
            className="rounded p-0.5 hover:bg-brand-100"
            aria-label={`Remove ${tag}`}
          >
            <X className="size-3.5" />
          </button>
        </span>
      ))}
      <input
        value={draft}
        onChange={(e) => onType(e.target.value)}
        onKeyDown={onKey}
        placeholder={value.length ? "Add another…" : placeholder}
        className="h-8 min-w-32 flex-1 bg-transparent px-1.5 text-[15px] outline-none placeholder:text-muted/60"
      />
    </div>
  );
}

export function CampaignEditor({ value, onChange }: { value: Campaign[]; onChange: (v: Campaign[]) => void }) {
  const update = (id: string, patch: Partial<Campaign>) => onChange(value.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  return (
    <div className="space-y-3">
      {value.map((c, i) => (
        <div key={c.id} className="rounded-2xl border border-sand bg-cream/50 p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-semibold text-muted">Campaign {i + 1}</p>
            <button type="button" onClick={() => onChange(value.filter((x) => x.id !== c.id))} className="rounded-lg p-1.5 text-muted hover:bg-white hover:text-red-700" aria-label="Remove campaign">
              <Trash2 className="size-4" />
            </button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Campaign name">
              <Input value={c.name} onChange={(e) => update(c.id, { name: e.target.value })} placeholder="e.g. Warm Winter Appeal" />
            </Field>
            <Field label="Goal (optional)">
              <Input value={c.goal ?? ""} onChange={(e) => update(c.id, { goal: e.target.value })} placeholder="e.g. raise £5,000 by December" />
            </Field>
            <Field label="What is it about?" className="sm:col-span-2">
              <Textarea rows={2} className="min-h-0" value={c.description} onChange={(e) => update(c.id, { description: e.target.value })} placeholder="One or two sentences about the campaign" />
            </Field>
            <Field label="End date (optional)">
              <Input type="date" value={c.endDate ?? ""} onChange={(e) => update(c.id, { endDate: e.target.value || null })} />
            </Field>
          </div>
        </div>
      ))}
      <Button type="button" variant="outline" onClick={() => onChange([...value, { id: crypto.randomUUID(), name: "", description: "", goal: "", endDate: null }])}>
        <Plus className="size-4" /> Add a campaign
      </Button>
    </div>
  );
}

export function KeyDateEditor({ value, onChange }: { value: KeyDate[]; onChange: (v: KeyDate[]) => void }) {
  const update = (id: string, patch: Partial<KeyDate>) => onChange(value.map((k) => (k.id === id ? { ...k, ...patch } : k)));
  return (
    <div className="space-y-3">
      {value.map((k) => (
        <div key={k.id} className="grid gap-3 rounded-2xl border border-sand bg-cream/50 p-4 sm:grid-cols-[1fr_170px_auto] sm:items-end">
          <Field label="Event or date">
            <Input value={k.name} onChange={(e) => update(k.id, { name: e.target.value })} placeholder="e.g. Summer fun day" />
          </Field>
          <Field label="Date">
            <Input type="date" value={k.date} onChange={(e) => update(k.id, { date: e.target.value })} />
          </Field>
          <button type="button" onClick={() => onChange(value.filter((x) => x.id !== k.id))} className="h-11 justify-self-start rounded-xl px-3 text-muted hover:bg-white hover:text-red-700" aria-label="Remove date">
            <Trash2 className="size-4" />
          </button>
          <Field label="Details (optional)" className="sm:col-span-3">
            <Input value={k.description ?? ""} onChange={(e) => update(k.id, { description: e.target.value })} placeholder="Where, when and anything people should know" />
          </Field>
        </div>
      ))}
      <Button type="button" variant="outline" onClick={() => onChange([...value, { id: crypto.randomUUID(), name: "", date: "", description: "" }])}>
        <Plus className="size-4" /> Add a date
      </Button>
    </div>
  );
}
