"use client";

import clsx from "clsx";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Check, Wand2 } from "lucide-react";
import { useApp } from "@/components/app-provider";
import { Logo } from "@/components/brand";
import { Button, Field, Input, Select, Spinner, Textarea } from "@/components/ui";
import { CampaignEditor, KeyDateEditor, PlatformPicker, TagInput, TonePicker } from "@/components/org-fields";
import { useToast } from "@/components/toast";
import { ORG_TYPES } from "@/lib/labels";
import { exampleOnboardingProfile } from "@/lib/demo-data";
import type { Organisation } from "@/lib/types";

type Draft = Pick<
  Organisation,
  "name" | "type" | "description" | "audience" | "website" | "platforms" | "tone" | "toneNotes" | "causes" | "campaigns" | "keyDates"
>;

const EMPTY: Draft = {
  name: "",
  type: "",
  description: "",
  audience: "",
  website: "",
  platforms: ["instagram", "facebook"],
  tone: "friendly",
  toneNotes: "",
  causes: [],
  campaigns: [],
  keyDates: [],
};

const STEPS = [
  { title: "Your organisation", description: "The basics, so every post sounds like it came from you." },
  { title: "Your voice", description: "Where you post and how you like to sound." },
  { title: "Current campaigns", description: "What you're focusing on right now. You can add more later." },
  { title: "Important dates", description: "Events and moments coming up that you'll want to promote." },
];

export default function OnboardingPage() {
  const { status, user, org, saveOrganisation } = useApp();
  const router = useRouter();
  const toast = useToast();
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (status !== "ready") return;
    if (!user) router.replace("/login");
    else if (org) setDraft((d) => ({ ...d, ...org }));
  }, [status, user, org, router]);

  if (status !== "ready" || !user) {
    return (
      <div className="grid min-h-screen place-items-center">
        <Spinner className="size-6 text-brand-600" />
      </div>
    );
  }

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => setDraft((d) => ({ ...d, [key]: value }));

  const validate = (): string => {
    if (step === 0) {
      if (!draft.name.trim()) return "Please add your organisation's name.";
      if (!draft.description.trim()) return "Please tell us briefly what you do.";
      if (!draft.audience.trim()) return "Please tell us who you help.";
    }
    if (step === 1 && draft.platforms.length === 0) return "Choose at least one platform.";
    if (step === 2 && draft.campaigns.some((c) => !c.name.trim())) return "Give each campaign a name, or remove it.";
    if (step === 3 && draft.keyDates.some((k) => !k.name.trim() || !k.date)) return "Give each date a name and a date, or remove it.";
    return "";
  };

  const next = async () => {
    const problem = validate();
    if (problem) return setError(problem);
    setError("");
    if (step < STEPS.length - 1) {
      setStep(step + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setSaving(true);
    try {
      await saveOrganisation({ ...draft, website: draft.website.trim() });
      toast("Your organisation profile is saved");
      router.push("/dashboard?welcome=1");
    } catch (e) {
      setError((e as Error).message);
      setSaving(false);
    }
  };

  const fillExample = () => {
    setDraft({ ...EMPTY, ...exampleOnboardingProfile() } as Draft);
    setError("");
    toast("Filled in with the HopeBridge example", "info");
  };

  return (
    <div className="min-h-screen">
      <header className="border-b border-sand bg-white/70 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-4 sm:px-6">
          <Logo href="/" />
          <Button variant="ghost" size="sm" onClick={fillExample}>
            <Wand2 className="size-4" /> <span className="hidden sm:inline">Fill with example</span>
            <span className="sm:hidden">Example</span>
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
        <ol className="mb-10 grid grid-cols-4 gap-2">
          {STEPS.map((s, i) => (
            <li key={s.title}>
              <div className={clsx("h-1.5 rounded-full transition-colors", i <= step ? "bg-brand-600" : "bg-sand")} />
              <p className={clsx("mt-2 hidden text-xs font-medium sm:block", i === step ? "text-ink" : "text-muted")}>
                {i < step && <Check className="mr-1 inline size-3.5 text-brand-600" />}
                {s.title}
              </p>
            </li>
          ))}
        </ol>

        <p className="text-sm font-medium text-brand-700">
          Step {step + 1} of {STEPS.length}
        </p>
        <h1 className="mt-1 font-display text-3xl font-medium tracking-tight sm:text-4xl">{STEPS[step].title}</h1>
        <p className="mt-2 text-muted">{STEPS[step].description}</p>

        <div key={step} className="mt-8 animate-fade-up space-y-6 rounded-3xl border border-sand bg-white p-5 shadow-card sm:p-8">
          {step === 0 && (
            <>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Organisation name" htmlFor="name">
                  <Input id="name" value={draft.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Riverside Community Trust" />
                </Field>
                <Field label="Organisation type" htmlFor="type">
                  <Select id="type" value={draft.type} onChange={(e) => set("type", e.target.value)}>
                    <option value="">Choose one…</option>
                    {ORG_TYPES.map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </Select>
                </Field>
              </div>
              <Field label="What do you do?" htmlFor="what" hint="One or two sentences, as you'd explain it to a new volunteer.">
                <Textarea id="what" value={draft.description} onChange={(e) => set("description", e.target.value)} placeholder="e.g. We run a weekly food pantry, youth clubs and money advice sessions in North Leeds." />
              </Field>
              <Field label="Who do you help?" htmlFor="who">
                <Textarea id="who" rows={2} className="min-h-0" value={draft.audience} onChange={(e) => set("audience", e.target.value)} placeholder="e.g. Families on low incomes and young people aged 11 to 18" />
              </Field>
              <Field label="Website (optional)" htmlFor="site">
                <Input id="site" type="url" value={draft.website} onChange={(e) => set("website", e.target.value)} placeholder="https://www.yourcharity.org.uk" />
              </Field>
            </>
          )}

          {step === 1 && (
            <>
              <Field label="Main social media platforms">
                <PlatformPicker value={draft.platforms} onChange={(v) => set("platforms", v)} />
              </Field>
              <Field label="Tone of voice">
                <TonePicker value={draft.tone} onChange={(v) => set("tone", v)} />
              </Field>
              <Field label="Anything else about how you sound? (optional)" htmlFor="toneNotes">
                <Textarea id="toneNotes" rows={2} className="min-h-0" value={draft.toneNotes} onChange={(e) => set("toneNotes", e.target.value)} placeholder="e.g. Down to earth, never pitying. We say 'people we support', not 'service users'." />
              </Field>
              <Field label="Key causes or issues" hint="Press Enter or comma after each one. These shape your posts and hashtags.">
                <TagInput value={draft.causes} onChange={(v) => set("causes", v)} placeholder="e.g. child poverty, mental health, loneliness" />
              </Field>
            </>
          )}

          {step === 2 && <CampaignEditor value={draft.campaigns} onChange={(v) => set("campaigns", v)} />}
          {step === 3 && <KeyDateEditor value={draft.keyDates} onChange={(v) => set("keyDates", v)} />}

          {error && <p className="rounded-xl bg-red-50 px-3.5 py-2.5 text-sm text-red-800">{error}</p>}
        </div>

        <div className="mt-6 flex items-center justify-between gap-3">
          <Button variant="ghost" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}>
            <ArrowLeft className="size-4" /> Back
          </Button>
          <div className="flex gap-2">
            {(step === 2 || step === 3) && (
              <Button variant="outline" onClick={next} disabled={saving}>
                Skip for now
              </Button>
            )}
            <Button onClick={next} loading={saving}>
              {step === STEPS.length - 1 ? "Finish setup" : "Continue"} {!saving && <ArrowRight className="size-4" />}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
