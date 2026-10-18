import type { ReactNode } from "react";

export function LegalPage({ title, updated, children }: { title: string; updated: string; children: ReactNode }) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-20">
      <h1 className="font-display text-4xl font-medium tracking-tight">{title}</h1>
      <p className="mt-3 text-sm text-muted">Last updated {updated}</p>
      <div className="mt-10 space-y-8 text-[15px] leading-relaxed [&_a]:font-medium [&_a]:text-brand-700 [&_a]:underline [&_a]:underline-offset-4 [&_h2]:mb-3 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:font-medium [&_li]:mt-1.5 [&_p+p]:mt-3 [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:pl-5">
        {children}
      </div>
    </div>
  );
}
