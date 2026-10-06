"use client";

import clsx from "clsx";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import {
  CalendarDays,
  FolderHeart,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  Sparkles,
  X,
} from "lucide-react";
import { useApp } from "./app-provider";
import { Logo } from "./brand";
import { Spinner } from "./ui";
import { getPlan } from "@/lib/plans";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/generate", label: "Create content", icon: Sparkles },
  { href: "/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/library", label: "Library", icon: FolderHeart },
  { href: "/settings", label: "Settings", icon: Settings },
];

function UsageMeter() {
  const { org, remaining } = useApp();
  if (!org) return null;
  const plan = getPlan(org.plan);
  const limit = plan.generationsPerMonth;
  const used = limit === null ? 0 : limit - (remaining ?? 0);
  return (
    <div className="rounded-2xl border border-sand bg-cream/70 p-4">
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold text-ink">{plan.name} plan</span>
        {org.plan !== "growth" && (
          <Link href="/settings?tab=subscription" className="font-medium text-brand-700 hover:underline">
            Upgrade
          </Link>
        )}
      </div>
      {limit === null ? (
        <p className="mt-2 text-xs text-muted">Unlimited AI generations</p>
      ) : (
        <>
          <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-sand">
            <div className="h-full rounded-full bg-brand-600 transition-all" style={{ width: `${Math.min(100, (used / limit) * 100)}%` }} />
          </div>
          <p className="mt-2 text-xs text-muted">
            {used} of {limit} generations used this month
          </p>
        </>
      )}
    </div>
  );
}

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="space-y-1">
      {NAV.map((n) => {
        const active = pathname === n.href || pathname.startsWith(`${n.href}/`);
        return (
          <Link
            key={n.href}
            href={n.href}
            onClick={onNavigate}
            className={clsx(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14.5px] font-medium transition-colors",
              active ? "bg-brand-50 text-brand-800" : "text-muted hover:bg-cream hover:text-ink",
            )}
          >
            <n.icon className={clsx("size-[18px]", active ? "text-brand-700" : "text-muted")} />
            {n.label}
          </Link>
        );
      })}
    </nav>
  );
}

function UserBlock() {
  const { user, org, signOut } = useApp();
  const router = useRouter();
  const initials = (user?.fullName || user?.email || "?")
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <div className="flex items-center gap-3 rounded-2xl p-2">
      <div className="grid size-9 shrink-0 place-items-center rounded-full bg-brand-700 text-xs font-semibold text-white">{initials}</div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">{user?.fullName || user?.email}</p>
        <p className="truncate text-xs text-muted">{org?.name}</p>
      </div>
      <button
        onClick={async () => {
          await signOut();
          router.push("/");
        }}
        className="rounded-lg p-2 text-muted hover:bg-cream hover:text-ink"
        title="Log out"
        aria-label="Log out"
      >
        <LogOut className="size-4" />
      </button>
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const { status, user, org } = useApp();
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (status !== "ready") return;
    if (!user) router.replace("/login");
    else if (!org) router.replace("/onboarding");
  }, [status, user, org, router]);

  useEffect(() => setMenuOpen(false), [pathname]);

  if (status !== "ready" || !user || !org) {
    return (
      <div className="grid min-h-screen place-items-center">
        <Spinner className="size-6 text-brand-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[260px_1fr]">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen flex-col border-r border-sand bg-white px-4 py-5 lg:flex">
        <Logo href="/dashboard" className="px-2" />
        <div className="mt-8 flex-1">
          <NavLinks />
        </div>
        <div className="space-y-3">
          <UsageMeter />
          <UserBlock />
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-sand bg-white/90 px-4 backdrop-blur lg:hidden">
        <Logo href="/dashboard" />
        <button onClick={() => setMenuOpen(true)} className="rounded-lg p-2" aria-label="Open menu">
          <Menu className="size-5" />
        </button>
      </header>
      {menuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 animate-fade-in bg-brand-950/30" onClick={() => setMenuOpen(false)} />
          <div className="absolute inset-y-0 right-0 flex w-[min(320px,85vw)] animate-fade-in flex-col bg-white px-4 py-4 shadow-lift">
            <div className="mb-6 flex items-center justify-between">
              <p className="px-2 text-sm font-semibold text-muted">Menu</p>
              <button onClick={() => setMenuOpen(false)} className="rounded-lg p-2" aria-label="Close menu">
                <X className="size-5" />
              </button>
            </div>
            <div className="flex-1">
              <NavLinks onNavigate={() => setMenuOpen(false)} />
            </div>
            <div className="space-y-3">
              <UsageMeter />
              <UserBlock />
            </div>
          </div>
        </div>
      )}

      <div className="min-w-0">
        <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10 lg:px-10">{children}</main>
      </div>
    </div>
  );
}
