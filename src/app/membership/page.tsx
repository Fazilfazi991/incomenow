import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, Check, CircleDollarSign, Cloud, Code2, CreditCard, ExternalLink, FolderKanban, Handshake, Library, Settings2, UserRoundPlus, Wrench } from "lucide-react";
import { PublicFaq } from "@/components/public-faq";
import { PublicAccountActions, PublicShell } from "@/components/public-site";
import { membershipOffer } from "@/content/membership-offer";
import { getPublicAccountState } from "@/lib/public-account.server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Membership",
  description: "Understand the IncomeNow membership, its included idea library and project tools, and the current checkout status.",
};

const faq = [
  { question: "What is available after membership is confirmed?", answer: "Active members can use the protected idea library, save ideas, and work through personal project checklists with private notes." },
  { question: "Is checkout available now?", answer: "No. The final price and payment flow have not been configured. Creating an account does not activate membership." },
  { question: "Are hosting and third-party tools included?", answer: "No. Hosting, external subscriptions, custom development, and customer-specific configuration remain the member’s responsibility." },
  { question: "Does every idea contain the same resources?", answer: "No. Resources vary by idea and may include guides, examples, worksheets, workflows, templates, or checklists." },
  { question: "What licence applies to the resources?", answer: "Final permissions remain to be approved. Review the applicable resource rights before reuse or distribution." },
] as const;

export default async function MembershipPage() {
  const accountState = await getPublicAccountState();
  return (
    <PublicShell state={accountState} page="membership">
      <section className="membership-hero public-container">
        <div className="membership-hero-copy">
          <nav aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span><span>Membership</span></nav>
          <h1>One membership.<br />Practical ideas to build on.</h1>
          <p>Get the organised idea library, supporting resources, and a personal workspace for moving from research to a testable offer.</p>
          <div className="membership-proof">
            <div><Library size={20} /><span><strong>Focused idea library</strong><small>Opportunities organised by customer and solution.</small></span></div>
            <div><FolderKanban size={20} /><span><strong>Personal project tools</strong><small>Save progress, checklists, decisions, and notes.</small></span></div>
          </div>
        </div>
        <aside className="membership-price-card" aria-label="Membership offer">
          <div><span>{membershipOffer.name}</span><strong>{membershipOffer.priceLabel}</strong><small>{membershipOffer.billingInterval} subscription</small></div>
          <ul><li><Check size={16} /> Member idea library</li><li><Check size={16} /> Idea-specific resources</li><li><Check size={16} /> Saved ideas and projects</li><li><Check size={16} /> Published additions and improvements</li></ul>
          <PublicAccountActions state={accountState} />
          <p><CreditCard size={15} /> Paid checkout is not available in this build.</p>
        </aside>
      </section>

      <section className="public-section public-container membership-benefits">
        <div className="public-section-heading"><div><h2>A practical workspace, not an income promise</h2><p>Membership organises the information and your next actions while keeping commercial decisions in your hands.</p></div></div>
        <div className="membership-benefit-grid">
          <article><Library size={22} /><h3>Member idea library</h3><p>Review focused opportunities and compare what each would require.</p></article>
          <article><BookOpen size={22} /><h3>Resources by idea</h3><p>Access the examples, guides, and working aids published for that specific opportunity.</p></article>
          <article><FolderKanban size={22} /><h3>Saved ideas and projects</h3><p>Keep shortlist decisions and personal implementation progress tied to your account.</p></article>
          <article><Wrench size={22} /><h3>Published improvements</h3><p>See future additions and resource improvements as they are released, without a promised cadence.</p></article>
        </div>
      </section>

      <section className="public-section public-section-tinted membership-scope"><div className="public-container">
        <div><h2>What membership covers</h2><p>The library, published idea resources, and the account-backed workspace currently available in IncomeNow.</p><ul><li><Check /> Opportunity and customer context</li><li><Check /> Implementation stages and checklists</li><li><Check /> Saved ideas, project state, and private notes</li><li><Check /> Resource labels and availability shown honestly</li></ul></div>
        <div><h2>What stays your responsibility</h2><p>Building and operating a customer-facing business remains separate from this membership.</p><ul><li><Cloud /> Hosting customer applications</li><li><CircleDollarSign /> Third-party tool charges</li><li><Code2 /> Custom development</li><li><Settings2 /> Customer-specific setup and ongoing operation</li></ul></div>
      </div></section>

      <section className="public-section public-container membership-steps">
        <div className="public-section-heading"><div><h2>How access will work</h2><p>A clear handoff from account creation to confirmed membership—without treating sign-up as payment.</p></div></div>
        <ol>
          <li><span>1</span><UserRoundPlus /><div><h3>Create your account</h3><p>Use the existing registration and verification journey.</p></div></li>
          <li><span>2</span><Handshake /><div><h3>Review the final offer</h3><p>Confirm the approved price, terms, and resource permissions when published.</p></div></li>
          <li><span>3</span><CreditCard /><div><h3>Complete payment when available</h3><p>Checkout is not connected yet, so account creation alone does not activate access.</p></div></li>
          <li><span>4</span><Library /><div><h3>Open the member library</h3><p>Access begins only after the account has a confirmed active entitlement.</p></div></li>
        </ol>
      </section>

      <section className="public-container membership-licence-note"><ExternalLink size={23} /><div><h2>Resource permissions still matter</h2><p>Some resources may be adaptable for client work; others may have narrower permissions. The final licence is not approved yet, so do not assume unrestricted resale rights.</p></div></section>

      <section id="membership-faq" className="public-section public-container public-faq-section">
        <div className="public-section-heading"><div><h2>Membership questions</h2><p>What is implemented now, and what still needs approval.</p></div></div>
        <PublicFaq items={faq} />
      </section>

      <section className="public-final-cta"><div className="public-container"><div><h2>See the ideas before you decide</h2><p>Browse the public examples, then use the existing account journey when you are ready.</p></div><div className="public-account-actions"><Link className="public-button public-button-light" href="/#example-ideas">Explore example ideas</Link><PublicAccountActions state={accountState} /></div></div></section>
    </PublicShell>
  );
}
