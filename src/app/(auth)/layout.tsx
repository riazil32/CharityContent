import { Logo } from "@/components/brand";
import { Quote } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,560px)]">
      <div className="flex flex-col px-4 py-6 sm:px-10">
        <Logo />
        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-sm animate-fade-up">{children}</div>
        </div>
      </div>
      <aside className="relative hidden overflow-hidden bg-brand-900 p-12 text-white lg:flex lg:flex-col lg:justify-end">
        <div className="absolute -top-24 -right-24 size-96 rounded-full bg-brand-700/40 blur-3xl" />
        <div className="relative">
          <Quote className="size-8 text-coral-400" />
          <p className="mt-6 font-display text-[28px] leading-snug font-medium">
            We used to spend Sunday evenings staring at a blank Facebook post. Now our whole month is planned before the kettle boils.
          </p>
          <p className="mt-6 text-sm text-white/70">The kind of feedback we&apos;re building CharityContent to earn.</p>
          <ul className="mt-10 grid grid-cols-3 gap-4 border-t border-white/15 pt-8 text-sm">
            <li>
              <p className="font-display text-2xl">4</p>
              <p className="text-white/60">platforms</p>
            </li>
            <li>
              <p className="font-display text-2xl">7</p>
              <p className="text-white/60">content types</p>
            </li>
            <li>
              <p className="font-display text-2xl">5 min</p>
              <p className="text-white/60">to set up</p>
            </li>
          </ul>
        </div>
      </aside>
    </div>
  );
}
