"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState, type FormEvent } from "react";
import { Sparkles } from "lucide-react";
import { useApp } from "@/components/app-provider";
import { Button, Field, Input } from "@/components/ui";

function LoginForm() {
  const { signIn, signInDemo, mode, user, status } = useApp();
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState<"form" | "demo" | null>(null);
  const autoDemo = useRef(false);

  useEffect(() => {
    if (status === "ready" && user) router.replace("/dashboard");
  }, [status, user, router]);

  const demo = async () => {
    setError("");
    setLoading("demo");
    try {
      await signInDemo();
      router.push("/dashboard");
    } catch (e) {
      setError((e as Error).message);
      setLoading(null);
    }
  };

  useEffect(() => {
    if (params.get("demo") === "1" && mode === "demo" && status === "ready" && !user && !autoDemo.current) {
      autoDemo.current = true;
      void demo();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params, mode, status, user]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading("form");
    try {
      await signIn(email, password);
      router.push("/dashboard");
    } catch (err) {
      setError((err as Error).message);
      setLoading(null);
    }
  };

  return (
    <>
      <h1 className="font-display text-3xl font-medium tracking-tight">Welcome back</h1>
      <p className="mt-2 text-muted">Log in to plan and write your charity&apos;s content.</p>

      <form onSubmit={submit} className="mt-8 space-y-4">
        <Field label="Email" htmlFor="email">
          <Input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@yourcharity.org.uk" />
        </Field>
        <Field label="Password" htmlFor="password">
          <Input id="password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        </Field>
        {error && <p className="rounded-xl bg-red-50 px-3.5 py-2.5 text-sm text-red-800">{error}</p>}
        <Button type="submit" size="lg" className="w-full" loading={loading === "form"}>
          Log in
        </Button>
      </form>

      {mode === "demo" && (
        <>
          <div className="my-6 flex items-center gap-3 text-xs text-muted">
            <span className="h-px flex-1 bg-sand-dark" /> or <span className="h-px flex-1 bg-sand-dark" />
          </div>
          <Button variant="outline" size="lg" className="h-auto min-h-12 w-full py-3 whitespace-normal" onClick={demo} loading={loading === "demo"}>
            <Sparkles className="size-4 text-coral-500" /> Explore the HopeBridge demo account
          </Button>
          <p className="mt-3 text-center text-xs text-muted">Demo mode: accounts and content are saved in this browser only.</p>
        </>
      )}

      <p className="mt-8 text-center text-sm text-muted">
        New to CharityContent?{" "}
        <Link href="/signup" className="font-medium text-brand-700 hover:underline">
          Create a free account
        </Link>
      </p>
    </>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
