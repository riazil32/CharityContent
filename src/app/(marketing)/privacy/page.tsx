import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";
import { CONTACT_EMAIL } from "@/lib/site";

export const metadata: Metadata = { title: "Privacy policy" };

export default function PrivacyPage() {
  const mail = <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>;
  return (
    <LegalPage title="Privacy policy" updated="7 October 2026">
      <section>
        <p>
          This policy explains what information CharityContent collects when you use this website, why we need it and what
          your rights are under UK data protection law (the UK GDPR and the Data Protection Act 2018). If you have any
          questions, email us at {mail}.
        </p>
      </section>

      <section>
        <h2>What we collect</h2>
        <ul>
          <li>
            <strong>Your account:</strong> your name, email address and a securely stored version of your password.
          </li>
          <li>
            <strong>Your organisation profile:</strong> the details you enter during setup and in Settings, such as your
            organisation&apos;s name, what it does, who it helps, campaigns, key dates and tone of voice.
          </li>
          <li>
            <strong>Your content:</strong> the posts, captions and plans you create, edit or save.
          </li>
          <li>
            <strong>Billing details</strong> if you take a paid plan. Card payments are handled by Stripe; we never see or
            store your full card number.
          </li>
        </ul>
        <p>
          Please don&apos;t enter sensitive personal information about the people your organisation supports (for example
          health details or real names in stories) into CharityContent. The service doesn&apos;t need it to write good content.
        </p>
      </section>

      <section>
        <h2>Why we use it</h2>
        <ul>
          <li>To create your account and let you log in (performing our contract with you).</li>
          <li>To write and store content tailored to your organisation (performing our contract with you).</li>
          <li>To send you emails about your account, such as password resets (performing our contract with you).</li>
          <li>To keep the service secure and fix problems (our legitimate interests).</li>
        </ul>
        <p>We never sell your information or use it for advertising.</p>
      </section>

      <section>
        <h2>Who we share it with</h2>
        <p>We use a small number of trusted providers to run the service. They only process your information on our instructions:</p>
        <ul>
          <li>Netlify, which hosts the website.</li>
          <li>Supabase, which stores accounts and content.</li>
          <li>OpenAI, which may be used to write content from your organisation profile. OpenAI does not use data sent through its API to train its models.</li>
          <li>Stripe, which handles payments for paid plans.</li>
        </ul>
        <p>
          Some of these providers are based in, or use servers in, the United States. Where information leaves the UK, it is
          protected by the UK&apos;s approved safeguards, such as the UK International Data Transfer Addendum.
        </p>
      </section>

      <section>
        <h2>How long we keep it</h2>
        <p>
          We keep your account and content for as long as your account is open. If you ask us to delete your account, we
          delete your information within 30 days, except anything we must keep by law (such as billing records, which we
          keep for six years).
        </p>
      </section>

      <section>
        <h2>Your rights</h2>
        <p>
          You can ask us for a copy of your information, ask us to correct or delete it, object to how we use it, or ask us to
          send it to you in a portable format. Email {mail} and we&apos;ll respond within one month.
        </p>
        <p>
          If you&apos;re unhappy with how we&apos;ve handled your information, you can complain to the Information
          Commissioner&apos;s Office at <a href="https://ico.org.uk">ico.org.uk</a>.
        </p>
      </section>

      <section>
        <h2>Cookies</h2>
        <p>
          We only use the cookies and browser storage needed to keep you logged in and remember your settings. We don&apos;t
          use advertising or tracking cookies.
        </p>
      </section>

      <section>
        <h2>Changes to this policy</h2>
        <p>If we make significant changes, we&apos;ll tell you by email or with a notice in the app.</p>
      </section>
    </LegalPage>
  );
}
