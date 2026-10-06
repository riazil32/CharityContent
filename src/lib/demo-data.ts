/**
 * Demo data for the fictional charity HopeBridge Community Trust.
 * Dates are relative to today so the dashboard and calendar always look live.
 */
import type { AiPreferences, ContentItem, Organisation } from "./types";
import { planMonth, iso } from "./ai/month-plan";
import { generateWithTemplates } from "./ai/template-generator";
import { hashString } from "./ai/text";
import { currentPeriod } from "./plans";

export const DEMO_EMAIL = "demo@hopebridge.org.uk";
export const DEMO_PASSWORD = "hopebridge-demo";

export const DEFAULT_AI_PREFERENCES: AiPreferences = {
  emojiLevel: "light",
  hashtagCount: 5,
  britishEnglish: true,
  alwaysIncludeWebsite: false,
  avoidWords: "",
};

function relDate(days: number): string {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() + days);
  return iso(d);
}

function nextWeekday(fromDays: number, weekday: number): string {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() + fromDays);
  while (d.getDay() !== weekday) d.setDate(d.getDate() + 1);
  return iso(d);
}

export function demoOrganisation(id: string): Organisation {
  return {
    id,
    name: "HopeBridge Community Trust",
    type: "Registered charity",
    description:
      "Supporting disadvantaged families and young people across the UK through food support, youth mentoring and practical help with the cost of living",
    audience: "Families on low incomes and young people aged 11 to 18 who need a trusted adult in their corner",
    website: "https://www.hopebridgetrust.org.uk",
    platforms: ["instagram", "facebook", "linkedin"],
    tone: "friendly",
    toneNotes: "Warm and down to earth. Never pitying. We talk with people, not about them.",
    causes: ["child poverty", "youth mentoring", "food insecurity", "cost of living"],
    campaigns: [
      {
        id: "camp-winter",
        name: "Warm Winter Appeal",
        description: "Funding winter hardship grants, warm packs and hot meals for families struggling with energy bills",
        goal: "raise £15,000 by the end of December",
        endDate: relDate(80),
      },
      {
        id: "camp-mentor",
        name: "Mentor a Young Person",
        description: "Recruiting volunteer mentors to meet a young person for an hour a week",
        goal: "recruit 25 new volunteer mentors",
        endDate: null,
      },
      {
        id: "camp-pantry",
        name: "Community Pantry",
        description: "Our weekly pay-as-you-feel pantry, open every Thursday at the HopeBridge hub",
        goal: "keep the shelves stocked every week",
        endDate: null,
      },
    ],
    keyDates: [
      {
        id: "kd-open-evening",
        name: "Volunteer Open Evening",
        date: nextWeekday(8, 3),
        description: "Drop in from 6pm at the HopeBridge hub to meet the team and hear about volunteering",
      },
      {
        id: "kd-fun-run",
        name: "HopeBridge 5k Fun Run",
        date: nextWeekday(16, 6),
        description: "A family-friendly 5k in Roundhay Park raising money for the Warm Winter Appeal",
      },
      {
        id: "kd-coat-drive",
        name: "Winter Coat Drive",
        date: nextWeekday(30, 6),
        description: "Donate good-quality winter coats for children and adults at any of our drop-off points",
      },
    ],
    aiPreferences: { ...DEFAULT_AI_PREFERENCES },
    plan: "growth",
    generationsPeriod: currentPeriod(),
    generationsUsed: 23,
    createdAt: relDate(-60),
  };
}

const HANDWRITTEN: Omit<ContentItem, "id" | "orgId" | "createdAt" | "updatedAt">[] = [
  {
    platform: "instagram",
    contentType: "success_story",
    tone: "inspiring",
    campaignId: "camp-mentor",
    scheduledFor: relDate(-12),
    favourite: true,
    headline: "“She was the first person who asked what I wanted to do.”",
    caption:
      "When Jay* was matched with their mentor, Priya, they hadn't been to school for six weeks.\n\nThey met every Tuesday at the library. Some weeks they talked about college. Some weeks they just talked.\n\nEight months on, Jay is back in the classroom and has just started a Level 2 course in motor mechanics. 🔧\n\nOne hour a week. That's all it took for someone to feel seen.\n\n*Name changed to protect privacy. Shared with permission.",
    cta: "Could you be someone's Priya? Find out about mentoring via the link in our bio.",
    hashtags: ["#YouthMentoring", "#MentorAYoungPerson", "#HopeBridge", "#VolunteerUK", "#ImpactStory"],
    imageIdea:
      "Two mugs on a library table next to an open notebook. No faces needed; the quiet detail tells the story.",
  },
  {
    platform: "facebook",
    contentType: "fundraising_appeal",
    tone: "urgent",
    campaignId: "camp-winter",
    scheduledFor: relDate(2),
    favourite: true,
    headline: "£25 keeps a family warm for a week",
    caption:
      "This winter, one in four of the families we support told us they'd have to choose between heating and eating.\n\nOur Warm Winter Appeal provides emergency energy top-ups, warm packs (blankets, hats, flasks) and hot meals at our hub.\n\nWe're 62% of the way to our £15,000 target. With your help, we can make sure no family in our community spends this winter in the cold.",
    cta: "Donate to the Warm Winter Appeal at hopebridgetrust.org.uk/winter",
    hashtags: ["#WarmWinterAppeal", "#CostOfLiving", "#ChildPoverty"],
    imageIdea:
      "A volunteer's hands packing a warm pack: a folded blanket, a knitted hat and a flask, shot from above on a wooden table.",
  },
  {
    platform: "linkedin",
    contentType: "volunteer_recruitment",
    tone: "professional",
    campaignId: "camp-mentor",
    scheduledFor: relDate(5),
    favourite: false,
    headline: "Employers: give your team a skills-based volunteering opportunity",
    caption:
      "Our Mentor a Young Person programme pairs professionals with young people aged 11 to 18 who need a trusted adult in their corner.\n\nMentors commit one hour a week for six months. We provide safeguarding training, DBS checks and ongoing support.\n\nLast year, 82% of mentored young people reported feeling more confident about their future.\n\nWe're looking for 25 new mentors this term, and we'd love to partner with employers who want to make volunteering part of their culture.",
    cta: "Get in touch to discuss an employer volunteering partnership.",
    hashtags: ["#EmployeeVolunteering", "#YouthMentoring", "#CorporateSocialResponsibility"],
    imageIdea:
      "A professional, natural photo of a mentor and young person walking and talking, taken from behind with consent.",
  },
  {
    platform: "instagram",
    contentType: "social_post",
    tone: "friendly",
    campaignId: "camp-pantry",
    scheduledFor: relDate(-3),
    favourite: false,
    headline: "🥫 Thursday is Pantry Day!",
    caption:
      "Our Community Pantry is open every Thursday from 10am to 2pm at the HopeBridge hub.\n\nIt's pay-as-you-feel, no referral needed, and the kettle's always on. ☕\n\nThis week we've got fresh veg from our friends at Kirkgate Market, plus tins, pasta, toiletries and nappies.\n\nPlease share with anyone who might need us.",
    cta: "Pop in this Thursday. Everyone is welcome.",
    hashtags: ["#CommunityPantry", "#FoodInsecurity", "#HopeBridge", "#Leeds"],
    imageIdea: "Brightly stocked pantry shelves with a hand-written chalkboard sign: 'Take what you need'.",
  },
];

/** Builds a realistic content history: last month, this month and part of next. */
export function demoContent(org: Organisation): ContentItem[] {
  const now = new Date();
  const items: ContentItem[] = [];
  const stamp = (offset: number) => {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    return d.toISOString();
  };

  const months = [
    { y: now.getFullYear(), m: now.getMonth() + 1 },
    { y: now.getMonth() === 11 ? now.getFullYear() + 1 : now.getFullYear(), m: now.getMonth() === 11 ? 1 : now.getMonth() + 2 },
  ];
  months.forEach(({ y, m }, monthIdx) => {
    const slots = planMonth(org, y, m);
    // Only pre-fill the first half of next month so there's something left to generate.
    const slice = monthIdx === 0 ? slots : slots.slice(0, Math.ceil(slots.length / 3));
    const seen: Record<string, number> = {};
    slice.forEach((slot) => {
      const draft = generateWithTemplates({
        org,
        platform: slot.platform,
        contentType: slot.contentType,
        tone: slot.tone,
        campaign: org.campaigns.find((c) => c.id === slot.campaignId) ?? null,
        keyDate: slot.keyDate,
        seed: hashString(`${slot.date}-${slot.contentType}`),
        variant: m + (seen[slot.contentType] = (seen[slot.contentType] ?? -1) + 1),
      });
      items.push({
        ...draft,
        id: `demo-${slot.date}-${slot.contentType}`,
        orgId: org.id,
        campaignId: slot.campaignId,
        platform: slot.platform,
        contentType: slot.contentType,
        tone: slot.tone,
        scheduledFor: slot.date,
        favourite: false,
        createdAt: stamp(-20),
        updatedAt: stamp(-20),
      });
    });
  });

  // Hand-written showcase posts replace any generated post on the same day.
  HANDWRITTEN.forEach((h, idx) => {
    const clash = items.findIndex((i) => i.scheduledFor === h.scheduledFor);
    if (clash >= 0) items.splice(clash, 1);
    items.push({ ...h, id: `demo-hand-${idx}`, orgId: org.id, createdAt: stamp(-15 + idx), updatedAt: stamp(-15 + idx) });
  });

  return items.sort((a, b) => (a.scheduledFor ?? "").localeCompare(b.scheduledFor ?? ""));
}

/** Sample profile used by the "Fill with example" button during onboarding. */
export function exampleOnboardingProfile(): Partial<Organisation> {
  const o = demoOrganisation("example");
  return {
    name: o.name,
    type: o.type,
    description: o.description,
    audience: o.audience,
    website: o.website,
    platforms: o.platforms,
    tone: o.tone,
    toneNotes: o.toneNotes,
    causes: o.causes,
    campaigns: o.campaigns,
    keyDates: o.keyDates,
  };
}
