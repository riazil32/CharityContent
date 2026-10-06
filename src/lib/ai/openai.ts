import "server-only";
/**
 * OpenAI integration. Active only when OPENAI_API_KEY is set.
 * Uses the Chat Completions REST API directly so there is no SDK to keep in sync.
 */
import type { ContentDraft, OrgContext, Platform, Refinement } from "../types";
import { CONTENT_TYPE_LABELS, PLATFORM_LABELS, REFINEMENT_LABELS, TONE_LABELS } from "../labels";
import type { GenerateInput } from "./template-generator";
import type { PlanSlot } from "./month-plan";

export function isOpenAIConfigured(): boolean {
  return Boolean(process.env.OPENAI_API_KEY);
}

const MODEL = () => process.env.OPENAI_MODEL || "gpt-4o-mini";

function systemPrompt(org: OrgContext): string {
  const prefs = org.aiPreferences;
  const campaigns = org.campaigns
    .map((c) => `- ${c.name}: ${c.description}${c.goal ? ` (goal: ${c.goal})` : ""}${c.endDate ? ` (ends ${c.endDate})` : ""}`)
    .join("\n");
  const dates = org.keyDates.map((k) => `- ${k.date}: ${k.name}${k.description ? ` (${k.description})` : ""}`).join("\n");
  return `You are CharityContent, an experienced communications manager for small UK charities.
You write social media posts and emails that are warm, specific, honest and never cheesy.

Rules:
- Write in ${prefs.britishEnglish ? "British English (UK spelling, £, UK dates)" : "clear English"}.
- Never invent statistics, quotes or named beneficiaries. If a story is illustrative, say names are changed.
- Respect dignity: no poverty-porn, no guilt-tripping, no "helpless" language.
- Emoji use: ${prefs.emojiLevel}.${prefs.avoidWords ? `\n- Never use these words: ${prefs.avoidWords}.` : ""}
- Use around ${prefs.hashtagCount} relevant hashtags (fewer on X and LinkedIn), each starting with #.
- Match each platform: Instagram (visual, line breaks, "link in bio"), Facebook (conversational, community), LinkedIn (professional, impact-focused, minimal emoji), X (under 280 characters including hashtags).

The charity:
Name: ${org.name}
Type: ${org.type}
What they do: ${org.description}
Who they help: ${org.audience}
Website: ${org.website || "none"}
Key causes: ${org.causes.join(", ") || "not specified"}
Default tone: ${TONE_LABELS[org.tone]}${org.toneNotes ? ` (${org.toneNotes})` : ""}
Current campaigns:
${campaigns || "- none"}
Upcoming dates:
${dates || "- none"}

Always reply with JSON only.`;
}

const DRAFT_SHAPE = `{"headline": string, "caption": string, "cta": string, "hashtags": string[], "imageIdea": string}`;

async function chatJSON<T>(system: string, user: string): Promise<T> {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL(),
      temperature: 0.8,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OpenAI request failed (${res.status}): ${text.slice(0, 300)}`);
  }
  const data = await res.json();
  return JSON.parse(data.choices?.[0]?.message?.content ?? "{}") as T;
}

function normalise(d: Partial<ContentDraft>): ContentDraft {
  return {
    headline: String(d.headline ?? "").trim(),
    caption: String(d.caption ?? "").trim(),
    cta: String(d.cta ?? "").trim(),
    hashtags: (Array.isArray(d.hashtags) ? d.hashtags : [])
      .map((h) => String(h).trim())
      .filter(Boolean)
      .map((h) => (h.startsWith("#") ? h : `#${h}`)),
    imageIdea: String(d.imageIdea ?? "").trim(),
  };
}

function describe(input: Pick<GenerateInput, "platform" | "contentType" | "tone" | "campaign" | "keyDate" | "brief">): string {
  return [
    `Platform: ${PLATFORM_LABELS[input.platform]}`,
    `Content type: ${CONTENT_TYPE_LABELS[input.contentType]}`,
    `Tone: ${TONE_LABELS[input.tone]}`,
    input.campaign ? `Campaign: ${input.campaign.name} (${input.campaign.description})` : "Campaign: general / none",
    input.keyDate ? `Related date: ${input.keyDate.name} on ${input.keyDate.date}` : "",
    input.brief ? `Extra instructions from the charity: ${input.brief}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

export async function generateDraftsOpenAI(input: GenerateInput, count: number): Promise<ContentDraft[]> {
  const user = `Write ${count} distinct option(s) for this piece of content.
${describe(input)}
${input.contentType === "newsletter" ? "For a newsletter, the headline is the email subject line and the caption is the full email body with short sections." : ""}
Reply as {"drafts": [${DRAFT_SHAPE}]}.`;
  const out = await chatJSON<{ drafts: Partial<ContentDraft>[] }>(systemPrompt(input.org), user);
  const drafts = (out.drafts ?? []).map(normalise).filter((d) => d.caption);
  if (!drafts.length) throw new Error("OpenAI returned no drafts");
  return drafts.slice(0, count);
}

export async function generateMonthOpenAI(
  org: OrgContext,
  slots: PlanSlot[],
): Promise<ContentDraft[]> {
  const list = slots
    .map((s, i) => {
      const campaign = org.campaigns.find((c) => c.id === s.campaignId);
      return `${i + 1}. ${s.date} | ${PLATFORM_LABELS[s.platform]} | ${CONTENT_TYPE_LABELS[s.contentType]} | tone: ${TONE_LABELS[s.tone]}${campaign ? ` | campaign: ${campaign.name}` : ""}${s.keyDate ? ` | about: ${s.keyDate.name} (${s.keyDate.date})` : ""}`;
    })
    .join("\n");
  const user = `Plan a month of content. Write one piece for each slot below, in the same order, varied so the feed never feels repetitive.
${list}
Reply as {"items": [${DRAFT_SHAPE}]} with exactly ${slots.length} items.`;
  const out = await chatJSON<{ items: Partial<ContentDraft>[] }>(systemPrompt(org), user);
  const items = (out.items ?? []).map(normalise);
  if (items.length < slots.length) throw new Error("OpenAI returned too few items");
  return items.slice(0, slots.length);
}

export async function refineOpenAI(
  org: OrgContext,
  draft: ContentDraft,
  refinement: Refinement,
  platform: Platform,
): Promise<ContentDraft> {
  const user = `Rewrite this ${PLATFORM_LABELS[platform]} content. Instruction: ${REFINEMENT_LABELS[refinement]}.
Keep the facts the same.
Current version:
${JSON.stringify(draft)}
Reply with a single object: ${DRAFT_SHAPE}`;
  const out = await chatJSON<Partial<ContentDraft>>(systemPrompt(org), user);
  return normalise(out);
}
