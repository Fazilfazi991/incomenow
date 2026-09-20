import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, ArrowRight, CheckCircle2, LogOut, ShieldCheck } from "lucide-react";
import { signOutAction } from "@/app/(auth)/actions";
import { getAccountAccessContext } from "@/lib/membership.server";

export const metadata: Metadata = { title: "Account access" };
export const dynamic = "force-dynamic";

type AccessPageProps = { searchParams: Promise<{ notice?: string }> };

const notices: Record<string, string> = {
  bookmarks: "Account-synced saved ideas are planned for Phase 2B. The Phase 1 preview still supports browser-local bookmarks.",
  projects: "Project workspaces are not included in Phase 2A.",
  updates: "Member update feeds are not included in Phase 2A.",
  support: "A connected support channel is not included in Phase 2A.",
};

export default async function AccountAccessPage({ searchParams }: AccessPageProps) {
  const [context, params] = await Promise.all([getAccountAccessContext(), searchParams]);
  const notice = params.notice ? notices[params.notice] : undefined;

  if (context.configuration === "ready" && !context.user) {
    return (
      <main className="access-page">
        <section className="access-card compact">
          <ShieldCheck size={30} />
          <h1>Sign in to review access</h1>
          <p>Your membership status is checked only after IncomeNow verifies the account session.</p>
          <Link className="primary-button" href="/login?next=%2Faccount%2Faccess">Log in <ArrowRight size={16} /></Link>
        </section>
      </main>
    );
  }

  const active = context.access === "active";
  const unavailable = context.access === "unavailable";
  return (
    <main className="access-page">
      <header className="access-header"><Link className="auth-brand" href="/login">IncomeNow<span>.in</span></Link><span>Account access</span></header>
      <section className="access-card">
        <div className={`access-icon ${active ? "active" : unavailable ? "warning" : "inactive"}`}>
          {active ? <CheckCircle2 size={28} /> : <AlertTriangle size={28} />}
        </div>
        <div className="access-heading">
          <span>{active ? "Membership active" : unavailable ? "Access check unavailable" : "No active membership"}</span>
          <h1>{active ? "Your member library is ready." : unavailable ? "We could not verify membership access." : "Your account is ready; membership is separate."}</h1>
          <p>{unavailable ? "The account service or entitlement lookup is not available in this environment. Access remains closed until the server can verify an active record." : active ? "IncomeNow verified both the account session and the separate membership entitlement." : "Creating or verifying an account does not grant membership. Checkout is intentionally not part of this phase."}</p>
        </div>

        {context.user ? <dl className="access-details"><div><dt>Account</dt><dd>{context.displayName || "No display name"}</dd></div><div><dt>Email</dt><dd>{context.user.email}</dd></div><div><dt>Member library</dt><dd>{active ? "Allowed" : "Closed"}</dd></div></dl> : null}
        {notice ? <div className="access-notice" role="status">{notice}</div> : null}

        <div className="access-actions">
          {active ? <Link className="primary-button" href="/app/explore">Open idea library <ArrowRight size={16} /></Link> : null}
          {!active && !unavailable ? <span className="access-disabled">Membership checkout is not available in Phase 2A.</span> : null}
          {unavailable ? <Link className="secondary-button" href="/account/access">Retry access check</Link> : null}
          {context.user ? <form action={signOutAction}><button className="access-signout" type="submit"><LogOut size={16} /> Sign out</button></form> : <Link className="secondary-button" href="/login">Go to log in</Link>}
        </div>
      </section>
    </main>
  );
}
