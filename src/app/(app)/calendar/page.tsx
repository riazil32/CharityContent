"use client";

import clsx from "clsx";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import { CalendarHeart, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { useApp } from "@/components/app-provider";
import { Button, ChoiceChip, PageHeader } from "@/components/ui";
import { PlatformIcon } from "@/components/brand";
import { PlatformBadge } from "@/components/post-preview";
import { ContentEditor } from "@/components/content-editor";
import { GenerateMonthModal } from "@/components/generate-month-modal";
import { CONTENT_TYPE_LABELS, PLATFORM_LABELS, PLATFORM_STYLES } from "@/lib/labels";
import { iso } from "@/lib/ai/month-plan";
import { awarenessDaysInMonth } from "@/lib/ai/awareness-days";
import { PLATFORMS, type ContentItem, type Platform } from "@/lib/types";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function parseMonth(value: string | null): { y: number; m: number } {
  const match = value?.match(/^(\d{4})-(\d{2})$/);
  if (match) return { y: Number(match[1]), m: Number(match[2]) };
  const now = new Date();
  return { y: now.getFullYear(), m: now.getMonth() + 1 };
}

function Calendar() {
  const { org, items } = useApp();
  const params = useSearchParams();
  const router = useRouter();
  const { y, m } = parseMonth(params.get("month"));
  const [filter, setFilter] = useState<Platform | null>(null);
  const [editing, setEditing] = useState<ContentItem | null>(null);
  const [monthOpen, setMonthOpen] = useState(false);
  const today = iso(new Date());

  const go = (delta: number) => {
    const d = new Date(y, m - 1 + delta, 1);
    router.replace(`/calendar?month=${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  };

  const prefix = `${y}-${String(m).padStart(2, "0")}`;
  const monthItems = useMemo(
    () =>
      items
        .filter((i) => i.scheduledFor?.startsWith(prefix) && (!filter || i.platform === filter))
        .sort((a, b) => a.scheduledFor!.localeCompare(b.scheduledFor!)),
    [items, prefix, filter],
  );

  const markers = useMemo(() => {
    const map = new Map<string, { name: string; own: boolean }[]>();
    if (!org) return map;
    const add = (date: string, name: string, own: boolean) => map.set(date, [...(map.get(date) ?? []), { name, own }]);
    org.keyDates.filter((k) => k.date.startsWith(prefix)).forEach((k) => add(k.date, k.name, true));
    awarenessDaysInMonth(y, m, org.causes)
      .filter((a) => a.relevant)
      .forEach((a) => add(a.date, a.name, false));
    return map;
  }, [org, prefix, y, m]);

  const cells = useMemo(() => {
    const first = new Date(y, m - 1, 1);
    const offset = (first.getDay() + 6) % 7; // Monday first
    const days = new Date(y, m, 0).getDate();
    const total = Math.ceil((offset + days) / 7) * 7;
    return Array.from({ length: total }, (_, i) => {
      const d = new Date(y, m - 1, 1 - offset + i, 12);
      return { date: iso(d), day: d.getDate(), inMonth: d.getMonth() === m - 1 };
    });
  }, [y, m]);

  const byDate = useMemo(() => {
    const map = new Map<string, ContentItem[]>();
    monthItems.forEach((i) => map.set(i.scheduledFor!, [...(map.get(i.scheduledFor!) ?? []), i]));
    return map;
  }, [monthItems]);

  if (!org) return null;
  const title = new Date(y, m - 1, 1).toLocaleDateString("en-GB", { month: "long", year: "numeric" });

  return (
    <>
      <PageHeader
        title="Content calendar"
        description="Click any post to view, edit or rewrite it."
        actions={
          <Button onClick={() => setMonthOpen(true)}>
            <Sparkles className="size-4" /> Generate content
          </Button>
        }
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => go(-1)} aria-label="Previous month">
            <ChevronLeft className="size-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => go(1)} aria-label="Next month">
            <ChevronRight className="size-4" />
          </Button>
          <h2 className="ml-2 font-display text-xl font-medium">{title}</h2>
          <Button variant="ghost" size="sm" onClick={() => router.replace("/calendar")}>
            Today
          </Button>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <ChoiceChip selected={!filter} onClick={() => setFilter(null)} className="px-3! py-1.5! text-[13px]!">
            All
          </ChoiceChip>
          {PLATFORMS.map((p) => (
            <ChoiceChip key={p} selected={filter === p} onClick={() => setFilter(filter === p ? null : p)} className="px-3! py-1.5! text-[13px]!">
              <PlatformIcon platform={p} className="size-3.5" /> <span className="hidden sm:inline">{PLATFORM_LABELS[p]}</span>
            </ChoiceChip>
          ))}
        </div>
      </div>

      {/* Month grid (tablet and up) */}
      <div className="hidden overflow-hidden rounded-2xl border border-sand bg-white shadow-card md:block">
        <div className="grid grid-cols-7 border-b border-sand bg-cream/60">
          {WEEKDAYS.map((d) => (
            <div key={d} className="px-3 py-2.5 text-xs font-semibold tracking-wide text-muted uppercase">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {cells.map((c, idx) => {
            const dayItems = byDate.get(c.date) ?? [];
            const dayMarkers = c.inMonth ? markers.get(c.date) ?? [] : [];
            return (
              <div
                key={c.date}
                className={clsx(
                  "min-h-32 border-sand p-1.5 lg:min-h-36",
                  idx % 7 !== 6 && "border-r",
                  idx < cells.length - 7 && "border-b",
                  !c.inMonth && "bg-cream/40",
                )}
              >
                <div className="flex items-center justify-between px-1.5 pt-0.5 pb-1">
                  <span
                    className={clsx(
                      "grid size-6 place-items-center rounded-full text-[13px] font-medium",
                      c.date === today ? "bg-brand-700 text-white" : c.inMonth ? "text-ink" : "text-muted/50",
                    )}
                  >
                    {c.day}
                  </span>
                </div>
                {dayMarkers.map((mk) => (
                  <p
                    key={mk.name}
                    title={mk.name}
                    className={clsx("mb-1 flex items-center gap-1 truncate rounded-md px-1.5 py-0.5 text-[11px] font-medium", mk.own ? "bg-coral-50 text-coral-700" : "bg-brand-50 text-brand-800")}
                  >
                    <CalendarHeart className="size-3 shrink-0" />
                    <span className="truncate">{mk.name}</span>
                  </p>
                ))}
                <div className="space-y-1">
                  {dayItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setEditing(item)}
                      className={clsx(
                        "block w-full rounded-lg px-2 py-1.5 text-left ring-1 ring-inset transition-all hover:-translate-y-px hover:shadow-card",
                        PLATFORM_STYLES[item.platform].chip,
                      )}
                    >
                      <span className="flex items-center gap-1 text-[11px] font-semibold opacity-80">
                        <PlatformIcon platform={item.platform} className="size-3" />
                        <span className="truncate">{CONTENT_TYPE_LABELS[item.contentType]}</span>
                        {item.favourite && <span className="ml-auto text-coral-500">♥</span>}
                      </span>
                      <span className="mt-0.5 line-clamp-2 text-xs leading-snug font-medium text-ink">{item.headline}</span>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Agenda list (mobile) */}
      <div className="space-y-3 md:hidden">
        {monthItems.length === 0 && (
          <p className="rounded-2xl border border-sand bg-white p-6 text-center text-sm text-muted">No posts this month yet.</p>
        )}
        {monthItems.map((item, i) => {
          const showDate = i === 0 || monthItems[i - 1].scheduledFor !== item.scheduledFor;
          return (
            <div key={item.id}>
              {showDate && (
                <p className={clsx("mb-2 text-sm font-semibold", item.scheduledFor === today ? "text-brand-700" : "text-muted", i > 0 && "mt-5")}>
                  {new Date(`${item.scheduledFor}T12:00:00`).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}
                </p>
              )}
              <button onClick={() => setEditing(item)} className="w-full rounded-2xl border border-sand bg-white p-4 text-left shadow-card">
                <div className="flex items-center justify-between gap-2">
                  <PlatformBadge platform={item.platform} />
                  <span className="text-xs text-muted">{CONTENT_TYPE_LABELS[item.contentType]}</span>
                </div>
                <p className="mt-2.5 font-medium">{item.headline}</p>
                <p className="mt-1 line-clamp-2 text-sm text-muted">{item.caption}</p>
              </button>
            </div>
          );
        })}
      </div>

      <p className="mt-4 text-sm text-muted">
        {monthItems.length} post{monthItems.length === 1 ? "" : "s"} in {title}
        {filter && ` on ${PLATFORM_LABELS[filter]}`}.
      </p>

      <ContentEditor item={editing} onClose={() => setEditing(null)} />
      <GenerateMonthModal open={monthOpen} onClose={() => setMonthOpen(false)} />
    </>
  );
}

export default function CalendarPage() {
  return (
    <Suspense>
      <Calendar />
    </Suspense>
  );
}
