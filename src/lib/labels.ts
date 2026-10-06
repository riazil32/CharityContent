import type { ContentType, Platform, Refinement, Tone } from "./types";

export const PLATFORM_LABELS: Record<Platform, string> = {
  instagram: "Instagram",
  facebook: "Facebook",
  linkedin: "LinkedIn",
  x: "X",
};

/** Tailwind classes for platform chips. Kept muted so the calendar stays calm. */
export const PLATFORM_STYLES: Record<Platform, { chip: string; dot: string }> = {
  instagram: { chip: "bg-rose-50 text-rose-800 ring-rose-200", dot: "bg-rose-500" },
  facebook: { chip: "bg-blue-50 text-blue-800 ring-blue-200", dot: "bg-blue-600" },
  linkedin: { chip: "bg-sky-50 text-sky-900 ring-sky-200", dot: "bg-sky-700" },
  x: { chip: "bg-stone-100 text-stone-800 ring-stone-300", dot: "bg-stone-800" },
};

export const CONTENT_TYPE_LABELS: Record<ContentType, string> = {
  social_post: "Social post",
  event_promotion: "Event promotion",
  fundraising_appeal: "Fundraising appeal",
  awareness_post: "Awareness post",
  volunteer_recruitment: "Volunteer recruitment",
  success_story: "Success story",
  newsletter: "Newsletter / email",
};

export const TONE_LABELS: Record<Tone, string> = {
  professional: "Professional",
  friendly: "Friendly",
  inspiring: "Inspiring",
  urgent: "Urgent",
  educational: "Educational",
};

export const REFINEMENT_LABELS: Record<Refinement, string> = {
  engaging: "Make it more engaging",
  shorter: "Make it shorter",
  professional: "Make it more professional",
  emotional: "Make it more emotional",
};

export const ORG_TYPES = [
  "Registered charity",
  "Charitable incorporated organisation (CIO)",
  "Community interest company (CIC)",
  "Community group",
  "Social enterprise",
  "Faith-based organisation",
  "Sports or arts club",
  "Other non-profit",
];

/** Rough character guidance per platform, used by generator and preview. */
export const PLATFORM_LIMITS: Record<Platform, number> = {
  instagram: 2200,
  facebook: 63206,
  linkedin: 3000,
  x: 280,
};
