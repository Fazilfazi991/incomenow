import type { Metadata } from "next";
import Link from "next/link";
import { OnboardingClient } from "@/components/onboarding-client";
import { getVerifiedAccountData } from "@/lib/account.server";
import { safeOnboardingDestination } from "@/lib/safe-redirect";

export const metadata: Metadata = { title: "Getting started" };
export const dynamic = "force-dynamic";

export default async function GettingStartedPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const params = await searchParams;
  const next = safeOnboardingDestination(params.next);
  const account = await getVerifiedAccountData(`/account/getting-started?next=${encodeURIComponent(next)}`);

  if (!account.user) {
    return <main className="account-service-page"><section><h1>Account verification is unavailable</h1><p>We could not verify your session right now. Your membership status has not been changed.</p><Link className="secondary-button" href="/account/getting-started">Try again</Link></section></main>;
  }
  if (account.preferences.status === "unavailable") {
    return <main className="account-service-page"><section><h1>Preferences are temporarily unavailable</h1><p>Nothing has been changed. Try loading this page again, or continue to account access.</p><div><Link className="secondary-button" href="/account/getting-started">Try again</Link><Link className="primary-button" href="/account/access">Continue</Link></div></section></main>;
  }

  return <OnboardingClient initial={account.preferences.data} next={next} />;
}
