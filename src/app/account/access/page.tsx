import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, ArrowRight, CheckCircle2, ShieldCheck } from "lucide-react";
import { AccountShell } from "@/components/account-shell";
import { STARTER_IDEA_ID } from "@/content/membership-offer";
import { getIdeaById } from "@/content/ideas";
import { getAccountAccessContext, getIdeaAccessDecision } from "@/lib/membership.server";
import { getMemberProjectIdForIdea } from "@/lib/workspace.server";
import { getBillingAccount } from "@/lib/billing-store.server";
import { getMembershipBillingView } from "@/lib/billing-view.server";
import { cancelMembershipAtPeriodEnd, manageMembershipBilling } from "@/app/membership/billing-actions";

export const metadata: Metadata = { title: "Account access" };
export const dynamic = "force-dynamic";

type AccessPageProps = { searchParams: Promise<{ notice?: string }> };

const notices: Record<string, string> = {
  updates: "Member update feeds are not available yet.",
  support: "A connected support channel is not available yet.",
  "cancellation-requested": "Cancellation was requested for the end of your paid period. Your paid access and capacity slot remain valid until that period ends.",
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

  const fullActive = context.fullMembership === "active";
  const [billingAccount,billingView]=await Promise.all([getBillingAccount(context.user.id),getMembershipBillingView()]);
  const subscription=billingAccount?.subscription;
  const starterDecision = getIdeaAccessDecision(context, STARTER_IDEA_ID);
  const starterActive = !fullActive && starterDecision.status === "active" && starterDecision.source === "starter";
  const unavailable = !fullActive && !starterActive && (context.fullMembership === "unavailable" || context.ideaGrantLookup === "unavailable");
  const starterIdea = getIdeaById(STARTER_IDEA_ID)!;
  const starterProjectId = starterActive ? await getMemberProjectIdForIdea(STARTER_IDEA_ID) : null;
  const name = context.displayName || context.user.email?.split("@")[0] || "IncomeNow account";
  return (
    <AccountShell active="access" name={name} email={context.user.email ?? "Email unavailable"}>
      <div className="account-page-heading"><h1>Membership access</h1><p>Your verified account and membership entitlement are separate.</p></div>
      <section className="access-card account-access-card">
        <div className={`access-icon ${fullActive || starterActive ? "active" : unavailable ? "warning" : "inactive"}`}>{fullActive || starterActive ? <CheckCircle2 size={28} /> : <AlertTriangle size={28} />}</div>
        <div className="access-heading">
          <span>{fullActive ? "Full membership active" : starterActive ? "Starter Pass active" : unavailable ? "Access check unavailable" : "Registered browsing access"}</span>
          <h2>{fullActive ? "Your full idea library is ready." : starterActive ? "Your Pergola starter idea is ready." : unavailable ? "We could not verify paid access." : "Your account can browse the idea catalogue."}</h2>
          <p>{unavailable ? "Safe catalogue previews remain available. Protected content and project operations stay closed unless an independently valid grant can be verified; this is not a payment failure." : fullActive ? "IncomeNow verified the account session and the separate full-membership entitlement." : starterActive ? "This is one-idea starter access, not full monthly membership. It includes the Pergola idea and one personal project." : "You can search, filter, and bookmark safe previews. Full idea content and project creation still require an applicable grant. Checkout is not connected yet."}</p>
        </div>
        <dl className="access-details"><div><dt>Account</dt><dd>{context.displayName || "No display name"}</dd></div><div><dt>Email</dt><dd>{context.user.email}</dd></div><div><dt>Catalogue previews</dt><dd>Allowed</dd></div><div><dt>Full content</dt><dd>{fullActive ? "All included published ideas" : starterActive ? "Pergola idea only" : unavailable ? "Pending a fresh access check" : "No paid idea access"}</dd></div></dl>
        {notice ? <div className="access-notice" role="status">{notice}</div> : null}
        {fullActive&&subscription?.state==="cancel_at_period_end"&&subscription.entitlement_ends_at&&<p role="status">Membership active until {new Intl.DateTimeFormat("en-US",{dateStyle:"long",timeZone:"UTC"}).format(new Date(subscription.entitlement_ends_at))} (UTC). Your slot remains occupied through this paid period.</p>}
        {billingAccount?.waitlist_state==="waiting"&&<p role="status">You are on the membership waitlist.</p>}
        <div className="access-actions">
          {fullActive ? <Link className="primary-button" href="/app/explore">Open idea library <ArrowRight size={16} /></Link> : null}
          {starterActive ? <Link className="primary-button" href={starterProjectId ? `/app/projects/${starterProjectId}` : `/app/ideas/${starterIdea.slug}`}>{starterProjectId ? "Continue starter project" : "Open starter idea"} <ArrowRight size={16} /></Link> : null}
          {!fullActive && !starterActive ? <Link className="primary-button" href="/app/explore">Browse idea previews <ArrowRight size={16} /></Link> : null}
          {!fullActive && !starterActive && !unavailable ? <Link className="secondary-button" href="/membership?offer=starter#starter-offer">View the US$1 starter</Link> : null}
          {unavailable ? <Link className="secondary-button" href="/account/access">Retry access check</Link> : null}
          <Link className="secondary-button" href="/account/settings">Account settings</Link>
          {!fullActive&&!unavailable&&<Link className="secondary-button" href="/membership">{starterActive?"Upgrade to full membership":"Review full membership"}</Link>}
          {subscription?.provider_subscription_id&&billingView.portalAvailable&&<form action={manageMembershipBilling}><button className="secondary-button" type="submit">Manage Billing</button></form>}
          {fullActive&&subscription?.state==="active"&&billingView.billingConfigured&&<form action={cancelMembershipAtPeriodEnd}><button className="secondary-button" type="submit">Cancel at period end</button></form>}
        </div>
      </section>
    </AccountShell>
  );
}
