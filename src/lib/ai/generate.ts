import "server-only";
/**
 * Single entry point for content generation. Uses OpenAI when configured and
 * falls back to the offline template engine otherwise (or if the API errors),
 * so the product never shows a broken state to a charity.
 */
import type { ContentDraft, OrgContext, Platform, Refinement } from "../types";
import { generateDraftsOpenAI, generateMonthOpenAI, isOpenAIConfigured, refineOpenAI } from "./openai";
import { generateWithTemplates, refineWithTemplates, type GenerateInput } from "./template-generator";
import { planMonth, type PlanSlot } from "./month-plan";

export type GenerationSource = "openai" | "demo";

export interface Result<T> {
  data: T;
  source: GenerationSource;
  warning?: string;
}

async function withFallback<T>(llm: () => Promise<T>, offline: () => T): Promise<Result<T>> {
  if (!isOpenAIConfigured()) return { data: offline(), source: "demo" };
  try {
    return { data: await llm(), source: "openai" };
  } catch (err) {
    console.error("[generate] OpenAI failed, using offline generator:", err);
    return { data: offline(), source: "demo", warning: "The AI service was unavailable, so we used the built-in writer." };
  }
}

export function generateDrafts(input: GenerateInput, count = 1): Promise<Result<ContentDraft[]>> {
  return withFallback(
    () => generateDraftsOpenAI(input, count),
    () => {
      // Use a different template for each alternative.
      const base = Math.floor(Math.random() * 12);
      return Array.from({ length: count }, (_, i) => generateWithTemplates({ ...input, variant: count > 1 ? base + i : undefined }));
    },
  );
}

export async function generateMonth(
  org: OrgContext,
  year: number,
  month: number,
  fromDate?: string,
): Promise<Result<{ slot: PlanSlot; draft: ContentDraft }[]>> {
  const slots = planMonth(org, year, month, fromDate);
  const seen: Record<string, number> = {};
  const offline = () =>
    slots.map((slot) => ({
      slot,
      draft: generateWithTemplates({
        org,
        platform: slot.platform,
        contentType: slot.contentType,
        tone: slot.tone,
        campaign: org.campaigns.find((c) => c.id === slot.campaignId) ?? null,
        keyDate: slot.keyDate,
        // Cycle templates within the month so posts don't repeat.
        variant: month + (seen[slot.contentType] = (seen[slot.contentType] ?? -1) + 1),
      }),
    }));
  return withFallback(async () => {
    const drafts = await generateMonthOpenAI(org, slots);
    return slots.map((slot, i) => ({ slot, draft: drafts[i] }));
  }, offline);
}

export function refineDraft(
  org: OrgContext,
  draft: ContentDraft,
  refinement: Refinement,
  platform: Platform,
): Promise<Result<ContentDraft>> {
  return withFallback(
    () => refineOpenAI(org, draft, refinement, platform),
    () => refineWithTemplates(draft, refinement, platform),
  );
}
