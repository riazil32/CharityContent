export const PLATFORMS = ["instagram", "facebook", "linkedin", "x"] as const;
export type Platform = (typeof PLATFORMS)[number];

export const CONTENT_TYPES = [
  "social_post",
  "event_promotion",
  "fundraising_appeal",
  "awareness_post",
  "volunteer_recruitment",
  "success_story",
  "newsletter",
] as const;
export type ContentType = (typeof CONTENT_TYPES)[number];

export const TONES = ["professional", "friendly", "inspiring", "urgent", "educational"] as const;
export type Tone = (typeof TONES)[number];

export const REFINEMENTS = ["engaging", "shorter", "professional", "emotional"] as const;
export type Refinement = (typeof REFINEMENTS)[number];

export type PlanId = "free" | "starter" | "growth";

export interface Campaign {
  id: string;
  name: string;
  description: string;
  goal?: string;
  endDate?: string | null;
}

export interface KeyDate {
  id: string;
  name: string;
  date: string; // YYYY-MM-DD
  description?: string;
}

export interface AiPreferences {
  emojiLevel: "none" | "light" | "moderate";
  hashtagCount: number;
  britishEnglish: boolean;
  alwaysIncludeWebsite: boolean;
  avoidWords: string;
}

export interface Organisation {
  id: string;
  name: string;
  type: string;
  description: string;
  audience: string;
  website: string;
  platforms: Platform[];
  tone: Tone;
  toneNotes: string;
  causes: string[];
  campaigns: Campaign[];
  keyDates: KeyDate[];
  aiPreferences: AiPreferences;
  plan: PlanId;
  generationsPeriod: string; // YYYY-MM
  generationsUsed: number;
  createdAt: string;
}

export interface ContentDraft {
  headline: string;
  caption: string;
  cta: string;
  hashtags: string[];
  imageIdea: string;
}

export interface ContentItem extends ContentDraft {
  id: string;
  orgId: string;
  campaignId: string | null;
  platform: Platform;
  contentType: ContentType;
  tone: Tone;
  scheduledFor: string | null; // YYYY-MM-DD
  favourite: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AppUser {
  id: string;
  email: string;
  fullName: string;
}

/** Shape the generator needs to know about the charity. */
export type OrgContext = Pick<
  Organisation,
  | "name"
  | "type"
  | "description"
  | "audience"
  | "website"
  | "tone"
  | "toneNotes"
  | "causes"
  | "campaigns"
  | "keyDates"
  | "aiPreferences"
  | "platforms"
>;
