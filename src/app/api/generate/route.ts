import { NextResponse } from "next/server";
import { generateDrafts, generateMonth, refineDraft } from "@/lib/ai/generate";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createUserClient } from "@/lib/supabase/server";
import {
  CONTENT_TYPES,
  PLATFORMS,
  REFINEMENTS,
  TONES,
  type ContentDraft,
  type OrgContext,
} from "@/lib/types";

export const runtime = "nodejs";

type Body =
  | { action: "generate"; org: OrgContext; platform: string; contentType: string; tone: string; campaignId?: string | null; brief?: string; count?: number }
  | { action: "month"; org: OrgContext; year: number; month: number; fromDate?: string }
  | { action: "refine"; org: OrgContext; draft: ContentDraft; refinement: string; platform: string };

function bad(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

function oneOf<T extends string>(list: readonly T[], value: unknown): value is T {
  return typeof value === "string" && (list as readonly string[]).includes(value);
}

/**
 * When Supabase is configured, generation credits are checked and consumed
 * server-side via the `consume_generation` database function, so the limit
 * can't be bypassed from the browser. In demo mode the browser tracks usage.
 */
async function consumeCredit(req: Request): Promise<NextResponse | null> {
  if (!isSupabaseConfigured) return null;
  const token = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return bad("Please log in again.", 401);
  const { error } = await createUserClient(token).rpc("consume_generation");
  if (error) {
    if (error.message.includes("limit_reached")) {
      return bad("You've used all your AI generations for this month. Upgrade your plan to keep going.", 402);
    }
    return bad("We couldn't check your plan just now. Please try again.", 500);
  }
  return null;
}

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return bad("Invalid JSON body");
  }
  if (!body?.org?.name) return bad("Organisation profile is required");

  try {
    switch (body.action) {
      case "generate": {
        if (!oneOf(PLATFORMS, body.platform) || !oneOf(CONTENT_TYPES, body.contentType) || !oneOf(TONES, body.tone)) {
          return bad("Choose a platform, content type and tone");
        }
        const denied = await consumeCredit(req);
        if (denied) return denied;
        const count = body.count === 3 ? 3 : 1;
        const campaign = body.org.campaigns.find((c) => c.id === body.campaignId) ?? null;
        const result = await generateDrafts(
          { org: body.org, platform: body.platform, contentType: body.contentType, tone: body.tone, campaign, brief: body.brief?.slice(0, 500) },
          count,
        );
        return NextResponse.json(result);
      }
      case "month": {
        if (!Number.isInteger(body.year) || !Number.isInteger(body.month) || body.month < 1 || body.month > 12) {
          return bad("Invalid month");
        }
        const denied = await consumeCredit(req);
        if (denied) return denied;
        const result = await generateMonth(body.org, body.year, body.month, body.fromDate);
        return NextResponse.json(result);
      }
      case "refine": {
        // Refinements are free: they don't use a generation credit.
        if (!oneOf(REFINEMENTS, body.refinement) || !oneOf(PLATFORMS, body.platform) || !body.draft) {
          return bad("Invalid refinement request");
        }
        const result = await refineDraft(body.org, body.draft, body.refinement, body.platform);
        return NextResponse.json(result);
      }
      default:
        return bad("Unknown action");
    }
  } catch (err) {
    console.error("[api/generate]", err);
    return bad("Something went wrong while writing your content. Please try again.", 500);
  }
}
