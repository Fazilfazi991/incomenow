import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, ArrowRight, CheckCircle2, ShieldCheck } from "lucide-react";
import { AccountShell } from "@/components/account-shell";
import { getAccountAccessContext } from "@/lib/membership.server";

export const metadata: Metadata = { title: "Account access" };
export const dynamic = "force-dynamic";

type AccessPageProps = { searchParams: Promise<{ notice?: string }> };

const notices: Record<string, string> = {
  updates: "Member update feeds are not available yet.",
  support: "A connected support channel is not available yet.",
};

export default async function AccountAccessPage({ searchParams }: AccessPageProps) {
  const [context, params] = await Promise.all([getAccountAccessContext(), searchParams]);
  const notice = params.notice ? notices[params.notice] : undefined;

  if (context.authentication === "signed-out") {
    return (
      <main className="account-service-page"><section><ShieldCheck size={30} /><h1>Sign in to review access</h1><p>Your membership status is checked only after IncomeNow verifies the account session.</p><Link className="primary-button" href="/login?next=%2Faccount%2Faccess">Log in <ArrowRight size={16} /></Link></section></main>
    );
  }
  if (context.authentication === "unavailable" || !context.user) {
    return (
      <main className="account-service-page"><section><AlertTriangle size={30} /><h1>Account verification is unavailable</h1><p>We could not verify the session. Access remains closed, but this does not mean the account was signed out.</p><Link className="secondary-button" href="/account/access">Try again</Link></section></main>
    );
  }

  const active = context.access === "active";
  const unavailable = context.access === "unavailable";
  const name = context.displayName || context.user.email?.split("@")[0] || "IncomeNow account";
  return (
    <AccountShell active="access" name={name} email={context.user.email ?? "Email unavailable"}>
      <div className="account-page-heading"><h1>Membership access</h1><p>Your verified account and membership entitlement are separate.</p></div>
      <section className="access-card account-access-card">
        <div className={`access-icon ${active ? "active" : unavailable ? "warning" : "inactive"}`}>{active ? <CheckCircle2 size={28} /> : <AlertTriangle size={28} />}</div>
        <div className="access-heading">
          <span>{active ? "Membership active" : unavailable ? "Access check unavailable" : "No active membership"}</span>
          <h2>{active ? "Your member library is ready." : unavailable ? "We could not verify membership access." : "Your account is ready; membership is separate."}</h2>
          <p>{unavailable ? "The entitlement lookup is temporarily unavailable. Account settings remain available, while paid content stays closed until access can be verified." : active ? "IncomeNow verified both the account session and the separate membership entitlement." : "Creating an account and setting preferences do not grant membership. Checkout is not connected yet."}</p>
        </div>
        <dl className="access-details"><div><dt>Account</dt><dd>{context.displayName || "No display name"}</dd></div><div><dt>Email</dt><dd>{context.user.email}</dd></div><div><dt>Member library</dt><dd>{active ? "Allowed" : "Closed"}</dd></div></dl>
        {notice ? <div className="access-notice" role="status">{notice}</div> : null}
        <div className="access-actions">
          {active ? <Link className="primary-button" href="/app/explore">Open idea library <ArrowRight size={16} /></Link> : null}
          {!active && !unavailable ? <span className="access-disabled">Membership checkout is not connected yet.</span> : null}
          {unavailable ? <Link className="secondary-button" href="/account/access">Retry access check</Link> : null}
          <Link className="secondary-button" href="/account/settings">Account settings</Link>
        </div>
      </section>
    </AccountShell>
  );
}
