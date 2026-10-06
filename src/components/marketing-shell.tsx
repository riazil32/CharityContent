"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Logo } from "./brand";
import { ButtonLink } from "./ui";
import { useApp } from "./app-provider";

const NAV = [
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#features", label: "Features" },
  { href: "/#examples", label: "Examples" },
  { href: "/pricing", label: "Pricing" },
  { href: "/#faq", label: "FAQ" },
];

export function MarketingShell({ children }: { children: ReactNode }) {
  const { user, status } = useApp();
  const [open, setOpen] = useState(false);
  const signedIn = status === "ready" && user;

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-sand/70 bg-cream/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Logo />
          <nav className="hidden items-center gap-1 md:flex">
            {NAV.map((n) => (
              <Link key={n.href} href={n.href} className="rounded-lg px-3 py-2 text-sm font-medium text-muted transition-colors hover:text-ink">
                {n.label}
              </Link>
            ))}
          </nav>
          <div className="hidden items-center gap-2 md:flex">
            {signedIn ? (
              <ButtonLink href="/dashboard">Go to dashboard</ButtonLink>
            ) : (
              <>
                <ButtonLink href="/login" variant="ghost">
                  Log in
                </ButtonLink>
                <ButtonLink href="/signup">Start free</ButtonLink>
              </>
            )}
          </div>
          <button className="rounded-lg p-2 md:hidden" onClick={() => setOpen(!open)} aria-label="Menu">
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
        {open && (
          <div className="animate-fade-in border-t border-sand bg-cream px-4 pt-2 pb-4 md:hidden">
            {NAV.map((n) => (
              <Link key={n.href} href={n.href} onClick={() => setOpen(false)} className="block rounded-lg px-2 py-2.5 text-[15px] font-medium">
                {n.label}
              </Link>
            ))}
            <div className="mt-3 grid grid-cols-2 gap-2">
              {signedIn ? (
                <ButtonLink href="/dashboard" className="col-span-2">
                  Go to dashboard
                </ButtonLink>
              ) : (
                <>
                  <ButtonLink href="/login" variant="outline">
                    Log in
                  </ButtonLink>
                  <ButtonLink href="/signup">Start free</ButtonLink>
                </>
              )}
            </div>
          </div>
        )}
      </header>
      <main>{children}</main>
      <footer className="border-t border-sand bg-white">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-[2fr_1fr_1fr_1fr]">
          <div>
            <Logo />
            <p className="mt-3 max-w-xs text-sm text-muted">
              The AI marketing assistant for small UK charities and community organisations.
            </p>
          </div>
          <FooterCol title="Product" links={[["How it works", "/#how-it-works"], ["Features", "/#features"], ["Pricing", "/pricing"]]} />
          <FooterCol title="Account" links={[["Log in", "/login"], ["Sign up", "/signup"], ["Dashboard", "/dashboard"]]} />
          <FooterCol title="Company" links={[["FAQ", "/#faq"], ["Contact", "mailto:hello@charitycontent.co.uk"]]} />
        </div>
        <div className="border-t border-sand">
          <p className="mx-auto max-w-6xl px-4 py-5 text-xs text-muted sm:px-6">
            © {new Date().getFullYear()} CharityContent. Made in the UK for the charity sector.
          </p>
        </div>
      </footer>
    </div>
  );
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <p className="text-sm font-semibold">{title}</p>
      <ul className="mt-3 space-y-2">
        {links.map(([label, href]) => (
          <li key={label}>
            <Link href={href} className="text-sm text-muted hover:text-ink">
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
