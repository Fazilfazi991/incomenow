import Link from "next/link";
import { ArrowRight, UserRound } from "lucide-react";
import type { PublicAccountState } from "@/lib/public-account";
import { PublicMobileMenu } from "./public-mobile-menu";

export function PublicAccountActions({ state, compact = false }: { state: PublicAccountState; compact?: boolean }) {
  if (state === "full") {
    return (
      <div className="public-account-actions">
        {!compact && <Link className="public-text-link" href="/account/access"><UserRound size={15} /> Account</Link>}
        <Link className="public-button public-button-primary" href="/app/explore">Open idea library <ArrowRight size={15} /></Link>
      </div>
    );
  }

  if (state === "starter") {
    return (
      <div className="public-account-actions">
        {!compact && <span className="public-access-note">Starter access includes the Pergola idea and one project</span>}
        <Link className="public-button public-button-primary" href="/app/ideas/pergola-quotation-follow-up-crm">Open starter idea <ArrowRight size={15} /></Link>
      </div>
    );
  }

  if (state === "registered") {
    return (
      <div className="public-account-actions">
        {!compact && <Link className="public-text-link" href="/account/access"><UserRound size={15} /> Account</Link>}
        <Link className="public-button public-button-primary" href="/app/explore">Browse idea library <ArrowRight size={15} /></Link>
      </div>
    );
  }

  if (state === "unavailable") {
    return (
      <div className="public-account-actions">
        {!compact && <span className="public-access-note">Account status is temporarily unavailable</span>}
        <Link className="public-button public-button-secondary" href="/account/access">Check account access</Link>
      </div>
    );
  }

  return (
    <div className="public-account-actions">
      <Link className="public-text-link" href="/login">Log in</Link>
      <Link className="public-button public-button-primary" href="/register">Create account <ArrowRight size={15} /></Link>
    </div>
  );
}

export function StarterOfferAction({ state, light = false }: { state: PublicAccountState; light?: boolean }) {
  const className = `public-button ${light ? "public-button-light" : "public-button-primary"} public-button-large`;
  if (state === "full") return <Link className={className} href="/app/explore">Open idea library <ArrowRight size={17} /></Link>;
  if (state === "starter") return <Link className={className} href="/app/ideas/pergola-quotation-follow-up-crm">Open your starter <ArrowRight size={17} /></Link>;
  if (state === "unavailable") return <Link className={className} href="/account/access">Check account access <ArrowRight size={17} /></Link>;
  if (state === "registered") return <Link className={className} href="/membership?offer=starter#starter-offer">Try IncomeNow for US$1 <ArrowRight size={17} /></Link>;
  const next = encodeURIComponent("/membership?offer=starter");
  return <Link className={className} href={`/register?next=${next}`}>Try IncomeNow for US$1 <ArrowRight size={17} /></Link>;
}

export function StarterOfferCopy({
  state,
  defaultHeading,
  defaultBody,
}: {
  state: PublicAccountState;
  defaultHeading: string;
  defaultBody: string;
}) {
  if (state === "starter") {
    return (
      <>
        <h2>Open your Pergola starter</h2>
        <p>Your Starter Pass already includes the Pergola Business Kit and one personal project. Open the idea to start or continue your work.</p>
      </>
    );
  }

  if (state === "full") {
    return (
      <>
        <h2>Explore your full idea library</h2>
        <p>Your membership already includes the Pergola Business Kit and all other included published ideas. Open the library to keep exploring or continue a project.</p>
      </>
    );
  }

  return (
    <>
      <h2>{defaultHeading}</h2>
      <p>{defaultBody}</p>
    </>
  );
}

function PublicHeader({ state, page, vault = false }: { state: PublicAccountState; page: "home" | "membership" | "privacy"; vault?: boolean }) {
  const root = page === "home" ? "" : "/";
  const showHeaderAccountAction = page !== "home" || state !== "unavailable";
  return (
    <header className="public-header">
      <div className="public-header-inner">
        <Link className="public-wordmark" href="/" aria-label="IncomeNow home">IncomeNow{!vault && <span>.in</span>}</Link>
        <nav className="public-nav" aria-label="Main navigation">
          <Link href={`${root}#how-it-works`}>How it works</Link>
          <Link href={`${root}#example-ideas`}>{vault ? "Opportunities" : "Example ideas"}</Link>
          <Link href="/membership" aria-current={page === "membership" ? "page" : undefined}>Membership</Link>
          <Link href={`${root}#faq`}>FAQ</Link>
        </nav>
        <div className="public-header-actions">{showHeaderAccountAction ? <PublicAccountActions state={state} compact /> : null}</div>
        <PublicMobileMenu root={root} opportunityLabel={vault ? "Opportunities" : "Example ideas"}>{showHeaderAccountAction ? <PublicAccountActions state={state} /> : null}</PublicMobileMenu>
      </div>
    </header>
  );
}

function PublicFooter({ vault = false }: { vault?: boolean }) {
  return (
    <footer className="public-footer">
      <div className="public-footer-inner">
        <div>
          <Link className="public-wordmark public-wordmark-light" href="/">IncomeNow{!vault && <span>.in</span>}</Link>
          <p>{vault ? "Pick a business. Get the system. Start." : "Practical digital business ideas, organised for careful validation and implementation."}</p>
        </div>
        <nav aria-label="Footer navigation">
          <Link href="/#how-it-works">How it works</Link>
          <Link href="/#example-ideas">{vault ? "Opportunities" : "Example ideas"}</Link>
          <Link href="/membership">Membership</Link>
          <Link href="/login">Member login</Link>
          <Link href="/privacy">Privacy</Link>
        </nav>
        <div className="public-footer-meta">
          <span>© {new Date().getFullYear()} {vault ? "IncomeNow" : "IncomeNow.in"}</span>
          <span>Independent ideas. No income guarantees.</span>
        </div>
      </div>
    </footer>
  );
}

export function PublicShell({ state, page, children, appearance = "default" }: { state: PublicAccountState; page: "home" | "membership" | "privacy"; children: React.ReactNode; appearance?: "default" | "vault" }) {
  return (
    <div className={`public-site${appearance === "vault" ? " vault-home" : ""}`}>
      <PublicHeader state={state} page={page} vault={appearance === "vault"} />
      <main>{children}</main>
      <PublicFooter vault={appearance === "vault"} />
    </div>
  );
}
