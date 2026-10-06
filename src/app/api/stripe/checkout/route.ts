import { NextResponse } from "next/server";
import { isStripeConfigured, priceIdFor, stripeRequest } from "@/lib/billing/stripe";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createUserClient } from "@/lib/supabase/server";
import type { PlanId } from "@/lib/types";

export const runtime = "nodejs";

/** Creates a Stripe Checkout session for a paid plan. */
export async function POST(req: Request) {
  if (!isStripeConfigured() || !isSupabaseConfigured) {
    return NextResponse.json({ error: "Payments aren't set up yet.", code: "not_configured" }, { status: 501 });
  }
  const { plan } = (await req.json().catch(() => ({}))) as { plan?: PlanId };
  const price = plan ? priceIdFor(plan) : undefined;
  if (!plan || !price) return NextResponse.json({ error: "Unknown plan" }, { status: 400 });

  const token = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return NextResponse.json({ error: "Please log in again." }, { status: 401 });
  const sb = createUserClient(token);
  const { data: auth } = await sb.auth.getUser(token);
  const { data: org } = await sb.from("organisations").select("id, stripe_customer_id").maybeSingle();
  if (!auth.user || !org) return NextResponse.json({ error: "Organisation not found" }, { status: 404 });

  const origin = process.env.NEXT_PUBLIC_APP_URL || new URL(req.url).origin;
  try {
    const session = await stripeRequest<{ url: string }>("checkout/sessions", {
      mode: "subscription",
      "line_items[0][price]": price,
      "line_items[0][quantity]": "1",
      success_url: `${origin}/settings?tab=subscription&upgraded=1`,
      cancel_url: `${origin}/settings?tab=subscription`,
      client_reference_id: org.id,
      "metadata[org_id]": org.id,
      "metadata[plan]": plan,
      "subscription_data[metadata][org_id]": org.id,
      "subscription_data[metadata][plan]": plan,
      allow_promotion_codes: "true",
      ...(org.stripe_customer_id ? { customer: org.stripe_customer_id } : { customer_email: auth.user.email ?? "" }),
    });
    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[stripe/checkout]", err);
    return NextResponse.json({ error: "Couldn't start checkout. Please try again." }, { status: 500 });
  }
}
