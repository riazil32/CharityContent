import { CalendarDays, Sparkles } from "lucide-react";
import clsx from "clsx";
import type { Platform } from "@/lib/types";
import { PLATFORM_STYLES } from "@/lib/labels";
import { PlatformIcon } from "../brand";

const WEEK: { day: string; date: string; platform: Platform; label: string; type: string }[] = [
  { day: "Mon", date: "5", platform: "instagram", label: "Why child poverty matters to us", type: "Awareness" },
  { day: "Wed", date: "7", platform: "facebook", label: "Jay's story: back in the classroom", type: "Success story" },
  { day: "Fri", date: "9", platform: "linkedin", label: "Employers: mentor with us", type: "Volunteers" },
  { day: "Sun", date: "11", platform: "instagram", label: "£25 keeps a family warm", type: "Fundraising" },
];

/** Static product preview for the hero: a week of planned posts plus one draft. */
export function HeroPreview() {
  return (
    <div className="relative mx-auto w-full max-w-[520px]">
      <div className="rounded-3xl border border-sand bg-white p-5 shadow-lift sm:p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="grid size-9 place-items-center rounded-xl bg-brand-50 text-brand-700">
              <CalendarDays className="size-4.5" />
            </div>
            <div>
              <p className="text-sm font-semibold">October content plan</p>
              <p className="text-xs text-muted">HopeBridge Community Trust</p>
            </div>
          </div>
          <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-800">16 posts ready</span>
        </div>
        <ul className="mt-5 space-y-2">
          {WEEK.map((w, i) => (
            <li
              key={w.day}
              className="flex animate-fade-up items-center gap-3 rounded-xl border border-sand/80 bg-cream/50 px-3 py-2.5"
              style={{ animationDelay: `${150 + i * 90}ms` }}
            >
              <div className="w-9 shrink-0 text-center">
                <p className="text-[10px] font-semibold tracking-wide text-muted uppercase">{w.day}</p>
                <p className="text-[15px] leading-tight font-semibold">{w.date}</p>
              </div>
              <span className={clsx("grid size-7 shrink-0 place-items-center rounded-lg ring-1 ring-inset", PLATFORM_STYLES[w.platform].chip)}>
                <PlatformIcon platform={w.platform} className="size-3.5" />
              </span>
              <p className="min-w-0 flex-1 truncate text-sm font-medium">{w.label}</p>
              <span className="hidden rounded-full bg-white px-2 py-0.5 text-[11px] font-medium text-muted ring-1 ring-sand sm:inline">{w.type}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="absolute -right-3 -bottom-10 hidden w-64 animate-fade-up rounded-2xl border border-sand bg-white p-4 shadow-lift [animation-delay:600ms] sm:block lg:-right-10">
        <div className="flex items-center gap-1.5 text-xs font-medium text-coral-600">
          <Sparkles className="size-3.5" /> Rewritten: more emotional
        </div>
        <p className="mt-2 font-display text-[15px] leading-snug font-medium">“She was the first person who asked what I wanted to do.”</p>
        <p className="mt-1.5 line-clamp-2 text-[13px] text-muted">One hour a week. That&apos;s all it took for someone to feel seen.</p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {["Make it shorter", "3 alternatives"].map((t) => (
            <span key={t} className="rounded-lg bg-cream px-2 py-1 text-[11px] font-medium text-muted ring-1 ring-sand">
              {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
