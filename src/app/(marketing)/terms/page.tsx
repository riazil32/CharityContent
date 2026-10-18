import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/legal-page";
import { CONTACT_EMAIL } from "@/lib/site";

export const metadata: Metadata = { title: "Terms of use" };

export default function TermsPage() {
  const mail = <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>;
  return (
    <LegalPage title="Terms of use" updated="7 October 2026">
      <section>
        <p>
          These terms apply when you use CharityContent. By creating an account you agree to them. If you have any
          questions, email us at {mail}.
        </p>
      </section>

      <section>
        <h2>Your account</h2>
        <ul>
          <li>You must be at least 18 and have permission to act for the organisation you set up.</li>
          <li>Keep your password safe. You&apos;re responsible for what happens in your account.</li>
          <li>Give accurate information about your organisation, so the content we write is accurate too.</li>
        </ul>
      </section>

      <section>
        <h2>Your content</h2>
        <p>
          The content you create with CharityContent belongs to you, and you can use it however you like. You give us
          permission to store and process it only so we can provide the service.
        </p>
        <p>
          Content is written automatically, so please read it before you publish it. Check facts, figures, dates and anything
          about the people you support. You are responsible for what you publish, including following fundraising and
          advertising rules such as the Code of Fundraising Practice.
        </p>
      </section>

      <section>
        <h2>Acceptable use</h2>
        <p>
          Don&apos;t use CharityContent to create content that is misleading, unlawful, hateful or that infringes someone
          else&apos;s rights, and don&apos;t try to disrupt or misuse the service. We may suspend accounts that do.
        </p>
      </section>

      <section>
        <h2>Plans and payment</h2>
        <p>
          The free plan is free. Paid plans are billed monthly in advance, with no minimum term, and you can cancel at any
          time; your plan stays active until the end of the period you&apos;ve paid for. If we change our prices, we&apos;ll
          give you at least 30 days&apos; notice.
        </p>
      </section>

      <section>
        <h2>The service</h2>
        <p>
          We work hard to keep CharityContent running smoothly, but we can&apos;t promise it will always be available or free
          of errors. We may change or improve features over time, and we&apos;ll tell you before removing anything major.
        </p>
        <p>
          Nothing in these terms limits liability that can&apos;t be limited by law. Otherwise, our total liability to you is
          limited to the amount you&apos;ve paid us in the 12 months before the claim, and we aren&apos;t liable for indirect
          losses such as lost donations or income.
        </p>
      </section>

      <section>
        <h2>Closing your account</h2>
        <p>
          You can stop using CharityContent at any time. Email {mail} to have your account and content deleted, as explained
          in our <Link href="/privacy">privacy policy</Link>.
        </p>
      </section>

      <section>
        <h2>The legal bit</h2>
        <p>These terms are governed by the law of England and Wales, and the courts of England and Wales handle any disputes.</p>
      </section>
    </LegalPage>
  );
}
