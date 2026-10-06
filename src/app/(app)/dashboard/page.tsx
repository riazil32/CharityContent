"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  CalendarHeart,
  FileText,
  FolderHeart,
  HandHeart,
  Megaphone,
  PartyPopper,
  Sparkles,
  Target,
  Users,
  Zap,
} from "lucide-react";
import { useApp } from "@/components/app-provider";
import { Badge, Button, ButtonLink, Card, CardHeader, EmptyState, PageHeader } from "@/components/ui";
import { PlatformBadge } from "@/components/post-preview";
import { ContentEditor } from "@/components/content-editor";
import { GenerateMonthModal } from "@/components/generate-month-modal";
import { CONTENT_TYPE_LABELS } from "@/lib/labels";
import { iso } from "@/lib/ai/month-plan";
import { awarenessDaysInMonth } from "@/lib/ai/awareness-days";
import { formatLongDate } from "@/lib/ai/text";
import type { ContentItem } from "@/lib/types";

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
}

function daysUntil(date: string) {
  const ms = new Date(`${date}T12:00:00`).getTime() - new Date(`${iso(new Date())}T12:00:00`).getTime();
  return Math.round(ms / 86_400_000);
}

function relative(date: string) {
  const d = daysUntil(date);
  if (d === 0) return "Today";
  if (d === 1) return "Tomorrow";
  if (d < 7) return new Date(`${date}T12:00:00`).toLocaleDateString("en-GB", { weekday: "long" });
  return new Date(`${date}T12:00:00`).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

const QUICK_ACTIONS = [
  { href: "/generate", label: "Write a single post", icon: Sparkles },
  { href: "/generate?type=fundraising_appeal", label: "Fundraising appeal", icon: HandHeart },
  { href: "/generate?type=volunteer_recruitment", label: "Recruit volunteers", icon: Users },
  { href: "/generate?type=event_promotion", label: "Promote an event", icon: Megaphone },
  { href: "/generate?type=newsletter", label: "Write a newsletter", icon: FileText },
  { href: "/library?favourites=1", label: "Favourite posts", icon: FolderHeart },
];

function Dashboard() {
  const { user, org, items, remaining } = useApp();
  const welcome = useSearchParams().get("welcome") === "1";
  const [monthOpen, setMonthOpen] = useState(false);
  const [editing, setEditing] = useState<ContentItem | null>(null);
  const today = iso(new Date());
  const monthPrefix = today.slice(0, 7);

  const stats = useMemo(() => {
    const thisMonth = items.filter((i) => i.scheduledFor?.startsWith(monthPrefix));
    const upcoming = items.filter((i) => i.scheduledFor && i.scheduledFor >= today).sort((a, b) => a.scheduledFor!.localeCompare(b.scheduledFor!));
    const nextWeek = upcoming.filter((i) => daysUntil(i.scheduledFor!) < 7);
    return { thisMonth, upcoming, nextWeek };
  }, [items, monthPrefix, today]);

  const upcomingDates = useMemo(() => {
    if (!org) return [];
    const now = new Date();
    const next = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const awareness = [
      ...awarenessDaysInMonth(now.getFullYear(), now.getMonth() + 1, org.causes),
      ...awarenessDaysInMonth(next.getFullYear(), next.getMonth() + 1, org.causes),
    ]
      .filter((a) => a.relevant)
      .map((a) => ({ name: a.name, date: a.date, kind: "Awareness day" as const }));
    const own = org.keyDates.map((k) => ({ name: k.name, date: k.date, kind: "Your event" as const }));
    return [...own, ...awareness]
      .filter((d) => d.date >= today && daysUntil(d.date) <= 60)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 5);
  }, [org, today]);

  if (!org) return null;
  const firstName = user?.fullName.split(" ")[0];

  return (
    <>
      <PageHeader
        title={`${greeting()}${firstName ? `, ${firstName}` : ""}`}
        description={
          <>
            Here&apos;s what&apos;s happening at <span className="font-medium text-ink">{org.name}</span>.
          </>
        }
        actions={
          <Button size="lg" onClick={() => setMonthOpen(true)}>
            <Sparkles className="size-4" /> Generate this month&apos;s content
          </Button>
        }
      />

      {(welcome || items.length === 0) && (
        <div className="mb-8 flex animate-fade-up flex-col gap-5 overflow-hidden rounded-3xl bg-brand-800 p-6 text-white sm:flex-row sm:items-center sm:p-8">
          <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-white/10">
            <PartyPopper className="size-6 text-coral-400" />
          </div>
          <div className="flex-1">
            <h2 className="font-display text-xl font-medium sm:text-2xl">Your profile is ready. Let&apos;s fill your calendar.</h2>
            <p className="mt-1 text-white/70">Generate a month of posts in one click, then tweak anything you like.</p>
          </div>
          <Button variant="accent" size="lg" onClick={() => setMonthOpen(true)}>
            Generate my first month <ArrowRight className="size-4" />
          </Button>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <Stat icon={CalendarDays} label="Content this month" value={stats.thisMonth.length} hint="posts planned" />
        <Stat icon={Zap} label="Coming up this week" value={stats.nextWeek.length} hint={`${stats.upcoming.length} upcoming in total`} />
        <Stat icon={Target} label="Current campaigns" value={org.campaigns.length} hint="active" />
        <Stat
          icon={Sparkles}
          label="AI generations left"
          value={remaining === null ? "∞" : remaining}
          hint={remaining === null ? "Unlimited on Growth" : "this month"}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <Card>
          <CardHeader
            title="Upcoming content"
            description="Your next scheduled posts"
            action={
              <ButtonLink href="/calendar" variant="ghost" size="sm">
                Calendar <ArrowRight className="size-3.5" />
              </ButtonLink>
            }
          />
          {stats.upcoming.length === 0 ? (
            <EmptyState
              icon={<CalendarDays className="size-5" />}
              title="Nothing scheduled yet"
              description="Generate a month of content and it will appear here."
              action={<Button onClick={() => setMonthOpen(true)}>Generate content</Button>}
            />
          ) : (
            <ul className="divide-y divide-sand px-2 pb-2">
              {stats.upcoming.slice(0, 6).map((item) => (
                <li key={item.id}>
                  <button onClick={() => setEditing(item)} className="flex w-full items-center gap-4 rounded-xl px-3 py-3 text-left transition-colors hover:bg-cream">
                    <div className="w-[4.5rem] shrink-0">
                      <p className="text-sm font-semibold">{relative(item.scheduledFor!)}</p>
                      <p className="text-xs text-muted">{new Date(`${item.scheduledFor}T12:00:00`).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</p>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[14.5px] font-medium">{item.headline}</p>
                      <p className="mt-0.5 truncate text-[13px] text-muted">{CONTENT_TYPE_LABELS[item.contentType]}</p>
                    </div>
                    <span className="hidden sm:block">
                      <PlatformBadge platform={item.platform} />
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader title="Quick actions" />
            <div className="grid grid-cols-2 gap-2 px-5 pb-5 sm:px-6">
              {QUICK_ACTIONS.map((a) => (
                <Link
                  key={a.href}
                  href={a.href}
                  className="group flex flex-col gap-2.5 rounded-xl border border-sand p-3 text-sm font-medium transition-all hover:border-brand-300 hover:bg-brand-50/40"
                >
                  <a.icon className="size-4.5 text-brand-600" />
                  {a.label}
                </Link>
              ))}
            </div>
          </Card>

          <Card>
            <CardHeader title="Important dates" description="Your events and relevant awareness days" />
            {upcomingDates.length === 0 ? (
              <p className="px-6 pb-6 text-sm text-muted">
                No dates in the next two months.{" "}
                <Link href="/settings?tab=organisation" className="font-medium text-brand-700 hover:underline">
                  Add an event
                </Link>
              </p>
            ) : (
              <ul className="space-y-1 px-3 pb-4">
                {upcomingDates.map((d) => (
                  <li key={d.name + d.date} className="flex items-center gap-3 rounded-xl px-3 py-2">
                    <CalendarHeart className={d.kind === "Your event" ? "size-4 text-coral-500" : "size-4 text-brand-500"} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{d.name}</p>
                      <p className="text-xs text-muted">{formatLongDate(d.date)}</p>
                    </div>
                    <Badge>{daysUntil(d.date) === 0 ? "Today" : `${daysUntil(d.date)}d`}</Badge>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>

      <Card className="mt-6">
        <CardHeader
          title="Current campaigns"
          description="Content is linked to these when you generate"
          action={
            <ButtonLink href="/settings?tab=organisation" variant="ghost" size="sm">
              Manage
            </ButtonLink>
          }
        />
        {org.campaigns.length === 0 ? (
          <EmptyState
            icon={<Target className="size-5" />}
            title="No campaigns yet"
            description="Add a campaign, such as an appeal or volunteer drive, and we'll weave it into your content."
            action={<ButtonLink href="/settings?tab=organisation">Add a campaign</ButtonLink>}
          />
        ) : (
          <div className="grid gap-4 px-5 pb-5 sm:px-6 md:grid-cols-2 xl:grid-cols-3">
            {org.campaigns.map((c) => {
              const count = items.filter((i) => i.campaignId === c.id).length;
              return (
                <div key={c.id} className="flex flex-col rounded-2xl border border-sand p-5">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-semibold">{c.name}</h3>
                    {c.endDate && daysUntil(c.endDate) >= 0 && <Badge className="bg-coral-50 text-coral-700 ring-coral-200">{daysUntil(c.endDate)} days left</Badge>}
                  </div>
                  <p className="mt-1.5 line-clamp-2 flex-1 text-sm text-muted">{c.description}</p>
                  {c.goal && (
                    <p className="mt-3 flex items-center gap-1.5 text-[13px] font-medium text-brand-800">
                      <Target className="size-3.5" /> Goal: {c.goal}
                    </p>
                  )}
                  <div className="mt-4 flex items-center justify-between border-t border-sand pt-3 text-sm">
                    <span className="text-muted">
                      {count} post{count === 1 ? "" : "s"}
                    </span>
                    <Link href={`/generate?campaign=${c.id}`} className="font-medium text-brand-700 hover:underline">
                      Create post
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <GenerateMonthModal open={monthOpen} onClose={() => setMonthOpen(false)} />
      <ContentEditor item={editing} onClose={() => setEditing(null)} />
    </>
  );
}

function Stat({ icon: Icon, label, value, hint }: { icon: typeof Sparkles; label: string; value: number | string; hint: string }) {
  return (
    <Card className="p-4 sm:p-5">
      <div className="flex items-center gap-2 text-[13px] font-medium text-muted">
        <Icon className="size-4 text-brand-600" />
        {label}
      </div>
      <p className="mt-3 font-display text-3xl font-medium tracking-tight">{value}</p>
      <p className="mt-0.5 text-xs text-muted">{hint}</p>
    </Card>
  );
}

export default function DashboardPage() {
  return (
    <Suspense>
      <Dashboard />
    </Suspense>
  );
}
