"use client";

import clsx from "clsx";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { Bell, Building2, CreditCard, Link2, RotateCcw, Sparkles, UserRound } from "lucide-react";
import { useApp } from "@/components/app-provider";
import { Badge, Button, Card, CardHeader, Field, Input, PageHeader, Select, Textarea, Toggle } from "@/components/ui";
import { CampaignEditor, KeyDateEditor, PlatformPicker, TagInput, TonePicker } from "@/components/org-fields";
import { PricingCards } from "@/components/pricing-cards";
import { PlatformIcon } from "@/components/brand";
import { useToast } from "@/components/toast";
import { backend } from "@/lib/data";
import { ORG_TYPES, PLATFORM_LABELS } from "@/lib/labels";
import { getPlan } from "@/lib/plans";
import { PLATFORMS, type Organisation, type PlanId } from "@/lib/types";

const TABS = [
  { id: "organisation", label: "Organisation profile", icon: Building2 },
  { id: "ai", label: "AI & tone of voice", icon: Sparkles },
  { id: "subscription", label: "Subscription", icon: CreditCard },
  { id: "platforms", label: "Connected platforms", icon: Link2 },
  { id: "account", label: "Account", icon: UserRound },
] as const;
type TabId = (typeof TABS)[number]["id"];

function Settings() {
  const params = useSearchParams();
  const router = useRouter();
  const tab = (TABS.find((t) => t.id === params.get("tab"))?.id ?? "organisation") as TabId;

  return (
    <>
      <PageHeader title="Settings" description="Manage your organisation, AI preferences and plan." />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
        <nav className="scroll-thin -mx-4 flex gap-1 overflow-x-auto px-4 lg:mx-0 lg:flex-col lg:px-0">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => router.replace(`/settings?tab=${t.id}`, { scroll: false })}
              className={clsx(
                "flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors",
                tab === t.id ? "bg-white text-brand-800 shadow-card ring-1 ring-sand" : "text-muted hover:text-ink",
              )}
            >
              <t.icon className="size-4" />
              {t.label}
            </button>
          ))}
        </nav>
        <div key={tab} className="min-w-0 animate-fade-in">
          {tab === "organisation" && <OrganisationTab />}
          {tab === "ai" && <AiTab />}
          {tab === "subscription" && <SubscriptionTab />}
          {tab === "platforms" && <PlatformsTab />}
          {tab === "account" && <AccountTab />}
        </div>
      </div>
    </>
  );
}

function useOrgDraft() {
  const { org, saveOrganisation } = useApp();
  const toast = useToast();
  const [draft, setDraft] = useState<Organisation | null>(org);
  const [saving, setSaving] = useState(false);
  useEffect(() => setDraft(org), [org]);
  const set = <K extends keyof Organisation>(k: K, v: Organisation[K]) => setDraft((d) => (d ? { ...d, [k]: v } : d));
  const save = async (fields: (keyof Organisation)[]) => {
    if (!draft) return;
    setSaving(true);
    try {
      await saveOrganisation(Object.fromEntries(fields.map((f) => [f, draft[f]])));
      toast("Settings saved");
    } catch (e) {
      toast((e as Error).message, "error");
    } finally {
      setSaving(false);
    }
  };
  return { draft, set, save, saving };
}

function SaveBar({ onSave, saving }: { onSave: () => void; saving: boolean }) {
  return (
    <div className="flex justify-end border-t border-sand px-5 py-4 sm:px-6">
      <Button onClick={onSave} loading={saving}>
        Save changes
      </Button>
    </div>
  );
}

function OrganisationTab() {
  const { draft, set, save, saving } = useOrgDraft();
  if (!draft) return null;
  const fields: (keyof Organisation)[] = ["name", "type", "website", "description", "audience", "causes", "platforms", "campaigns", "keyDates"];
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader title="About your organisation" description="Used in every piece of content we write for you." />
        <div className="grid gap-5 px-5 pb-6 sm:grid-cols-2 sm:px-6">
          <Field label="Organisation name">
            <Input value={draft.name} onChange={(e) => set("name", e.target.value)} />
          </Field>
          <Field label="Organisation type">
            <Select value={draft.type} onChange={(e) => set("type", e.target.value)}>
              <option value="">Choose one…</option>
              {ORG_TYPES.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </Select>
          </Field>
          <Field label="What you do" className="sm:col-span-2">
            <Textarea value={draft.description} onChange={(e) => set("description", e.target.value)} />
          </Field>
          <Field label="Who you help" className="sm:col-span-2">
            <Textarea rows={2} className="min-h-0" value={draft.audience} onChange={(e) => set("audience", e.target.value)} />
          </Field>
          <Field label="Website">
            <Input type="url" value={draft.website} onChange={(e) => set("website", e.target.value)} />
          </Field>
          <Field label="Main platforms">
            <PlatformPicker value={draft.platforms} onChange={(v) => set("platforms", v)} />
          </Field>
          <Field label="Key causes and issues" className="sm:col-span-2">
            <TagInput value={draft.causes} onChange={(v) => set("causes", v)} placeholder="e.g. child poverty" />
          </Field>
        </div>
        <SaveBar onSave={() => save(fields)} saving={saving} />
      </Card>
      <Card>
        <CardHeader title="Current campaigns" description="Appeals, drives and projects to weave into your content." />
        <div className="px-5 pb-6 sm:px-6">
          <CampaignEditor value={draft.campaigns} onChange={(v) => set("campaigns", v)} />
        </div>
        <SaveBar onSave={() => save(fields)} saving={saving} />
      </Card>
      <Card>
        <CardHeader title="Important dates" description="Events we'll remind your followers about in advance." />
        <div className="px-5 pb-6 sm:px-6">
          <KeyDateEditor value={draft.keyDates} onChange={(v) => set("keyDates", v)} />
        </div>
        <SaveBar onSave={() => save(fields)} saving={saving} />
      </Card>
    </div>
  );
}

function AiTab() {
  const { draft, set, save, saving } = useOrgDraft();
  if (!draft) return null;
  const prefs = draft.aiPreferences;
  const setPref = <K extends keyof typeof prefs>(k: K, v: (typeof prefs)[K]) => set("aiPreferences", { ...prefs, [k]: v });
  return (
    <Card>
      <CardHeader title="Tone of voice" description="Your default tone. You can still pick a different one for any post." />
      <div className="space-y-5 px-5 pb-6 sm:px-6">
        <TonePicker value={draft.tone} onChange={(v) => set("tone", v)} />
        <Field label="Describe your voice in your own words">
          <Textarea rows={2} className="min-h-0" value={draft.toneNotes} onChange={(e) => set("toneNotes", e.target.value)} placeholder="e.g. Warm, never pitying. We say 'people we support', not 'service users'." />
        </Field>
      </div>
      <div className="border-t border-sand" />
      <CardHeader title="AI preferences" description="Fine-tune how your content is written." />
      <div className="grid gap-5 px-5 pb-6 sm:grid-cols-2 sm:px-6">
        <Field label="Emoji use">
          <Select value={prefs.emojiLevel} onChange={(e) => setPref("emojiLevel", e.target.value as typeof prefs.emojiLevel)}>
            <option value="none">None</option>
            <option value="light">Light (in headlines)</option>
            <option value="moderate">Moderate</option>
          </Select>
        </Field>
        <Field label={`Hashtags per post: ${prefs.hashtagCount}`} hint="We use fewer on X and LinkedIn automatically.">
          <input
            type="range"
            min={0}
            max={10}
            value={prefs.hashtagCount}
            onChange={(e) => setPref("hashtagCount", Number(e.target.value))}
            className="mt-3 w-full accent-brand-600"
          />
        </Field>
        <Field label="Words or phrases to avoid" className="sm:col-span-2">
          <Input value={prefs.avoidWords} onChange={(e) => setPref("avoidWords", e.target.value)} placeholder="e.g. beneficiaries, the needy, vulnerable" />
        </Field>
        <PrefToggle label="Use British English" hint="UK spelling, £ and UK date formats." checked={prefs.britishEnglish} onChange={(v) => setPref("britishEnglish", v)} />
        <PrefToggle label="Always include our website" hint="Adds your web address to calls to action." checked={prefs.alwaysIncludeWebsite} onChange={(v) => setPref("alwaysIncludeWebsite", v)} />
      </div>
      <SaveBar onSave={() => save(["tone", "toneNotes", "aiPreferences"])} saving={saving} />
    </Card>
  );
}

function PrefToggle({ label, hint, checked, onChange }: { label: string; hint: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-xl border border-sand p-4">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="mt-0.5 text-[13px] text-muted">{hint}</p>
      </div>
      <Toggle checked={checked} onChange={onChange} label={label} />
    </div>
  );
}

function SubscriptionTab() {
  const { org, remaining, mode, saveOrganisation } = useApp();
  const toast = useToast();
  const params = useSearchParams();
  const [busy, setBusy] = useState<PlanId | null>(null);
  useEffect(() => {
    if (params.get("upgraded") === "1") toast("Thanks! Your plan has been upgraded.");
  }, [params, toast]);
  if (!org) return null;
  const plan = getPlan(org.plan);

  const choose = async (id: PlanId) => {
    setBusy(id);
    try {
      if (mode === "demo") {
        // No payments in demo mode: switch plan instantly so the experience can be shown.
        await saveOrganisation({ plan: id });
        toast(`Switched to the ${getPlan(id).name} plan (demo, no payment taken)`);
        return;
      }
      if (id === "free") {
        toast("To downgrade, cancel your subscription from the Stripe billing email or contact us.", "info");
        return;
      }
      const token = await backend.getAccessToken();
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ plan: id }),
      });
      const json = await res.json();
      if (json.url) window.location.href = json.url;
      else toast(json.error ?? "Payments aren't available yet.", "info");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-muted">Current plan</p>
            <p className="mt-1 font-display text-2xl font-medium">
              {plan.name} <span className="text-base text-muted">· £{plan.price}/month</span>
            </p>
          </div>
          <div className="sm:text-right">
            <p className="text-sm text-muted">AI generations this month</p>
            <p className="mt-1 font-semibold">
              {plan.generationsPerMonth === null ? "Unlimited" : `${plan.generationsPerMonth - (remaining ?? 0)} of ${plan.generationsPerMonth} used`}
            </p>
          </div>
        </div>
        {mode === "demo" && (
          <p className="mt-4 rounded-xl bg-cream px-4 py-3 text-[13px] text-muted">
            Demo mode: choosing a plan switches instantly with no payment. Add Stripe and Supabase keys to take real payments.
          </p>
        )}
      </Card>
      <PricingCards
        currentPlan={org.plan}
        renderAction={(p) => (
          <Button
            size="lg"
            className="w-full"
            variant={p.id === org.plan ? "secondary" : p.highlighted ? "primary" : "outline"}
            disabled={p.id === org.plan}
            loading={busy === p.id}
            onClick={() => choose(p.id)}
          >
            {p.id === org.plan ? "Your current plan" : p.price > plan.price ? `Upgrade to ${p.name}` : `Switch to ${p.name}`}
          </Button>
        )}
      />
    </div>
  );
}

function PlatformsTab() {
  const toast = useToast();
  return (
    <Card>
      <CardHeader title="Connected social platforms" description="Publish and schedule directly from CharityContent." />
      <div className="grid gap-3 px-5 pb-6 sm:grid-cols-2 sm:px-6">
        {PLATFORMS.map((p) => (
          <div key={p} className="flex items-center gap-4 rounded-2xl border border-sand p-4">
            <div className="grid size-11 place-items-center rounded-xl bg-cream ring-1 ring-sand">
              <PlatformIcon platform={p} className="size-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-medium">{PLATFORM_LABELS[p]}</p>
              <Badge className="mt-1 bg-coral-50 text-coral-700 ring-coral-200">Coming soon</Badge>
            </div>
            <Button size="sm" variant="outline" onClick={() => toast(`We'll let you know when ${PLATFORM_LABELS[p]} publishing is ready`, "info")}>
              <Bell className="size-3.5" /> Notify me
            </Button>
          </div>
        ))}
      </div>
      <p className="border-t border-sand px-5 py-4 text-sm text-muted sm:px-6">
        For now, use the Copy button on any post and paste it into your platform. Direct publishing is on our roadmap.
      </p>
    </Card>
  );
}

function AccountTab() {
  const { user, mode, updateAccount, signOut, resetDemo } = useApp();
  const toast = useToast();
  const router = useRouter();
  const [name, setName] = useState(user?.fullName ?? "");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  if (!user) return null;
  const isDemoAccount = user.id === "demo-user";

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader title="Account details" />
        <div className="grid gap-5 px-5 pb-6 sm:grid-cols-2 sm:px-6">
          <Field label="Full name">
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </Field>
          <Field label="Email">
            <Input value={user.email} disabled />
          </Field>
          <Field label="New password" hint="Leave blank to keep your current password.">
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" />
          </Field>
        </div>
        <div className="flex justify-end border-t border-sand px-5 py-4 sm:px-6">
          <Button
            loading={busy}
            onClick={async () => {
              if (password && password.length < 8) return toast("Passwords need at least 8 characters", "error");
              setBusy(true);
              try {
                await updateAccount({ fullName: name, ...(password ? { password } : {}) });
                setPassword("");
                toast("Account updated");
              } catch (e) {
                toast((e as Error).message, "error");
              } finally {
                setBusy(false);
              }
            }}
          >
            Save changes
          </Button>
        </div>
      </Card>

      {mode === "demo" && (
        <Card className="p-5 sm:p-6">
          <h3 className="font-semibold">Demo mode</h3>
          <p className="mt-1 text-sm text-muted">
            Accounts and content are stored in this browser only. Add Supabase keys to enable real accounts and a shared database.
          </p>
          {isDemoAccount && (
            <Button
              variant="outline"
              className="mt-4"
              onClick={async () => {
                await resetDemo();
                toast("HopeBridge demo data restored");
              }}
            >
              <RotateCcw className="size-4" /> Reset demo data
            </Button>
          )}
        </Card>
      )}

      <Card className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div>
          <h3 className="font-semibold">Log out</h3>
          <p className="mt-1 text-sm text-muted">Signed in as {user.email}</p>
        </div>
        <Button
          variant="outline"
          onClick={async () => {
            await signOut();
            router.push("/");
          }}
        >
          Log out
        </Button>
      </Card>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense>
      <Settings />
    </Suspense>
  );
}
