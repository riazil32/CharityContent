import clsx from "clsx";
import { Check } from "lucide-react";
import type { ReactNode } from "react";
import { PLANS, type Plan } from "@/lib/plans";
import { ButtonLink } from "./ui";

export function PricingCards({
  renderAction,
  currentPlan,
}: {
  /** Override the CTA (used inside the app for upgrades). */
  renderAction?: (plan: Plan) => ReactNode;
  currentPlan?: Plan["id"];
}) {
  return (
    <div className="grid gap-5 lg:grid-cols-3">
      {PLANS.map((plan) => (
        <div
          key={plan.id}
          className={clsx(
            "relative flex flex-col rounded-3xl border bg-white p-6 sm:p-7",
            plan.highlighted ? "border-brand-600 shadow-lift ring-4 ring-brand-500/10" : "border-sand shadow-card",
          )}
        >
          {plan.highlighted && (
            <span className="absolute -top-3 left-6 rounded-full bg-brand-700 px-3 py-1 text-xs font-semibold text-white">
              Most popular
            </span>
          )}
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">{plan.name}</h3>
            {currentPlan === plan.id && (
              <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-800">Current plan</span>
            )}
          </div>
          <p className="mt-1 text-sm text-muted">{plan.tagline}</p>
          <p className="mt-5 flex items-baseline gap-1">
            <span className="font-display text-4xl font-medium tracking-tight">£{plan.price}</span>
            <span className="text-sm text-muted">/ month</span>
          </p>
          <ul className="mt-6 flex-1 space-y-3">
            {plan.features.map((f) => (
              <li key={f} className="flex gap-2.5 text-[15px]">
                <Check className="mt-0.5 size-4.5 shrink-0 text-brand-600" />
                {f}
              </li>
            ))}
          </ul>
          <div className="mt-7">
            {renderAction ? (
              renderAction(plan)
            ) : (
              <ButtonLink
                href={`/signup${plan.id === "free" ? "" : `?plan=${plan.id}`}`}
                variant={plan.highlighted ? "primary" : "outline"}
                size="lg"
                className="w-full"
              >
                {plan.id === "free" ? "Create your first month free" : `Start with ${plan.name}`}
              </ButtonLink>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
