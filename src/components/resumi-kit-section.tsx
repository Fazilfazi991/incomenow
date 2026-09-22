import {
  ArrowRight,
  Bot,
  Check,
  CheckCircle2,
  FileArchive,
  FileText,
  Gauge,
  Info,
  LayoutTemplate,
  LockKeyhole,
  Rocket,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import type { Idea, IdeaSection } from "@/content/idea-schema";
import { resumiDistributionState } from "@/content/resumi-distribution";
import {
  resumiAiStates,
  resumiCodexPrompts,
  resumiDemoEvidence,
  resumiGrowthChannels,
  resumiLaunchChecklist,
  resumiOperatingMetrics,
  resumiPrivacyBoundary,
  resumiRebrandLocations,
  resumiScoringNotes,
  resumiSeoChecklist,
  resumiSoftwareScope,
  resumiTemplateGuide,
} from "@/content/resumi-kit-readiness";
import { projectStageCopy } from "@/content/project-copy";
import { CopyTextButton } from "./kit-interactions";
import { IdeaResourceAction, resourceAvailabilityLabel } from "./idea-resource-action";
import { ResumiScenarioPlanner } from "./resumi-scenario-planner";
import { StartIdeaControl } from "./start-idea-control";
import type { KitProjectProgress } from "./interactive-idea-kit";

function resource(idea: Idea, id: string) {
  return idea.resources.find((item) => item.id === id);
}

function Opportunity({ section }: { section: Extract<IdeaSection, { type: "overview" }> }) {
  return <div className="kit-section-body">
    <div className="opportunity-cards"><article><span><Users aria-hidden="true" size={19} /></span><small>Recurring need</small><h2>Job seekers repeatedly create, improve and adapt applications.</h2></article><article><span><LayoutTemplate aria-hidden="true" size={19} /></span><small>Starting point</small><h2>An existing consumer product—not a blank software project.</h2></article><article><span><Sparkles aria-hidden="true" size={19} /></span><small>Operator focus</small><h2>Attract users, improve completion and monetise selected value.</h2></article></div>
    <section className="resumi-model-compare" aria-labelledby="resumi-model-title"><div><span>Business model shift</span><h2 id="resumi-model-title">Operate a product, not a one-off client delivery</h2></div><div className="resumi-model-grid"><article><small>Client software business</small><p>Find client <ArrowRight size={14} /> customise <ArrowRight size={14} /> deliver</p></article><article><small>Resumi SaaS</small><p>Launch <ArrowRight size={14} /> attract users <ArrowRight size={14} /> improve conversion and retention <ArrowRight size={14} /> monetise selected value</p></article></div></section>
    <details className="kit-details" open><summary>Opportunity and evidence boundary <Info aria-hidden="true" size={16} /></summary><div>{section.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}<div className="kit-detail-callout"><ShieldCheck aria-hidden="true" size={18} /><p>{section.validation}</p></div></div></details>
  </div>;
}

function Demo({ idea, section }: { idea: Idea; section: Extract<IdeaSection, { type: "demo-preview" }> }) {
  const live = resource(idea, "resumi-demo");
  const builder = resource(idea, "resumi-builder");
  return <div className="kit-section-body">
    <section className="clinic-input-status resumi-live-status"><span><CheckCircle2 aria-hidden="true" size={22} /></span><div><small>Live public product</small><h2>Evaluate the real Resumi experience with fictional information.</h2><p>{section.description}</p></div><div className="resumi-demo-actions">{live ? <IdeaResourceAction resource={live} /> : null}{builder ? <IdeaResourceAction resource={builder} /> : null}</div></section>
    <section className="clinic-verification-list"><div><span>What to look at</span><h2>Short product walkthrough</h2></div><ol>{["Start the guest builder.", "Enter fictional personal details, experience and education.", "Review the score and recommendations.", "Switch templates and confirm content remains.", "Open the preview and inspect long-content behaviour.", "Choose a PDF option.", "Explore the rule-based cover-letter tool."].map((step, index) => <li key={step}><span>{String(index + 1).padStart(2, "0")}</span><p>{step}</p></li>)}</ol></section>
    <section className="software-scope" aria-labelledby="resumi-demo-evidence"><div className="software-scope-heading"><div><span>Live evidence</span><h2 id="resumi-demo-evidence">Observed and exercised separately</h2></div><p>Routes or interface cards are not counted as working features without supporting interaction evidence.</p></div><div className="software-scope-list">{resumiDemoEvidence.map((item) => <article key={item.feature}><div><h3>{item.feature}</h3><p>{item.notes}</p><small>Interaction: {item.exercised}</small></div><em data-status={item.observed}>{item.observed}</em></article>)}</div></section>
    <div className="kit-limitation"><Info aria-hidden="true" size={18} /><p>No interview, job, ATS acceptance or hiring outcome is guaranteed. The live PDF flow was submitted without a page error, but the browser harness did not independently capture the downloaded file.</p></div>
  </div>;
}

function Product({ section }: { section: Extract<IdeaSection, { type: "workflow" }> }) {
  return <div className="kit-section-body">
    <p className="kit-lead">{section.description}</p>
    <div className="resumi-product-flow">{section.steps.map((step, index) => <article key={step.id}><span>{String(index + 1).padStart(2, "0")}</span><h3>{step.title}</h3><p>{step.detail}</p></article>)}</div>
    <section className="software-scope" aria-labelledby="resumi-scope-title"><div className="software-scope-heading"><div><span>Software-scope matrix</span><h2 id="resumi-scope-title">Live, source and local evidence</h2></div><p>“Build verified” confirms compilation only. It does not verify hosted data, third-party services or production readiness.</p></div><div className="software-scope-list">{resumiSoftwareScope.map((item) => <article key={item.feature}><div><h3>{item.feature}</h3><p>{item.purpose}</p><small>Live: {item.live} · Source: {item.source}</small></div><em data-status={item.local}>{item.local}</em></article>)}</div></section>
    <details className="kit-details" open><summary>Before handling real resume data <ShieldCheck aria-hidden="true" size={16} /></summary><div>{resumiPrivacyBoundary.map((item) => <p key={item}>{item}</p>)}</div></details>
  </div>;
}

function Source({ idea, section }: { idea: Idea; section: Extract<IdeaSection, { type: "resources" }> }) {
  const source = resource(idea, "resumi-source");
  return <div className="kit-section-body">
    <section className="clinic-input-status clinic-source-status"><span><FileArchive aria-hidden="true" size={22} /></span><div><small>Sanitised package state</small><h2>{resumiDistributionState.statusLabel}</h2><p>{section.intro}</p></div></section>
    <ol className="setup-steps">{(section.steps ?? []).map((step, index) => <li key={step.title}><span>{index + 1}</span><div><h2>{step.title}</h2><p>{step.detail}</p></div></li>)}</ol>
    {source ? <div className="kit-resource-list"><article className="unavailable"><span><LockKeyhole aria-hidden="true" size={18} /></span><div><h3>{source.label}</h3><p>{source.description}</p><IdeaResourceAction resource={source} /></div><em>{resourceAvailabilityLabel(source.availability)}</em></article></div> : null}
    <div className="kit-limitation"><ShieldCheck aria-hidden="true" size={18} /><p><strong>Public-source and rights boundary:</strong> the inspected GitHub repository is public, so IncomeNow does not claim source exclusivity. The prepared archive remains disabled until the owner approves the exact package and confirms licence and brand-asset redistribution rights.</p></div>
  </div>;
}

function Guide({ section, mode }: { section: Extract<IdeaSection, { type: "workflow" }>; mode: "rebrand" | "templates" | "ats" | "ai" | "premium" | "seo" | "launch" }) {
  const config = {
    rebrand: { eyebrow: "Inspected source paths", title: "Change identity deliberately", items: resumiRebrandLocations, icon: FileText },
    templates: { eyebrow: "Template architecture", title: "Add layouts without losing content", items: resumiTemplateGuide, icon: LayoutTemplate },
    ats: { eyebrow: "Scoring boundary", title: "Explain guidance without promising an ATS pass", items: resumiScoringNotes, icon: Gauge },
    ai: { eyebrow: "Current vs future", title: "Separate useful live tools from placeholders", items: [] as readonly string[], icon: Bot },
    premium: { eyebrow: "Payments remain disabled", title: "Design the boundary before enabling checkout", items: section.steps.map((step) => `${step.title}: ${step.detail}`), icon: LockKeyhole },
    seo: { eyebrow: "Search acquisition", title: "Build useful content, not doorway pages", items: resumiSeoChecklist, icon: Search },
    launch: { eyebrow: "Launch checklist", title: "Prepare the product and its operating responsibilities", items: resumiLaunchChecklist, icon: Rocket },
  }[mode];
  const Icon = config.icon;
  return <div className="kit-section-body">
    <p className="kit-lead">{section.description}</p>
    <section className="resumi-guide-panel"><div className="resumi-guide-heading"><span><Icon aria-hidden="true" size={21} /></span><div><small>{config.eyebrow}</small><h2>{config.title}</h2></div></div>{mode === "ai" ? <div className="resumi-state-grid">{resumiAiStates.map((state) => <article key={state.state}><span>{state.state}</span><ul>{state.items.map((item) => <li key={item}><Check size={14} />{item}</li>)}</ul></article>)}</div> : <ol className="resumi-guide-list">{config.items.map((item, index) => <li key={item}><span>{String(index + 1).padStart(2, "0")}</span><p>{item}</p></li>)}</ol>}</section>
    {mode === "rebrand" || mode === "templates" || mode === "premium" ? <div className="codex-prompt-list"><div><span>Safe Codex helpers</span><h3>Inspect before changing production-facing code</h3></div>{resumiCodexPrompts.slice(mode === "rebrand" ? 0 : mode === "templates" ? 1 : 3, mode === "rebrand" ? 1 : mode === "templates" ? 2 : 4).map((prompt) => <article key={prompt}><p>{prompt}</p><CopyTextButton label="Copy prompt" text={prompt} /></article>)}<p className="codex-secret-warning"><ShieldCheck aria-hidden="true" size={16} /> Never include service-role keys, payment secrets, real resumes or customer exports in an AI prompt.</p></div> : null}
    {mode === "premium" ? <div className="kit-limitation"><Info aria-hidden="true" size={18} /><p>The source can create a one-time Stripe Checkout session when configured, but no webhook or server-side entitlement completion was found. Cancellation, refund, replay, failure and reconciliation flows still need design and testing.</p></div> : null}
  </div>;
}

function BusinessModel({ section }: { section: Extract<IdeaSection, { type: "pricing-planner" }> }) {
  return <div className="kit-section-body"><p className="kit-lead">{section.intro}</p><section className="clinic-package-grid">{section.packageStructures.map((model) => <article key={model.title}><span>Scenario—not a recommendation</span><h2>{model.title}</h2><ul>{model.items.map((item) => <li key={item}><Check size={15} />{item}</li>)}</ul></article>)}</section><ResumiScenarioPlanner /></div>;
}

function Growth({ section }: { section: Extract<IdeaSection, { type: "customer-discovery" }> }) {
  return <div className="kit-section-body"><section className="resumi-guide-panel"><div className="resumi-guide-heading"><span><Users aria-hidden="true" size={21} /></span><div><small>User acquisition</small><h2>Grow useful demand without promising traffic</h2></div></div><ol className="resumi-guide-list">{resumiGrowthChannels.map((item, index) => <li key={item}><span>{String(index + 1).padStart(2, "0")}</span><p>{item}</p></li>)}</ol></section><section className="customer-audiences"><div><span>Audience hypotheses</span><h2>Choose one user and application context first</h2></div><div>{section.audiences.map((audience) => <span key={audience}><Users size={15} />{audience}</span>)}</div></section><details className="kit-details" open><summary>Questions before choosing a channel <Info size={16} /></summary><div><ol>{section.questions.map((question) => <li key={question}>{question}</li>)}</ol><p>{section.guidance}</p></div></details></div>;
}

function Operate({ idea, section, project }: { idea: Idea; section: Extract<IdeaSection, { type: "action-plan" }>; project: KitProjectProgress | null }) {
  const progress = new Map(project?.stages.map((stage) => [stage.id, stage]));
  return <div className="kit-section-body"><section className="delivery-summary"><div><span>Optional personal project</span><h2>{project?.meaningful ? project.nextActionTitle : "Turn the kit into a measured launch plan"}</h2><p>Track preparation in one private project. Reading the kit never marks a task complete.</p></div>{project?.meaningful ? <div className="delivery-progress"><strong>{project.completedStageCount}/{project.totalStageCount}</strong><span>stages complete</span></div> : null}<StartIdeaControl appearance="primary" existingLabel="Open my Resumi project" existingProjectId={project?.id ?? null} ideaId={idea.id} mode="member" startLabel="Start my Resumi project" /></section><section className="resumi-guide-panel"><div className="resumi-guide-heading"><span><Gauge aria-hidden="true" size={21} /></span><div><small>Metrics to define</small><h2>Measure the product journey without inventing current analytics</h2></div></div><ol className="resumi-guide-list">{resumiOperatingMetrics.map((item, index) => <li key={item}><span>{String(index + 1).padStart(2, "0")}</span><p>{item}</p></li>)}</ol></section><details className="kit-details" open><summary>Privacy and operating boundary <ShieldCheck size={16} /></summary><div>{resumiPrivacyBoundary.map((item) => <p key={item}>{item}</p>)}</div></details><ol className="delivery-stage-map">{section.stages.map((stage, index) => { const saved = progress.get(stage.id); const display = projectStageCopy(stage); return <li className={saved?.complete ? "complete" : ""} key={stage.id}><span>{saved?.complete ? <Check size={15} /> : index + 1}</span><div><h3>{display.title}</h3><p>{display.summary}</p></div>{saved?.complete ? <em>Saved complete</em> : null}</li>; })}</ol></div>;
}

export function ResumiKitSection({ idea, section, project }: { idea: Idea; section: IdeaSection; project: KitProjectProgress | null }) {
  if (section.id === "resumi-opportunity" && section.type === "overview") return <Opportunity section={section} />;
  if (section.id === "resumi-demo" && section.type === "demo-preview") return <Demo idea={idea} section={section} />;
  if (section.id === "resumi-product" && section.type === "workflow") return <Product section={section} />;
  if (section.id === "resumi-source" && section.type === "resources") return <Source idea={idea} section={section} />;
  if (section.id === "resumi-rebrand" && section.type === "workflow") return <Guide mode="rebrand" section={section} />;
  if (section.id === "resumi-templates" && section.type === "workflow") return <Guide mode="templates" section={section} />;
  if (section.id === "resumi-ats" && section.type === "workflow") return <Guide mode="ats" section={section} />;
  if (section.id === "resumi-ai" && section.type === "workflow") return <Guide mode="ai" section={section} />;
  if (section.id === "resumi-business-model" && section.type === "pricing-planner") return <BusinessModel section={section} />;
  if (section.id === "resumi-premium" && section.type === "workflow") return <Guide mode="premium" section={section} />;
  if (section.id === "resumi-growth" && section.type === "customer-discovery") return <Growth section={section} />;
  if (section.id === "resumi-seo" && section.type === "workflow") return <Guide mode="seo" section={section} />;
  if (section.id === "resumi-launch" && section.type === "workflow") return <Guide mode="launch" section={section} />;
  if (section.id === "resumi-operate" && section.type === "action-plan") return <Operate idea={idea} project={project} section={section} />;
  return null;
}
