import type { Metadata } from "next";
import Link from "next/link";
import { signOutAction } from "@/app/(auth)/actions";
import { AccountShell } from "@/components/account-shell";
import { SettingsClient } from "@/components/settings-client";
import { getVerifiedAccountData } from "@/lib/account.server";

export const metadata: Metadata = { title: "Account settings" };
export const dynamic = "force-dynamic";

export default async function AccountSettingsPage() {
  const account = await getVerifiedAccountData();
  if (!account.user) {
    return <main className="account-service-page"><section><h1>Account verification is unavailable</h1><p>We could not verify your session. This is different from being signed out, so no account state has been changed.</p><Link className="secondary-button" href="/account/settings">Try again</Link></section></main>;
  }
  const name = account.profile.status === "ready" ? account.profile.data.displayName || account.user.email?.split("@")[0] || "IncomeNow account" : "IncomeNow account";
  return (
    <AccountShell active="settings" name={name} email={account.user.email ?? "Email unavailable"}>
      <div className="account-page-heading"><h1>Account settings</h1><p>Manage your profile, discovery preferences, sign-in details, and membership link.</p></div>
      {account.profile.status === "unavailable" || account.preferences.status === "unavailable" ? (
        <div className="account-load-warning" role="status">Some account details could not be loaded. Nothing has been changed; try again before editing.</div>
      ) : (
        <SettingsClient
          email={account.user.email ?? ""}
          initialDisplayName={account.profile.data.displayName}
          initialPreferences={account.preferences.data}
          methods={account.authenticationMethods}
          access={account.context.access}
        />
      )}
      <form className="account-signout-section" action={signOutAction}><div><strong>Finished for now?</strong><span>Sign out of this browser session.</span></div><button type="submit">Sign out</button></form>
    </AccountShell>
  );
}
