import clsx from "clsx";
import Link from "next/link";
import type { Platform } from "@/lib/types";
import { PLATFORM_LABELS } from "@/lib/labels";

export function LogoMark({ className }: { className?: string }) {
  // Two overlapping speech shapes forming a heart-like bridge.
  return (
    <svg viewBox="0 0 32 32" className={clsx("size-8", className)} aria-hidden>
      <rect width="32" height="32" rx="9" className="fill-brand-700" />
      <path
        d="M9 12.5a4.5 4.5 0 0 1 7-3.74A4.5 4.5 0 0 1 23 12.5c0 4.4-4.6 7.6-7 9.5-2.4-1.9-7-5.1-7-9.5Z"
        className="fill-coral-400"
      />
      <path d="M9.5 24.5h13" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.9" />
    </svg>
  );
}

export function Logo({ href = "/", className, light }: { href?: string; className?: string; light?: boolean }) {
  return (
    <Link href={href} className={clsx("flex items-center gap-2.5", className)}>
      <LogoMark />
      <span className={clsx("font-display text-[19px] font-semibold tracking-tight", light ? "text-white" : "text-ink")}>
        CharityContent
      </span>
    </Link>
  );
}

/** Simple monochrome platform marks (lucide no longer ships brand icons). */
export function PlatformIcon({ platform, className }: { platform: Platform; className?: string }) {
  const cls = clsx("size-4 shrink-0", className);
  switch (platform) {
    case "instagram":
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="none" stroke="currentColor" strokeWidth="2" aria-label={PLATFORM_LABELS[platform]}>
          <rect x="3" y="3" width="18" height="18" rx="5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
        </svg>
      );
    case "facebook":
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="currentColor" aria-label={PLATFORM_LABELS[platform]}>
          <path d="M13.5 21v-7.5h2.6l.4-3h-3V8.6c0-.9.3-1.5 1.5-1.5h1.6V4.4c-.3 0-1.2-.1-2.3-.1-2.3 0-3.8 1.4-3.8 3.9v2.3H8v3h2.5V21h3Z" />
        </svg>
      );
    case "linkedin":
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="currentColor" aria-label={PLATFORM_LABELS[platform]}>
          <path d="M6.9 8.6H3.8V20h3.1V8.6ZM5.3 3.5a1.8 1.8 0 1 0 0 3.6 1.8 1.8 0 0 0 0-3.6ZM20.2 13.4c0-3-1.6-4.9-4.2-4.9-1.4 0-2.4.8-2.8 1.5V8.6h-3V20h3.1v-6c0-1.4.7-2.4 2-2.4 1.2 0 1.8.9 1.8 2.4v6h3.1v-6.6Z" />
        </svg>
      );
    case "x":
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="currentColor" aria-label={PLATFORM_LABELS[platform]}>
          <path d="M17.7 3h3.1l-6.8 7.7L22 21h-6.3l-4.9-6.4L5.2 21H2.1l7.3-8.3L1.8 3h6.4l4.4 5.9L17.7 3Zm-1.1 16.2h1.7L7.3 4.7H5.5l11.1 14.5Z" />
        </svg>
      );
  }
}
