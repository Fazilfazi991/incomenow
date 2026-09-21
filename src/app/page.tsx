import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpenCheck, ClipboardCheck, Compass, FolderKanban, Lightbulb, ShieldCheck, Sparkles } from "lucide-react";
import { ArtworkImage } from "@/components/artwork-image";
import { HeroMotionVideo } from "@/components/hero-motion-video";
import { PublicFaq } from "@/components/public-faq";
import { PublicHowItWorks } from "@/components/public-how-it-works";
import { PublicIdeaGallery } from "@/components/public-idea-gallery";
import { PublicShell, StarterOfferAction, StarterOfferCopy } from "@/components/public-site";
import { getPublicIdeas } from "@/content/public-content.server";
import { getPublicAccountState } from "@/lib/public-account.server";
import type { PublicAccountState } from "@/lib/public-account";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Practical business ideas to build and test",
  description: "Explore niche business opportunities with practical guides, example tools, and a clear process for finding customers.",
};

const faq = [
  { question: "Is IncomeNow a video-course library?", answer: "No. IncomeNow is an organised library of focused business opportunities, written guidance, example assets, and personal project checklists." },
  { question: "Do I need technical experience?", answer: "It depends on the idea. Each public preview identifies the likely technical requirements so you can judge fit before committing." },
  { question: "Does every idea include source code?", answer: "No. Resources vary by idea and may include examples, worksheets, guides, workflows, or templates. The Pergola starter currently includes a protected source archive; other resource states are labelled individually." },
  { question: "Will an idea guarantee income or customers?", answer: "No. Every opportunity still needs careful validation, good delivery, and customer outreach. IncomeNow provides structure, not guaranteed commercial results." },
  { question: "Can I resell the included resources?", answer: "Permissions depend on the resource and the final membership licence. Review the applicable permissions before adapting or distributing anything." },
  { question: "How often are new ideas released?", answer: "New opportunities and resource improvements are planned, but no fixed publishing cadence has been approved." },
] as const;

function HeroCopy() {
  return <p>Explore practical business opportunities with the tools, examples, and guidance to turn one into an offer.</p>;
}

function HomepageOfferAction({ state, light = false }: { state: PublicAccountState; light?: boolean }) {
  if (state === "unavailable") {
    return <Link className={`public-button ${light ? "public-button-light" : "public-button-primary"} public-button-large`} href="#example-ideas">Browse example ideas <ArrowRight size={17} /></Link>;
  }
  return <StarterOfferAction state={state} light={light} />;
}

export default async function HomePage() {
  const accountStatePromise = getPublicAccountState();
  const ideas = getPublicIdeas();
  const accountState = await accountStatePromise;

  return (
    <PublicShell state={accountState} page="home">
      <section className="public-hero public-container">
        <div className="public-hero-copy">
          <span className="digital-hero-eyebrow">IDEAS · RESOURCES · GUIDANCE</span>
          <h1>Find an idea. Build your version.</h1>
          <HeroCopy />
          <div className="public-hero-actions">
            <StarterOfferAction state={accountState} />
            <Link className="public-button public-button-secondary public-button-large" href="#example-ideas">Browse ideas</Link>
          </div>
        </div>
        <HeroMotionVideo />
      </section>

      <section id="how-it-works" className="public-section public-container digital-how-section">
        <div className="public-section-heading public-section-heading-split"><div><span className="digital-section-kicker">HOW IT WORKS</span><h2>A clear route from discovery to a first offer</h2><p>Select any stage to see what it helps you do. These stages explain the product; they do not mark your personal project complete.</p></div><span className="digital-section-note">Choose a stage — no fixed sequence required</span></div>
        <PublicHowItWorks />
      </section>

      <section id="example-ideas" className="public-section public-section-tinted digital-example-section">
        <div className="public-container">
          <div className="public-section-heading public-section-heading-split"><div><span className="digital-section-kicker">PUBLIC EXAMPLES</span><h2>Two real kits, two practical service directions</h2><p>Pergola is the US$1 starter. Clinic Operations CRM is another kit in the growing IncomeNow library and requires full membership for complete access.</p></div><Link href="/membership">See what membership includes <ArrowRight size={16} /></Link></div>
          <PublicIdeaGallery ideas={ideas} accountState={accountState} />
          <p className="public-honesty-note"><ShieldCheck size={16} /> Illustrations represent each industry idea. Resource availability is labelled from the same records used by the member library.</p>
        </div>
      </section>

      <section id="starter-offer" className="public-section public-container public-starter-feature">
        <div className="public-starter-copy">
          <h2>Start with the Pergola Business Kit</h2>
          <p>Browse the idea library and start with the Pergola Business Kit. The starter unlocks one idea and one personal project.</p>
          <ul>
            <li><ClipboardCheck size={18} /> Full written guidance for the canonical Pergola idea</li>
            <li><FolderKanban size={18} /> One account-owned project with checklists and private notes</li>
            <li><ShieldCheck size={18} /> Other ideas remain safe previews until full membership is active</li>
          </ul>
          <HomepageOfferAction state={accountState} />
          <small>Proposed one-time purchase. Checkout, access duration, refund terms, taxes, and final resource rights are not configured.</small>
        </div>
        <div className="public-starter-preview" role="region" aria-label="Pergola starter kit preview">
          <ArtworkImage
            alt="A timber pergola beside a table of plans, materials, and measuring tools"
            className="public-starter-art"
            sizes="(max-width: 767px) calc(100vw - 24px), 42vw"
            src="/artwork/marketing/modern/pergola-kit.webp"
          />
          <div className="public-starter-preview-copy">
            <span>IDEA #001</span>
            <h3>Pergola Business Kit</h3>
            <p>Explore the customer workflow, inspect the synthetic-data demo, review the protected source, and prepare a bounded offer.</p>
            <div><i /> Seven focused kit activities</div><div><i /> Public CRM demo</div><div><i /> One optional personal checklist</div>
          </div>
        </div>
      </section>

      <section className="public-section public-container public-includes">
        <div className="public-includes-preview">
          <div className="public-document-preview"><span>Opportunity brief</span><h3>Clinic Operations CRM</h3><p>Understand one administrative workflow before adapting the software or proposing a service.</p><div><i /><i /><i /></div></div>
          <div className="public-checklist-preview"><strong>Personal project</strong><span><i /> Choose a clinic segment</span><span><i /> Map the workflow</span><span><i /> Define a bounded offer</span></div>
        </div>
        <div className="public-includes-copy">
          <h2>More than a list of ideas</h2>
          <p>Each member idea is organised to help you understand the opportunity, decide what to build, and keep the work moving.</p>
          <ul>
            <li><Lightbulb size={19} /><span><strong>The opportunity and intended customer</strong><small>A focused starting point for your own validation.</small></span></li>
            <li><Sparkles size={19} /><span><strong>Relevant examples and resources</strong><small>Resource types vary, and not every idea includes source code.</small></span></li>
            <li><BookOpenCheck size={19} /><span><strong>Implementation guidance</strong><small>Structured stages turn a broad concept into manageable work.</small></span></li>
            <li><FolderKanban size={19} /><span><strong>Your personal project workspace</strong><small>Save progress, work through checklists, and keep private notes.</small></span></li>
          </ul>
        </div>
      </section>

      <section className="public-membership-band"><div className="public-container"><div><StarterOfferCopy state={accountState} defaultHeading="Start with one focused idea for US$1" defaultBody="Browse the idea library and start with the Pergola Business Kit. The starter unlocks one idea and one personal project. Full monthly membership remains the broader option." /></div><HomepageOfferAction state={accountState} light /></div></section>

      <section id="faq" className="public-section public-container public-faq-section">
        <div className="public-section-heading"><div><h2>Questions worth asking first</h2><p>Clear answers about what IncomeNow is—and what it is not.</p></div></div>
        <PublicFaq items={faq} />
      </section>

      <section className="public-final-cta"><div className="public-container"><div><Compass size={27} /><StarterOfferCopy state={accountState} defaultHeading="Try IncomeNow for US$1" defaultBody="Browse the idea library and start with the Pergola Business Kit. The starter unlocks one idea and one personal project." /></div><HomepageOfferAction state={accountState} light /></div></section>
    </PublicShell>
  );
}
