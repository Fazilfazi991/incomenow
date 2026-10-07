import type { Metadata } from "next";
import { publicPageMetadata } from "@/lib/site-config";
import { PublicShell } from "@/components/public-site";
import { getPublicAccountState } from "@/lib/public-account.server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  ...publicPageMetadata("/privacy"),
  title: "Privacy",
  description: "How IncomeNow uses minimum necessary account and acquisition data.",
};

export default async function PrivacyPage() {
  const state = await getPublicAccountState();
  return (
    <PublicShell state={state} page="privacy">
      <article className="privacy-page">
        <header><span>Privacy</span><h1>Minimum data, clear purpose.</h1><p>IncomeNow separates account identity, paid access, and acquisition reporting. This page describes the tracking added for the internal team traffic and revenue race.</p></header>
        <section><h2>First-party acquisition tracking</h2><p>IncomeNow stores random visitor and session identifiers in HttpOnly first-party cookies. They do not contain your name, email address, account details, or payment information. The identifiers help count unique visitors, preserve the first referring team source, and avoid treating repeated refreshes as new people.</p></section>
        <section><h2>What is recorded</h2><p>The system records the first source or direct visit, incoming hostname, landing path, limited referrer URL, timestamps, pageview counts, and a one-way hash of the browser user-agent. Common bots, health checks, admin pages, API routes, and rapid duplicate refreshes are excluded where practical.</p></section>
        <section><h2>Accounts and purchases</h2><p>When an account is first authenticated, its original source is locked and later visits cannot change it. If checkout is connected in the future, only server-confirmed successful payments and refunds will contribute to internal revenue reporting. The team dashboard uses anonymous event labels and does not expose customer names or email addresses.</p></section>
        <section><h2>Cookie lifetime</h2><p>The visitor identifier can remain for up to 400 days and the session identifier is refreshed for up to 30 minutes of activity. Clearing browser cookies can remove anonymous continuity. IncomeNow does not invent attribution when that continuity is unavailable.</p></section>
        <section><h2>Google Analytics</h2><p>When enabled on the production website, Google Analytics measures visits to the homepage, membership page, and this privacy page. It uses analytics cookies to help us understand traffic and engagement across our domains. We send page addresses without query strings or fragments and do not send account identifiers, email addresses, authentication links, or member workspace content. Advertising personalization, Google signals, and automatic enhanced measurement are disabled.</p></section>
      </article>
    </PublicShell>
  );
}
