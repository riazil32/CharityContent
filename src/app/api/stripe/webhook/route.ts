import { NextResponse } from "next/server";
import { planForPrice, verifyStripeSignature } from "@/lib/billing/stripe";
import { createServiceClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

/**
 * Stripe webhook: keeps organisations.plan in sync with subscriptions.
 * Point Stripe at https://<your-domain>/api/stripe/webhook and subscribe to
 * checkout.session.completed, customer.subscription.updated and
 * customer.subscription.deleted.
 */
export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const db = createServiceClient();
  if (!secret || !db) return NextResponse.json({ error: "Webhook not configured" }, { status: 501 });

  const payload = await req.text();
  if (!verifyStripeSignature(payload, req.headers.get("stripe-signature"), secret)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const event = JSON.parse(payload);
  const obj = event.data?.object ?? {};

  switch (event.type) {
    case "checkout.session.completed": {
      const orgId = obj.metadata?.org_id ?? obj.client_reference_id;
      const plan = obj.metadata?.plan;
      if (orgId && plan) {
        await db
          .from("organisations")
          .update({ plan, stripe_customer_id: obj.customer, stripe_subscription_id: obj.subscription })
          .eq("id", orgId);
      }
      break;
    }
    case "customer.subscription.updated": {
      const price = obj.items?.data?.[0]?.price?.id;
      const plan = price ? planForPrice(price) : null;
      const active = ["active", "trialing", "past_due"].includes(obj.status);
      await db
        .from("organisations")
        .update({ plan: active && plan ? plan : "free" })
        .eq("stripe_subscription_id", obj.id);
      break;
    }
    case "customer.subscription.deleted": {
      await db.from("organisations").update({ plan: "free", stripe_subscription_id: null }).eq("stripe_subscription_id", obj.id);
      break;
    }
  }

  return NextResponse.json({ received: true });
}
