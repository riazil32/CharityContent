import { Logo } from "@/components/brand";
import { ButtonLink } from "@/components/ui";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <Logo />
      <h1 className="mt-10 font-display text-4xl font-medium">We couldn&apos;t find that page</h1>
      <p className="mt-3 text-muted">It may have moved, or the link might be out of date.</p>
      <ButtonLink href="/" className="mt-8">
        Back to home
      </ButtonLink>
    </div>
  );
}
