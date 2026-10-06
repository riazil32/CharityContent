/**
 * Builds a month-long posting plan (dates, platforms, content types) from the
 * organisation profile. The plan is deterministic; the copy for each slot is
 * then written by the template generator or the LLM.
 */
import type { ContentType, KeyDate, OrgContext, Platform, Tone } from "../types";
import { awarenessDaysInMonth } from "./awareness-days";

export interface PlanSlot {
  date: string; // YYYY-MM-DD
  platform: Platform;
  contentType: ContentType;
  tone: Tone;
  campaignId: string | null;
  keyDate: KeyDate | null;
}

const ROTATION: ContentType[] = [
  "awareness_post",
  "success_story",
  "volunteer_recruitment",
  "fundraising_appeal",
  "social_post",
  "success_story",
  "fundraising_appeal",
  "volunteer_recruitment",
];

// Monday, Wednesday, Friday, Sunday: a sustainable rhythm for a small team.
const POSTING_DAYS = [1, 3, 5, 0];

export function iso(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function addDays(dateIso: string, days: number): string {
  const d = new Date(`${dateIso}T12:00:00`);
  d.setDate(d.getDate() + days);
  return iso(d);
}

function platformFor(platforms: Platform[], weekday: number, index: number): Platform {
  const list = platforms.length ? platforms : (["instagram", "facebook"] as Platform[]);
  // LinkedIn performs best mid-week, so steer it to Wednesday/Friday when available.
  if (list.includes("linkedin") && weekday === 5) return "linkedin";
  const nonLinkedIn = list.filter((p) => p !== "linkedin");
  const pool = weekday === 0 || weekday === 6 ? (nonLinkedIn.length ? nonLinkedIn : list) : list;
  return pool[index % pool.length];
}

/**
 * @param fromDate Only plan slots on or after this date (e.g. today).
 */
export function planMonth(org: OrgContext, year: number, month: number, fromDate?: string): PlanSlot[] {
  const start = `${year}-${String(month).padStart(2, "0")}-01`;
  const daysInMonth = new Date(year, month, 0).getDate();
  const end = `${year}-${String(month).padStart(2, "0")}-${String(daysInMonth).padStart(2, "0")}`;
  const from = fromDate && fromDate > start ? fromDate : start;

  const campaigns = org.campaigns;
  const volunteerCampaign = campaigns.find((c) => /volunteer|mentor|befriend/i.test(`${c.name} ${c.description}`));
  const fundraisingCampaigns = campaigns.filter((c) => c !== volunteerCampaign);
  const toneFor = (type: ContentType, campaignEnd?: string | null): Tone => {
    if (type === "awareness_post" && org.tone === "professional") return "educational";
    if (type === "fundraising_appeal" && campaignEnd && campaignEnd <= end) return "urgent";
    if (type === "success_story" && org.tone === "friendly") return "inspiring";
    return org.tone;
  };

  const slots = new Map<string, PlanSlot>();

  // 1. Regular rhythm.
  let i = 0;
  let fundIdx = 0;
  let otherIdx = 0;
  for (let day = 1; day <= daysInMonth; day++) {
    const d = new Date(year, month - 1, day, 12);
    const date = iso(d);
    if (date < from || !POSTING_DAYS.includes(d.getDay())) continue;
    const contentType = ROTATION[i % ROTATION.length];
    let campaign = null as (typeof campaigns)[number] | null;
    if (contentType === "fundraising_appeal" && fundraisingCampaigns.length) {
      campaign = fundraisingCampaigns[fundIdx++ % fundraisingCampaigns.length];
    } else if (contentType === "volunteer_recruitment") {
      campaign = volunteerCampaign ?? null;
    } else if (campaigns.length && otherIdx++ % 2 === 0) {
      campaign = campaigns[otherIdx % campaigns.length];
    }
    slots.set(date, {
      date,
      platform: platformFor(org.platforms, d.getDay(), i),
      contentType,
      tone: toneFor(contentType, campaign?.endDate),
      campaignId: campaign?.id ?? null,
      keyDate: null,
    });
    i++;
  }

  // 2. Monthly newsletter on the first Thursday that's still ahead.
  for (let day = 1; day <= daysInMonth; day++) {
    const d = new Date(year, month - 1, day, 12);
    if (d.getDay() === 4 && iso(d) >= from) {
      slots.set(iso(d), {
        date: iso(d),
        platform: org.platforms.includes("facebook") ? "facebook" : org.platforms[0] ?? "facebook",
        contentType: "newsletter",
        tone: org.tone === "urgent" ? "friendly" : org.tone,
        campaignId: campaigns[0]?.id ?? null,
        keyDate: org.keyDates.find((k) => k.date >= iso(d) && k.date <= end) ?? null,
      });
      break;
    }
  }

  // 3. Relevant awareness days (max two per month).
  awarenessDaysInMonth(year, month, org.causes)
    .filter((a) => a.relevant && a.date >= from)
    .slice(0, 2)
    .forEach((a, idx) => {
      slots.set(a.date, {
        date: a.date,
        platform: platformFor(org.platforms, new Date(`${a.date}T12:00:00`).getDay(), idx),
        contentType: "awareness_post",
        tone: "educational",
        campaignId: null,
        keyDate: { id: `awareness-${a.date}`, name: a.name, date: a.date },
      });
    });

  // 4. The charity's own events: a heads-up a week before and a reminder on the day.
  for (const k of org.keyDates) {
    if (k.date < start || k.date > addDays(end, 7)) continue;
    const reminders = [addDays(k.date, -7), addDays(k.date, -1)];
    reminders.forEach((date, idx) => {
      if (date < from || date > end) return;
      slots.set(date, {
        date,
        platform: idx === 0 ? platformFor(org.platforms, 3, 1) : platformFor(org.platforms, 0, 0),
        contentType: "event_promotion",
        tone: idx === 0 ? org.tone : "friendly",
        campaignId: null,
        keyDate: k,
      });
    });
  }

  return [...slots.values()].sort((a, b) => a.date.localeCompare(b.date));
}
