import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpenCheck, Boxes, ClipboardCheck, Compass, FolderKanban, Lightbulb, Search, ShieldCheck, Sparkles, Target } from "lucide-react";
import { PublicFaq } from "@/components/public-faq";
import { PublicIdeaGallery } from "@/components/public-idea-gallery";
import { PublicShell, StarterOfferAction, StarterOfferCopy } from "@/components/public-site";
import { getPublicIdeas } from "@/content/public-content.server";
import { getPublicAccountState } from "@/lib/public-account.server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Practical business ideas to build and test",
  description: "Explore niche business opportunities with practical guides, example tools, and a clear process for finding customers.",
};

const processSteps = [
  { icon: Search, title: "Find an opportunity", body: "Browse focused opportunities built around a specific customer and problem." },
  { icon: Boxes, title: "Understand the kit", body: "Review the intended offer, technical needs, and the resources available for that idea." },
  { icon: ClipboardCheck, title: "Build your version", body: "Use the implementation guidance and personal checklist to shape a version you can test." },
  { icon: Target, title: "Test your offer", body: "Speak with potential customers, learn from the response, and refine before investing further." },
] as const;

const faq = [
  { question: "Is IncomeNow a video-course library?", answer: "No. IncomeNow is an organised library of focused business opportunities, written guidance, example assets, and personal project checklists." },
  { question: "Do I need technical experience?", answer: "It depends on the idea. Each public preview identifies the likely technical requirements so you can judge fit before committing." },
  { question: "Does every idea include source code?", answer: "No. Resources vary by idea and may include examples, worksheets, guides, workflows, or templates. Live downloads are not connected in this build." },
  { question: "Will an idea guarantee income or customers?", answer: "No. Every opportunity still needs careful validation, good delivery, and customer outreach. IncomeNow provides structure, not guaranteed commercial results." },
  { question: "Can I resell the included resources?", answer: "Permissions depend on the resource and the final membership licence. Review the applicable permissions before adapting or distributing anything." },
  { question: "How often are new ideas released?", answer: "New opportunities and resource improvements are planned, but no fixed publishing cadence has been approved." },
] as const;

export default async function HomePage() {
  const accountStatePromise = getPublicAccountState();
  const ideas = getPublicIdeas();
  const accountState = await accountStatePromise;

  return (
    <PublicShell state={accountState} page="home">
      <section className="public-hero public-container">
        <div className="public-hero-copy">
          <h1>Find an idea.<br />Build something you can sell.</h1>
          <p>Explore niche business opportunities with practical guides, example tools, and a clear process for finding customers.</p>
          <div className="public-hero-actions">
            <StarterOfferAction state={accountState} />
            <Link className="public-button public-button-secondary public-button-large" href="#example-ideas">Browse examples</Link>
          </div>
          <div className="public-hero-facts"><span><span>03</span> public examples</span><span><span>04</span> clear steps</span><span><span>01</span> member workspace</span></div>
        </div>
        <div className="public-library-preview" aria-label="Illustrative IncomeNow idea library">
          <div className="public-preview-toolbar"><strong>Idea library</strong><span>Member preview</span></div>
          <div className="public-preview-search"><Search size={15} /> Search by customer or solution</div>
          <div className="public-preview-layout">
            <aside><span className="active">All ideas</span><span>Saved</span><span>Projects</span></aside>
            <div className="public-preview-stack">
              <article><span>Custom CRM</span><strong>Pergola quotation workflow</strong><small>Customer follow-up · planning kit</small></article>
              <article><span>Automation</span><strong>Quotation follow-up tasks</strong><small>Workflow map · testing checklist</small></article>
              <article><span>Lead website</span><strong>Local-service enquiries</strong><small>Research worksheet · site structure</small></article>
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="public-section public-container">
        <div className="public-section-heading"><div><h2>A practical path from idea to evidence</h2><p>Move in small, reviewable steps. The process helps you make better decisions; it does not promise a sale.</p></div></div>
        <div className="public-process-grid">
          {processSteps.map((step, index) => <article key={step.title}><span className="public-step-number">0{index + 1}</span><step.icon size={23} /><h3>{step.title}</h3><p>{step.body}</p></article>)}
        </div>
      </section>

      <section id="example-ideas" className="public-section public-section-tinted">
        <div className="public-container">
          <div className="public-section-heading public-section-heading-split"><div><h2>Explore a few example ideas</h2><p>Public summaries from the same stable records used by the member library.</p></div><Link href="/membership">See what membership includes <ArrowRight size={16} /></Link></div>
          <PublicIdeaGallery ideas={ideas} accountState={accountState} />
          <p className="public-honesty-note"><ShieldCheck size={16} /> These are sample opportunities. Live demos and downloadable files are not connected yet.</p>
        </div>
      </section>

      <section id="starter-offer" className="public-section public-container public-starter-feature">
        <div className="public-starter-copy">
          <span className="public-eyebrow">IncomeNow Starter Pass · US$1</span>
          <h2>Start with the Pergola Business Kit</h2>
          <p>Browse the idea library and start with the Pergola Business Kit. The starter unlocks one idea and one personal project.</p>
          <ul>
            <li><ClipboardCheck size={18} /> Full written guidance for the canonical Pergola idea</li>
            <li><FolderKanban size={18} /> One account-owned project with checklists and private notes</li>
            <li><ShieldCheck size={18} /> Other ideas remain safe previews until full membership is active</li>
          </ul>
          <StarterOfferAction state={accountState} />
          <small>Proposed one-time purchase. Checkout, access duration, refund terms, taxes, and final resource rights are not configured.</small>
        </div>
        <div className="public-starter-preview" aria-label="Pergola starter kit preview">
          <span>IDEA #001</span>
          <h3>Pergola Quotation & Follow-up CRM</h3>
          <p>Investigate the buyer workflow, prepare a relevant demonstration, define scope, and manage a single implementation checklist.</p>
          <div><i /> Problem validation</div><div><i /> Illustrative CRM walkthrough</div><div><i /> Offer and handover planning</div>
          <strong>Starter project not started</strong>
        </div>
      </section>

      <section className="public-section public-container public-includes">
        <div className="public-includes-preview">
          <div className="public-document-preview"><span>Opportunity brief</span><h3>Local-service lead website</h3><p>Define the buyer, service area, and provider handoff before building.</p><div><i /><i /><i /></div></div>
          <div className="public-checklist-preview"><strong>Personal project</strong><span><i /> Research demand</span><span><i /> Interview providers</span><span><i /> Define the first offer</span></div>
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

      <section className="public-membership-band"><div className="public-container"><div><StarterOfferCopy state={accountState} defaultHeading="Start with one focused idea for US$1" defaultBody="Browse the idea library and start with the Pergola Business Kit. The starter unlocks one idea and one personal project. Full monthly membership remains the broader option." /></div><StarterOfferAction state={accountState} light /></div></section>

      <section id="faq" className="public-section public-container public-faq-section">
        <div className="public-section-heading"><div><h2>Questions worth asking first</h2><p>Clear answers about what IncomeNow is—and what it is not.</p></div></div>
        <PublicFaq items={faq} />
      </section>

      <section className="public-final-cta"><div className="public-container"><div><Compass size={27} /><StarterOfferCopy state={accountState} defaultHeading="Try IncomeNow for US$1" defaultBody="Browse the idea library and start with the Pergola Business Kit. The starter unlocks one idea and one personal project." /></div><StarterOfferAction state={accountState} light /></div></section>
    </PublicShell>
  );
}
