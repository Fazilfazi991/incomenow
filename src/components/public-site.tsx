import Link from "next/link";
import { ArrowRight, UserRound } from "lucide-react";
import type { PublicAccountState } from "@/lib/public-account";
import { PublicMobileMenu } from "./public-mobile-menu";

export function PublicAccountActions({ state, compact = false }: { state: PublicAccountState; compact?: boolean }) {
  if (state === "active") {
    return (
      <div className="public-account-actions">
        {!compact && <Link className="public-text-link" href="/account/access"><UserRound size={15} /> Account</Link>}
        <Link className="public-button public-button-primary" href="/app/explore">Open idea library <ArrowRight size={15} /></Link>
      </div>
    );
  }

  if (state === "inactive") {
    return (
      <div className="public-account-actions">
        {!compact && <span className="public-access-note">Membership access is inactive; checkout is not available yet</span>}
        <Link className="public-button public-button-primary" href="/account/access">View account access <ArrowRight size={15} /></Link>
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

function PublicHeader({ state, page }: { state: PublicAccountState; page: "home" | "membership" }) {
  const root = page === "home" ? "" : "/";
  return (
    <header className="public-header">
      <div className="public-header-inner">
        <Link className="public-wordmark" href="/" aria-label="IncomeNow home">IncomeNow<span>.in</span></Link>
        <nav className="public-nav" aria-label="Main navigation">
          <Link href={`${root}#how-it-works`}>How it works</Link>
          <Link href={`${root}#example-ideas`}>Example ideas</Link>
          <Link href="/membership" aria-current={page === "membership" ? "page" : undefined}>Membership</Link>
          <Link href={`${root}#faq`}>FAQ</Link>
        </nav>
        <div className="public-header-actions"><PublicAccountActions state={state} compact /></div>
        <PublicMobileMenu root={root}><PublicAccountActions state={state} /></PublicMobileMenu>
      </div>
    </header>
  );
}

function PublicFooter() {
  return (
    <footer className="public-footer">
      <div className="public-footer-inner">
        <div>
          <Link className="public-wordmark public-wordmark-light" href="/">IncomeNow<span>.in</span></Link>
          <p>Practical digital business ideas, organised for careful validation and implementation.</p>
        </div>
        <nav aria-label="Footer navigation">
          <Link href="/#how-it-works">How it works</Link>
          <Link href="/#example-ideas">Example ideas</Link>
          <Link href="/membership">Membership</Link>
          <Link href="/login">Member login</Link>
        </nav>
        <div className="public-footer-meta">
          <span>© {new Date().getFullYear()} IncomeNow.in</span>
          <span>Independent ideas. No income guarantees.</span>
        </div>
      </div>
    </footer>
  );
}

export function PublicShell({ state, page, children }: { state: PublicAccountState; page: "home" | "membership"; children: React.ReactNode }) {
  return (
    <div className="public-site">
      <PublicHeader state={state} page={page} />
      <main>{children}</main>
      <PublicFooter />
    </div>
  );
}
