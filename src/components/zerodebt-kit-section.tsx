import { Bot, BrainCircuit, Check, CheckCircle2, Code2, FileArchive, Info, LockKeyhole, ShieldCheck } from "lucide-react";
import type { Idea, IdeaSection } from "@/content/idea-schema";
import {
  zeroDebtAiControls,
  zeroDebtCodexPrompts,
  zeroDebtDemoEvidence,
  zeroDebtDemoWalkthrough,
  zeroDebtGrowthPaths,
  zeroDebtLaunchChecks,
  zeroDebtOperatingMetrics,
  zeroDebtProductScope,
  zeroDebtRebrandFiles,
  zeroDebtTelegramArchitecture,
  zeroDebtTelegramEnvironment,
} from "@/content/zerodebt-kit-readiness";
import { zeroDebtSourceDownloadEnabled, zeroDebtSourceState } from "@/content/zerodebt-source-state";
import { projectStageCopy } from "@/content/project-copy";
import { ArtworkImage } from "./artwork-image";
import { CopyTextButton } from "./kit-interactions";
import { IdeaResourceAction } from "./idea-resource-action";
import type { KitProjectProgress } from "./interactive-idea-kit";
import { StartIdeaControl } from "./start-idea-control";
import { ZeroDebtScenarioPlanner } from "./zerodebt-scenario-planner";

function Opportunity({ idea, section }: { idea: Idea; section: Extract<IdeaSection, { type: "overview" }> }) {
  return <div className="kit-section-body zerodebt-section">
    <div className="zerodebt-opportunity-grid"><article><small>Consumer problem</small><h2>Many balances. No single next action.</h2><p>{section.friction}</p></article><article><small>Product promise to test</small><h2>One calm path toward zero.</h2><p>{section.validation}</p></article></div>
    <section className="zerodebt-zero-line" aria-label="Illustrative product flow"><div><span>Debts</span><i /></div><div><span>Cash flow</span><i /></div><div><span>Payoff plan</span><i /></div><strong>0</strong></section>
    <div className="zerodebt-model-flow"><span>User routine</span><p>{idea.intendedCustomer}</p><span>Possible business</span><p>{section.businessModel}</p></div>
    <details className="kit-details" open><summary>Evidence and validation notes <Info aria-hidden="true" size={16} /></summary><div>{section.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div></details>
  </div>;
}

function Demo({ idea, section }: { idea: Idea; section: Extract<IdeaSection, { type: "demo-preview" }> }) {
  const demo = idea.resources.find((resource) => resource.id === "zerodebt-demo");
  return <div className="kit-section-body zerodebt-section">
    <section className="zerodebt-demo-hero"><ArtworkImage alt={idea.coverArt.alt} className="zerodebt-demo-art" position={idea.coverArt.position} sizes="(max-width: 800px) 100vw, 48vw" src={idea.coverArt.src} /><div><span>Verified public demo</span><h2>Synthetic product walkthrough, isolated from real services</h2><p>{section.description}</p>{demo ? <IdeaResourceAction resource={demo} /> : null}</div></section>
    <div className="zerodebt-evidence-grid">{zeroDebtDemoEvidence.map((item) => <article key={item.label}><span>{item.label}</span><strong>{item.value}</strong></article>)}</div>
    <section className="clinic-verification-list"><div><span>What to look at</span><h2>A short evidence-led walkthrough</h2></div><ol>{zeroDebtDemoWalkthrough.map((step, index) => <li key={step}><span>{String(index + 1).padStart(2, "0")}</span><p>{step}</p></li>)}</ol></section>
  </div>;
}

function Product({ section }: { section: Extract<IdeaSection, { type: "workflow" }> }) {
  return <div className="kit-section-body zerodebt-section"><p className="kit-lead">{section.description}</p><div className="capability-grid">{section.steps.map((step, index) => <article key={step.id}><span>{String(index + 1).padStart(2, "0")}</span><h3>{step.title}</h3><p>{step.detail}</p></article>)}</div><section className="software-scope"><div className="software-scope-heading"><div><span>Verified product scope</span><h2>Build from evidence, then trim to the user routine</h2></div><p>Status describes the inspected source and synthetic demo—not a hosted production service.</p></div><div className="software-scope-list">{zeroDebtProductScope.map((item) => <article key={item.feature}><div><h3>{item.feature}</h3><p>{item.purpose}</p></div><em data-status={item.evidence}>{item.evidence}</em></article>)}</div></section>{section.safeguard ? <div className="kit-limitation"><ShieldCheck aria-hidden="true" size={18} /><p>{section.safeguard}</p></div> : null}</div>;
}

function Source({ section }: { section: Extract<IdeaSection, { type: "resources" }> }) {
  return <div className="kit-section-body zerodebt-section"><section className="zerodebt-status-card"><span><FileArchive aria-hidden="true" size={23} /></span><div><small>Canonical release state</small><h2>{zeroDebtSourceState.statusLabel}</h2><p>{section.intro}</p></div></section><div className="zerodebt-gate-grid"><article className="passed"><CheckCircle2 aria-hidden="true" size={22} /><span>Technical inspection</span><strong>Complete</strong><p>Source commit {zeroDebtSourceState.inspectedSourceCommit.slice(0, 12)} passed the recorded type, lint, test, build, security, and demo-isolation review.</p></article><article><LockKeyhole aria-hidden="true" size={22} /><span>Redistribution approval</span><strong>{zeroDebtSourceState.redistributionApproved ? "Approved" : "Pending"}</strong><p>No LICENSE file was found. Public repository visibility does not grant permission to package or sell the source.</p></article></div><ol className="setup-steps">{(section.steps ?? []).map((step, index) => <li key={step.title}><span>{index + 1}</span><div><h2>{step.title}</h2><p>{step.detail}</p></div></li>)}</ol>{!zeroDebtSourceDownloadEnabled ? <div className="kit-limitation"><ShieldCheck aria-hidden="true" size={18} /><p>No source URL, archive route, or download target is emitted by this kit while the approval gate is false.</p></div> : null}</div>;
}

function Rebrand({ section }: { section: Extract<IdeaSection, { type: "resources" }> }) {
  return <div className="kit-section-body zerodebt-section"><p className="kit-lead">{section.intro}</p><div className="zerodebt-file-grid">{zeroDebtRebrandFiles.map((file) => <article key={file.path}><Code2 aria-hidden="true" size={17} /><code>{file.path}</code><p>{file.purpose}</p></article>)}</div><ol className="setup-steps">{(section.steps ?? []).map((step, index) => <li key={step.title}><span>{index + 1}</span><div><h2>{step.title}</h2><p>{step.detail}</p></div></li>)}</ol><section className="codex-prompt-list"><div><span>Bounded Codex helpers</span><h3>Copy a prompt without secrets or invented owner details</h3></div>{zeroDebtCodexPrompts.map((prompt, index) => <article key={prompt}><p>{prompt}</p><CopyTextButton label={`Copy prompt ${index + 1}`} text={prompt} /></article>)}</section></div>;
}

function IntegrationGuide({ section, kind }: { section: Extract<IdeaSection, { type: "resources" }>; kind: "telegram" | "ai" }) {
  const Icon = kind === "telegram" ? Bot : BrainCircuit;
  const controls = kind === "telegram" ? zeroDebtTelegramArchitecture : zeroDebtAiControls;
  return <div className="kit-section-body zerodebt-section"><section className="zerodebt-status-card"><span><Icon aria-hidden="true" size={23} /></span><div><small>{kind === "telegram" ? "Inspected integration" : "Optional provider layer"}</small><h2>{kind === "telegram" ? "Plan an isolated Telegram connection" : "Keep AI optional, scoped, and costed"}</h2><p>{section.intro}</p></div></section><div className="zerodebt-control-list">{controls.map((control) => <article key={control}><Check aria-hidden="true" size={16} /><p>{control}</p></article>)}</div>{kind === "telegram" ? <details className="kit-details" open><summary>Environment names — never values <ShieldCheck aria-hidden="true" size={16} /></summary><div><ul>{zeroDebtTelegramEnvironment.map((item) => <li key={item}><code>{item.split(" — ")[0]}</code> — {item.split(" — ")[1]}</li>)}</ul><p>Deploy to a reviewed HTTPS origin before registering <code>/api/telegram/webhook</code>. Test a synthetic link, confirmation, replay, expiry, ownership failure, and provider outage. Never paste a bot token into IncomeNow, a prompt, source control, or client code.</p></div></details> : null}<ol className="setup-steps">{(section.steps ?? []).map((step, index) => <li key={step.title}><span>{index + 1}</span><div><h2>{step.title}</h2><p>{step.detail}</p></div></li>)}</ol><div className="kit-limitation"><Info aria-hidden="true" size={18} /><p>This member guide does not connect a provider, create credentials, set a webhook, send financial data, or enable a paid service.</p></div></div>;
}

function BusinessModel({ section }: { section: Extract<IdeaSection, { type: "pricing-planner" }> }) {
  return <div className="kit-section-body zerodebt-section"><p className="kit-lead">{section.intro}</p><div className="zerodebt-model-grid">{section.packageStructures.map((model, index) => <article key={model.title}><span>Model {String(index + 1).padStart(2, "0")}</span><h2>{model.title}</h2><ul>{model.items.map((item) => <li key={item}><Check aria-hidden="true" size={14} />{item}</li>)}</ul></article>)}</div><ZeroDebtScenarioPlanner /></div>;
}

function Guide({ section }: { section: Extract<IdeaSection, { type: "resources" }> }) {
  const content = section.id === "zerodebt-launch" ? zeroDebtLaunchChecks : section.id === "zerodebt-growth" ? zeroDebtGrowthPaths.map((item) => `${item.title}: ${item.detail}`) : null;
  return <div className="kit-section-body zerodebt-section"><p className="kit-lead">{section.intro}</p><ol className="setup-steps">{(section.steps ?? []).map((step, index) => <li key={step.title}><span>{index + 1}</span><div><h2>{step.title}</h2><p>{step.detail}</p></div></li>)}</ol>{content ? <section className="clinic-verification-list"><div><span>{section.id === "zerodebt-launch" ? "Launch evidence" : "Growth paths"}</span><h2>{section.id === "zerodebt-launch" ? "Checks before release" : "Useful acquisition loops to test"}</h2></div><ul>{content.map((item) => <li key={item}>{item}</li>)}</ul></section> : null}<div className="kit-limitation"><Info aria-hidden="true" size={18} /><p>{section.id === "zerodebt-subscriptions" ? "No payment or entitlement system is connected." : section.id === "zerodebt-advertising" ? "No advertising SDK, network, or placement is connected." : "Treat every step as a hypothesis until your own evidence supports it."}</p></div></div>;
}

function Operate({ idea, section, project }: { idea: Idea; section: Extract<IdeaSection, { type: "action-plan" }>; project: KitProjectProgress | null }) {
  const progress = new Map(project?.stages.map((stage) => [stage.id, stage]));
  return <div className="kit-section-body zerodebt-section"><section className="delivery-summary"><div><span>Private personal workspace</span><h2>{project?.meaningful ? project.nextActionTitle : "Turn the kit into a thirteen-stage operating plan"}</h2><p>Your notes and checklist progress stay separate from reading the kit.</p></div>{project?.meaningful ? <div className="delivery-progress"><strong>{project.completedStageCount}/{project.totalStageCount}</strong><span>stages complete</span></div> : null}<StartIdeaControl appearance="primary" existingLabel="Open my ZeroDebt project" existingProjectId={project?.id ?? null} ideaId={idea.id} mode="member" startLabel="Start my ZeroDebt project" /></section><section className="zerodebt-metrics"><div><span>Operating dashboard</span><h2>Measure useful behaviour, trust, reliability, and cost</h2></div><div>{zeroDebtOperatingMetrics.map((item) => <article key={item.group}><strong>{item.group}</strong><p>{item.metrics}</p></article>)}</div></section><ol className="delivery-stage-map">{section.stages.map((stage, index) => { const saved = progress.get(stage.id); const display = projectStageCopy(stage); return <li className={saved?.complete ? "complete" : ""} key={stage.id}><span>{saved?.complete ? <Check aria-hidden="true" size={15} /> : index + 1}</span><div><h3>{display.title}</h3><p>{display.summary}</p></div>{saved?.complete ? <em>Saved complete</em> : null}</li>; })}</ol></div>;
}

export function ZeroDebtKitSection({ idea, section, project }: { idea: Idea; section: IdeaSection; project: KitProjectProgress | null }) {
  if (section.id === "zerodebt-opportunity" && section.type === "overview") return <Opportunity idea={idea} section={section} />;
  if (section.id === "zerodebt-demo" && section.type === "demo-preview") return <Demo idea={idea} section={section} />;
  if (section.id === "zerodebt-product" && section.type === "workflow") return <Product section={section} />;
  if (section.id === "zerodebt-source" && section.type === "resources") return <Source section={section} />;
  if (section.id === "zerodebt-rebrand" && section.type === "resources") return <Rebrand section={section} />;
  if (section.id === "zerodebt-telegram" && section.type === "resources") return <IntegrationGuide kind="telegram" section={section} />;
  if (section.id === "zerodebt-ai" && section.type === "resources") return <IntegrationGuide kind="ai" section={section} />;
  if (section.id === "zerodebt-business-model" && section.type === "pricing-planner") return <BusinessModel section={section} />;
  if (["zerodebt-subscriptions", "zerodebt-advertising", "zerodebt-launch", "zerodebt-growth"].includes(section.id) && section.type === "resources") return <Guide section={section} />;
  if (section.id === "zerodebt-operate" && section.type === "action-plan") return <Operate idea={idea} project={project} section={section} />;
  return null;
}
