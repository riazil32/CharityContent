"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState, type FormEvent } from "react";
import { MailCheck } from "lucide-react";
import { useApp } from "@/components/app-provider";
import { Button, Field, Input } from "@/components/ui";
import { getPlan } from "@/lib/plans";
import type { PlanId } from "@/lib/types";

function SignupForm() {
  const { signUp, mode } = useApp();
  const router = useRouter();
  const plan = useSearchParams().get("plan") as PlanId | null;
  const [form, setForm] = useState({ fullName: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirmEmail, setConfirmEmail] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (form.password.length < 8) return setError("Please use a password with at least 8 characters.");
    setError("");
    setLoading(true);
    try {
      const { needsConfirmation } = await signUp(form.email, form.password, form.fullName);
      if (needsConfirmation) {
        setConfirmEmail(true);
        setLoading(false);
      } else {
        router.push("/onboarding");
      }
    } catch (err) {
      setError((err as Error).message);
      setLoading(false);
    }
  };

  if (confirmEmail) {
    return (
      <div className="text-center">
        <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-brand-50 text-brand-700">
          <MailCheck className="size-6" />
        </div>
        <h1 className="mt-6 font-display text-3xl font-medium">Check your inbox</h1>
        <p className="mt-3 text-muted">
          We&apos;ve sent a confirmation link to <span className="font-medium text-ink">{form.email}</span>. Click it to finish setting up your account.
        </p>
      </div>
    );
  }

  return (
    <>
      <h1 className="font-display text-3xl font-medium tracking-tight">Create your free account</h1>
      <p className="mt-2 text-muted">
        {plan && plan !== "free"
          ? `Start free, then switch to ${getPlan(plan).name} from Settings whenever you're ready.`
          : "Get your first month of content free. No card needed."}
      </p>

      <form onSubmit={submit} className="mt-8 space-y-4">
        <Field label="Your name" htmlFor="name">
          <Input id="name" required autoComplete="name" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} placeholder="Sarah Mitchell" />
        </Field>
        <Field label="Work email" htmlFor="email">
          <Input id="email" type="email" required autoComplete="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@yourcharity.org.uk" />
        </Field>
        <Field label="Password" htmlFor="password" hint="At least 8 characters.">
          <Input id="password" type="password" required autoComplete="new-password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        </Field>
        {error && <p className="rounded-xl bg-red-50 px-3.5 py-2.5 text-sm text-red-800">{error}</p>}
        <Button type="submit" size="lg" className="w-full" loading={loading}>
          Create account
        </Button>
        <p className="text-center text-xs leading-relaxed text-muted">
          By creating an account you agree to our terms and privacy policy.
          {mode === "demo" && " Demo mode: your account is stored in this browser only."}
        </p>
      </form>

      <p className="mt-8 text-center text-sm text-muted">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-brand-700 hover:underline">
          Log in
        </Link>
      </p>
    </>
  );
}

export default function SignupPage() {
  return (
    <Suspense>
      <SignupForm />
    </Suspense>
  );
}
