import type { Metadata } from "next";
import { publicPageMetadata } from "@/lib/site-config";
import Link from "next/link";
import { BookOpen, Check, CircleDollarSign, Cloud, Code2, CreditCard, ExternalLink, FolderKanban, Handshake, Library, Settings2, UserRoundPlus, Wrench } from "lucide-react";
import { PublicFaq } from "@/components/public-faq";
import { PublicShell, StarterOfferAction, StarterOfferCopy } from "@/components/public-site";
import { fullMembershipOffer, starterOffer } from "@/content/membership-offer";
import type { PublicAccountState } from "@/lib/public-account";
import { getPublicAccountState } from "@/lib/public-account.server";
import { fullMembershipAction } from "@/lib/full-membership-action";
import { getMembershipBillingView } from "@/lib/billing-view.server";
import { MembershipBillingControls } from "@/components/membership-billing-controls";
import { getAccountAccessContext } from "@/lib/membership.server";
import { getBillingAccount } from "@/lib/billing-store.server";
import "./membership.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  ...publicPageMetadata("/membership"),
  title: "Membership",
  description: "Understand the IncomeNow membership, its included idea library and project tools, and the current checkout status.",
};

const faq = [
  { question: "How does the active-member limit work?", answer: `Full membership is capped at ${fullMembershipOffer.capacity} active memberships, not historical users or starter accounts. When all slots are occupied, new paid membership closes. A cancellation at period end keeps its slot until paid entitlement ends, when a slot can reopen. Verified occupancy is shown when the server can retrieve the capacity ledger.` },
  { question: "What does the US$1 starter unlock?", answer: "The proposed one-time Starter Pass unlocks the Pergola Quotation & Follow-up CRM idea and one personal project for that idea. It does not unlock the rest of the library." },
  { question: "Is checkout available now?", answer: "Membership checkout opens when enrollment is enabled and capacity is available. Creating an account, following an offer link, or completing onboarding does not activate paid access." },
  { question: "How long does starter access last?", answer: "The access duration is not configured. That unresolved field must not be interpreted as advertised lifetime access." },
  { question: "Are hosting and third-party tools included?", answer: "No. Hosting, external subscriptions, custom development, and customer-specific configuration remain the member’s responsibility." },
  { question: "Does every idea contain the same resources?", answer: "No. Resources vary by idea and may include guides, examples, worksheets, workflows, templates, or checklists." },
  { question: "What licence applies to the resources?", answer: "Final permissions remain to be approved. Review the applicable resource rights before reuse or distribution." },
] as const;

function MembershipHeroCopy({ state }: { state: PublicAccountState }) {
  if (state === "starter") {
    return <><h1>Your Pergola starter is already active.</h1><p>Open the kit or continue its personal checklist. Full monthly membership remains a separate option for all included published kits.</p></>;
  }
  if (state === "full") {
    return <><h1>Your full membership is already active.</h1><p>Pick a business. Get the system. Start. Open an included execution kit or continue your project workspace. You do not need to purchase the Pergola starter separately.</p></>;
  }
  if (state === "unavailable") {
    return <><h1>Compare access while we recheck your account.</h1><p>The offers remain visible, but paid access stays closed until the server can confirm your current entitlement.</p></>;
  }
  return <><h1>Pick a business. Get the system. Start.</h1><p>Choose the separate US$1 Pergola starter or full IncomeNow membership: the opportunity library, execution kits, available templates, and your project workspace.</p></>;
}

export default async function MembershipPage({ searchParams }: {searchParams?:Promise<{billing?:string}>}) {
  const [accountState,billing,params] = await Promise.all([getPublicAccountState(),getMembershipBillingView(),searchParams??Promise.resolve({billing:undefined})]);
  const fullAction = fullMembershipAction(accountState);
  const context=await getAccountAccessContext();
  const billingAccount=context.user?await getBillingAccount(context.user.id):null;
  const hasInvitation=billingAccount?.invitation_active===true;
  const notices:Record<string,string>={full:"All membership slots are currently occupied or reserved. Join the waitlist when enrollment is available.",
    unavailable:"Billing is temporarily unavailable. Your current access remains checked independently. Please try again later.",
    cancelled:"Checkout was closed. No access is granted by returning to this page.",waitlisted:"You are on the membership waitlist. No queue position or invitation date is promised.",verify:"Verify your account email before managing membership."};
  return (
    <PublicShell state={accountState} page="membership">
      <section className="membership-hero public-container">
        <div className="membership-hero-copy">
          <nav aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span><span>Membership</span></nav>
          <MembershipHeroCopy state={accountState} />
          {params.billing&&notices[params.billing]&&<p role="status">{notices[params.billing]}</p>}
          {hasInvitation&&<p role="status">A membership slot is reserved for your account. Complete checkout before your invitation expires.</p>}
          <div className="membership-proof">
            <div><Library size={20} /><span><strong>Focused idea library</strong><small>Opportunities organised by customer and solution.</small></span></div>
            <div><FolderKanban size={20} /><span><strong>Personal project tools</strong><small>Save progress, checklists, decisions, and notes.</small></span></div>
          </div>
        </div>
        <div className="membership-comparison" aria-label="Compare IncomeNow access options">
          <div className="membership-comparison-head" id="starter-offer">
            <span>{starterOffer.name}</span><strong>{starterOffer.priceLabel}</strong><small>One-time proposal · {starterOffer.currency}</small>
          </div>
          <div className="membership-comparison-head" id="full-membership">
            <span>INCOMENOW MEMBERSHIP</span><strong>{fullMembershipOffer.priceLabelUsd}</strong><small>/ {fullMembershipOffer.interval} · {fullMembershipOffer.currency}</small>
          </div>
          <div className="membership-comparison-row"><span>Idea access</span><strong>Pergola Business Kit only</strong><strong>All included published kits</strong></div>
          <div className="membership-comparison-row"><span>Projects</span><strong>One Pergola project</strong><strong>One project per included idea</strong></div>
          <div className="membership-comparison-row"><span>Resources</span><strong>Pergola demo, source, and kit content</strong><strong>Published resources for each included kit</strong></div>
          <div className="membership-comparison-row"><span>Billing</span><strong>No automatic monthly renewal</strong><strong>{fullMembershipOffer.priceLabelUsd} / {fullMembershipOffer.interval} · {billing.checkoutAvailable?billing.mode==="test"?"test checkout":"monthly membership":"enrollment closed"}</strong></div>
          <div className="membership-comparison-row"><span>Access model</span><strong>Limited to the starter idea</strong><strong>Maximum {fullMembershipOffer.capacity} active members</strong></div>
          <div className="membership-comparison-actions">
            <div><StarterOfferAction state={accountState} /></div>
            <div><MembershipBillingControls state={accountState} capacity={billing.capacity} checkoutAvailable={billing.checkoutAvailable} waitlistAvailable={billing.waitlistAvailable} hasInvitation={hasInvitation} canManageBilling={billing.portalAvailable&&!!billingAccount?.customer_id}/></div>
          </div>
          <p className="membership-checkout-note"><CreditCard size={15} /> {billing.checkoutAvailable?billing.mode==="test"?"Stripe test mode. No real payments are processed.":"Secure payment through Stripe. Cancel at the end of your paid period.":"Membership enrollment is currently closed."} Starter checkout and duration remain unconfigured.</p>
          <p className="membership-checkout-note">{billing.checkoutAvailable?"Full membership requires verified payment. Starter access remains separate.":fullAction.notice}</p>
        </div>
      </section>

      <section className="public-section public-container membership-capacity-model" aria-labelledby="membership-capacity-title">
        <div className="public-section-heading"><div><h2 id="membership-capacity-title">Maximum {fullMembershipOffer.capacity} active memberships.</h2><p>The cap applies to active full memberships, not total historical users. Starter access is separate.</p></div></div>
        <p>When all active slots are occupied, new paid membership closes. If a member cancels at period end, their access and slot remain until their paid entitlement ends. A slot can then reopen.</p>
        {billing.capacity?<p>{billing.capacity.active===fullMembershipOffer.capacity?"Membership Full — ":""}{billing.capacity.active} / {fullMembershipOffer.capacity} active slots. {billing.capacity.allocatable} available to reserve; {billing.capacity.reserved} held for checkout or renewal confirmation.</p>:<p>Verified occupancy is unavailable. No production member count is estimated.</p>}
        <p>{billing.waitlistAvailable?"Waitlist enrollment is available to verified accounts when all slots are occupied or reserved.":"Waitlist enrollment is not connected yet."}</p>
      </section>

      <section className="public-section public-container membership-benefits">
        <div className="public-section-heading"><div><h2>A practical workspace, not an income promise</h2><p>Both access options organise information and next actions while keeping commercial decisions in your hands. The starter does not unlock the entire library.</p></div></div>
        <div className="membership-benefit-grid">
          <article><Library size={22} /><h3>Member idea library</h3><p>Review focused opportunities and compare what each would require.</p></article>
          <article><BookOpen size={22} /><h3>Execution kits and resources</h3><p>Access the templates, guides, tasks, and working aids published for each included opportunity.</p></article>
          <article><FolderKanban size={22} /><h3>Saved ideas and projects</h3><p>Keep shortlist decisions and personal implementation progress tied to your account.</p></article>
          <article><Wrench size={22} /><h3>Published improvements</h3><p>See future additions and resource improvements as they are released, without a promised cadence.</p></article>
        </div>
      </section>

      <section className="public-section public-section-tinted membership-scope"><div className="public-container">
        <div><h2>What membership covers</h2><p>The library, published idea resources, and the account-backed workspace currently available in IncomeNow.</p><ul><li><Check /> Opportunity and customer context</li><li><Check /> Implementation stages and checklists</li><li><Check /> Saved ideas, project state, and private notes</li><li><Check /> Resource labels and availability shown honestly</li></ul></div>
        <div><h2>What stays your responsibility</h2><p>Building and operating a customer-facing business remains separate from this membership.</p><ul><li><Cloud /> Hosting customer applications</li><li><CircleDollarSign /> Third-party tool charges</li><li><Code2 /> Custom development</li><li><Settings2 /> Customer-specific setup and ongoing operation</li></ul></div>
      </div></section>

      <section className="public-section public-container membership-steps">
        <div className="public-section-heading"><div><h2>How access will work</h2><p>A clear handoff from account creation to a verified grant—without treating sign-up, an offer URL, or onboarding as payment.</p></div></div>
        <ol>
          <li><span>1</span><UserRoundPlus /><div><h3>Create your account</h3><p>Use the existing registration and verification journey.</p></div></li>
          <li><span>2</span><Handshake /><div><h3>Review starter or full membership</h3><p>The Starter Pass is fixed to Pergola. Full membership is the separate broader option.</p></div></li>
          <li><span>3</span><CreditCard /><div><h3>Complete payment when available</h3><p>When checkout is available, complete payment securely in Stripe. Only verified payment confirmation opens full access.</p></div></li>
          <li><span>4</span><Library /><div><h3>Open verified access</h3><p>A trusted grant unlocks the specific idea or full membership independently.</p></div></li>
        </ol>
      </section>

      <section className="public-container membership-licence-note"><ExternalLink size={23} /><div><h2>Resource permissions still matter</h2><p>Some resources may be adaptable for client work; others may have narrower permissions. The final licence is not approved yet, so do not assume unrestricted resale rights.</p></div></section>

      <section id="membership-faq" className="public-section public-container public-faq-section">
        <div className="public-section-heading"><div><h2>Membership questions</h2><p>What is implemented now, and what still needs approval.</p></div></div>
        <PublicFaq items={faq} />
      </section>

      <section className="public-final-cta"><div className="public-container"><div><StarterOfferCopy state={accountState} defaultHeading="Try IncomeNow for US$1" defaultBody="Start with the Pergola Business Kit and one personal project. Browse examples first if you are still comparing." /></div><div className="public-account-actions"><Link className="public-button public-button-light" href="/#example-ideas">Browse examples</Link><StarterOfferAction state={accountState} light /></div></div></section>
    </PublicShell>
  );
}
