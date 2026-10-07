import Link from "next/link";
import { ArrowDown, ArrowRight, ArrowUpRight, Check, Layers3, LockKeyhole, ShieldCheck } from "lucide-react";
import type { PublicIdea } from "@/content/public-idea";
import type { PublicAccountState } from "@/lib/public-account";
import { membershipLaunch, type MembershipStats } from "@/lib/membership-capacity";
import { PublicShell, StarterOfferAction, StarterOfferCopy } from "@/components/public-site";
import { PublicIdeaGallery } from "@/components/public-idea-gallery";
import { PublicFaq } from "@/components/public-faq";
import { ExecutionFlow } from "./execution-flow";
import { MembershipCapacity } from "./membership-capacity";
import "./vault-home.css";

const faq = [
  { question: "Does joining create an active paid membership?", answer: "Creating an account lets you browse the safe catalogue. Full access opens only after verified payment confirmation. Registration alone does not activate a paid membership or unlock protected kits." },
  { question: "Is the 600-member cap a lifetime limit?", answer: `No. The membership model is limited to ${membershipLaunch.capacity} active memberships at any time. A cancellation keeps its slot until paid entitlement ends. When all slots are occupied, checkout closes; eligible accounts can join the waitlist when enrollment is available.` },
  { question: "What does the US$1 starter include?", answer: "The existing one-time Starter Pass is bound to the Pergola Business Kit and one account-owned project. It is separate from full membership. Checkout, access duration, taxes, refunds, and final resource rights remain unconfigured." },
  { question: "Will a business opportunity guarantee income?", answer: "No. You still need to validate demand, find customers, and deliver the work. IncomeNow gives you structure, resources, and a place to execute; it does not promise earnings." },
] as const;

function MembershipAccessAction({ state, stats, billingAvailable }: { state: PublicAccountState; stats: MembershipStats; billingAvailable:boolean }) {
  const href = state === "full" ? "/app/explore" : billingAvailable || stats.allocation==="full" ? "/membership" : state === "signed-out" ? `/register?next=${encodeURIComponent("/membership")}` : "/account/access";
  const label = state === "full" ? "Open your library" : state === "unavailable" ? "Check account access" : stats.source === "verified" && stats.allocation === "full" ? "View membership availability" : "Get access";
  return <Link href={href} className="vault-button vault-button-accent">{label}<ArrowUpRight size={19} aria-hidden="true" /></Link>;
}

export function VaultHomepage({ state, ideas, stats, billingAvailable=false, fontClass = "" }: { state: PublicAccountState; ideas: readonly PublicIdea[]; stats: MembershipStats; billingAvailable?:boolean; fontClass?: string }) {
  return (
    <PublicShell state={state} page="home" appearance="vault">
      <div className={`vault-content ${fontClass}`}>
        <section className="vault-hero vault-container" aria-labelledby="vault-title">
          <div className="vault-hero-copy">
            <h1 id="vault-title">Your next business<br /><em>is inside.</em></h1>
            <p>Pick a business. Get the system. Start.</p>
            <p className="vault-hero-description">Practical opportunities, execution kits, and a personal workspace to move from an idea to something you can build.</p>
            <div className="vault-hero-actions"><Link href="#example-ideas" className="vault-button vault-button-accent">Explore opportunities<ArrowUpRight size={19} aria-hidden="true" /></Link><Link href="#how-it-works" className="vault-button vault-button-outline">How IncomeNow works<ArrowDown size={17} aria-hidden="true" /></Link></div>
            <div className="vault-hero-notes"><span><ShieldCheck size={15} aria-hidden="true" /> Real kits. No income promises.</span><span>{membershipLaunch.capacity} active memberships maximum.</span></div>
          </div>
          <MembershipCapacity stats={stats} />
        </section>

        <section className="vault-operating vault-container" aria-labelledby="operating-title">
          <h2 id="operating-title">Not ideas.<br /><em>Operating plans.</em></h2>
          <div><p>An opportunity is only a starting point. IncomeNow connects the business, the resources, and the work that comes next.</p><ol aria-label="Opportunity progression">{["Discover", "Understand", "Set up", "Sell", "Track", "Grow"].map((step) => <li key={step}>{step}<ArrowRight size={14} aria-hidden="true" /></li>)}</ol></div>
        </section>

        <section id="example-ideas" className="vault-opportunities vault-container" aria-labelledby="opportunities-title">
          <div className="vault-section-heading"><div><h2 id="opportunities-title">The opportunity vault.</h2><p>Practical kits. Several ways to start building.</p></div><span className="vault-file-count">{String(ideas.length).padStart(2, "0")} PUBLIC FILES <Layers3 size={17} aria-hidden="true" /></span></div>
          {ideas.length ? <PublicIdeaGallery ideas={ideas} accountState={state} appearance="vault" /> : <p className="vault-empty">Public opportunities are being refreshed. You can still review membership and existing account access.</p>}
          <p className="vault-disclosure"><LockKeyhole size={14} aria-hidden="true" /> These are safe public summaries. Full execution kits stay inside the protected library.</p>
        </section>

        <section className="vault-system" aria-labelledby="system-title"><div className="vault-container">
          <div className="vault-section-heading"><div><h2 id="system-title">The system behind the opportunity.</h2><p>From “this could work” to “here’s my next step.” Explore what each stage gives you.</p></div></div>
          <ExecutionFlow />
          <div className="vault-system-route" aria-label="IncomeNow execution path"><span>Opportunity</span><ArrowRight size={17} aria-hidden="true" /><span>Execution kit</span><ArrowRight size={17} aria-hidden="true" /><span>Your project</span><ArrowRight size={17} aria-hidden="true" /><strong>Your business</strong></div>
        </div></section>

        <section id="membership-model" className="vault-limited" aria-labelledby="limited-title"><div className="vault-container">
          <div className="vault-limited-copy"><h2 id="limited-title">Built for {membershipLaunch.capacity}.<br />Never unlimited.</h2><p>Only {membershipLaunch.capacity} active memberships are available at any time. When all positions are occupied, new paid memberships close until a position becomes available.</p><p>When a cancelled paid entitlement ends, its position can reopen. It’s an active-member cap, not a limit on everyone who will ever join.</p><a href="#membership-offer" className="vault-limited-link">Explore membership<ArrowUpRight size={21} aria-hidden="true" /></a></div>
          <div className="vault-allocation"><div className="vault-allocation-title"><span>MEMBERSHIP ALLOCATION</span><LockKeyhole size={18} aria-hidden="true" /></div>
            <div className="vault-seat-grid" aria-hidden="true">{Array.from({ length: 60 }, (_, index) => <i className={stats.active !== null && index < Math.floor(stats.active / 10) ? "occupied" : ""} key={index} />)}</div>
            {stats.active !== null ? <dl className="vault-allocation-stats"><div><dt>Active</dt><dd>{stats.active}</dd></div><div><dt>Available</dt><dd>{stats.available}</dd></div><div><dt>Capacity</dt><dd>{stats.capacity}</dd></div></dl> : <div className="vault-allocation-unknown"><strong>{stats.capacity}</strong><span>active memberships maximum<br />Live occupancy not published.</span></div>}
            <p>{stats.source === "demo" ? "Design preview · illustrative count, not real members." : stats.source === "verified" ? "Verified membership allocation." : "Each cell represents ten positions in the membership model, not ten current members."}</p>
            <span className="vault-allocation-note">Available positions account for checkout reservations and renewal confirmation holds.</span>
          </div>
        </div></section>

        <section className="vault-reasons vault-container" aria-labelledby="reasons-title"><div><h2 id="reasons-title">Small by design.</h2><p>More attention to what’s inside. Less chasing unlimited signups.</p></div><dl><div><dt>Focused community</dt><dd>An intentionally small membership, built around doing the work.</dd></div><div><dt>Deeper kits</dt><dd>Useful systems and considered resources over sheer volume.</dd></div><div><dt>Better opportunities</dt><dd>Improve the published business systems as the library develops.</dd></div><div><dt>Execution first</dt><dd>The goal is helping members build, with commercial outcomes in their hands.</dd></div></dl></section>

        <section id="how-it-works" className="vault-how vault-container" aria-labelledby="how-title"><div className="vault-section-heading"><div><h2 id="how-title">Pick. Unlock. Build. Launch.</h2><p>You don’t need every idea. You need a direction and a way forward.</p></div></div><ol>{[
          ["Choose", "Find a model that fits your experience, budget, and market."],
          ["Unlock", "Understand the customer, offer, and execution plan inside your accessible kit."],
          ["Build", "Use the published resources, tools, and personal project checklist."],
          ["Launch", "Test your offer with customers and track what you learn in IncomeNow."],
        ].map(([title, body], index) => <li key={title}><span>{String(index + 1).padStart(2, "0")}</span><div><h3>{title}</h3><p>{body}</p></div></li>)}</ol></section>

        <section id="membership-offer" className="vault-offer-section vault-container" aria-labelledby="offer-title">
          <div className="vault-offer-story"><h2 id="offer-title">A business library.<br />A place to build.<br /><em>One membership.</em></h2><p>Go beyond the public summary. Full membership brings together the included published kits and your own project workspace.</p><div className="vault-starter"><StarterOfferCopy state={state} defaultHeading="Start smaller with the US$1 starter." defaultBody="The existing one-time Pergola Starter Pass includes one idea and one personal project. It remains separate from full membership." /><StarterOfferAction state={state} /><small>Starter checkout and duration remain unconfigured.</small></div></div>
          <div className="vault-membership-card"><div className="vault-membership-top"><span>INCOMENOW MEMBERSHIP</span><LockKeyhole size={21} aria-hidden="true" /></div><div className="vault-price"><strong>{membershipLaunch.priceLabel}</strong><span>/ {membershipLaunch.interval}</span></div><p>Maximum {membershipLaunch.capacity} active memberships.</p><ul>{["Included business opportunity library", "Full published execution kits", "Templates & available resources", "Your personal project workspace", "Step-by-step implementation tasks", "New opportunities & kit updates as published"].map((benefit) => <li key={benefit}><Check size={17} aria-hidden="true" />{benefit}</li>)}</ul><MembershipAccessAction state={state} stats={stats} billingAvailable={billingAvailable} /><small>{state === "full" ? "Your existing full access remains active." : billingAvailable ? "Membership opens after verified payment. Account registration alone does not activate access." : "Account registration is open. Membership enrollment is currently closed."}</small></div>
        </section>

        <section className="vault-recent vault-container" aria-labelledby="recent-title"><div className="vault-section-heading"><h2 id="recent-title">Inside the vault right now.</h2><a href="#example-ideas" className="vault-text-link">View public opportunities<ArrowUpRight size={17} aria-hidden="true" /></a></div><div className="vault-recent-list">{ideas.map((idea) => <a href="#example-ideas" key={idea.id}><span>#{idea.displayNumber}</span><div><h3>{idea.title}</h3><p>{idea.solutionType}</p></div><span className="vault-recent-status">PUBLISHED</span><ArrowUpRight size={20} aria-hidden="true" /></a>)}</div></section>

        <section id="faq" className="vault-faq vault-container" aria-labelledby="faq-title"><h2 id="faq-title">Before you get access.</h2><PublicFaq items={faq} /></section>

        <section className="vault-final" aria-labelledby="final-title"><div className="vault-container"><h2 id="final-title">One you can<br /><em>actually execute.</em></h2><p>You don’t need another idea to collect. Explore the vault and choose what you want to build.</p><span className="vault-final-cap">{membershipLaunch.capacity} ACTIVE MEMBERSHIPS MAXIMUM</span><Link href="#example-ideas" className="vault-button vault-button-accent">Explore IncomeNow<ArrowUpRight size={21} aria-hidden="true" /></Link></div></section>
      </div>
    </PublicShell>
  );
}
