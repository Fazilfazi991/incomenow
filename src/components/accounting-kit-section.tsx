import { Bot, Check, CircleDashed, FileArchive, Info, LockKeyhole, Search, ShieldCheck, Users } from "lucide-react";
import {
  accountingAiEvidence,
  accountingDeliveryGuide,
  accountingDemoEvidence,
  accountingSafePrompts,
  accountingSetupGuide,
  accountingSoftwareScope,
} from "@/content/accounting-kit-readiness";
import { projectStageCopy } from "@/content/project-copy";
import type { Idea, IdeaSection } from "@/content/idea-schema";
import type { KitProjectProgress } from "./interactive-idea-kit";
import { AccountingPricingPlanner } from "./accounting-kit-tools";
import { CopyTextButton, SalesTemplateWorkbench, type SalesTemplate } from "./kit-interactions";
import { IdeaResourceAction } from "./idea-resource-action";
import { StartIdeaControl } from "./start-idea-control";

function resourceById(idea: Idea, id: string) {
  return idea.resources.find((resource) => resource.id === id);
}

function AccountingOpportunity({ idea, section }: { idea: Idea; section: Extract<IdeaSection, { type: "overview" }> }) {
  return <div className="kit-section-body"><div className="opportunity-cards"><article><span><Users aria-hidden="true" size={19} /></span><small>Potential customer</small><h2>{idea.intendedCustomer}</h2></article><article><span><Search aria-hidden="true" size={19} /></span><small>Problem to investigate</small><h2>{section.friction}</h2></article><article><span><ShieldCheck aria-hidden="true" size={19} /></span><small>Possible service</small><h2>{section.businessModel}</h2></article></div><section className="accounting-ledger-flow" aria-label="Accounting service workflow"><div><span>01</span><strong>Map the finance workflow</strong></div><div><span>02</span><strong>Configure with synthetic data</strong></div><div><span>03</span><strong>Test controls and reports</strong></div><div><span>04</span><strong>Handover with professional review</strong></div></section><details className="kit-details"><summary>Evidence, validation, and professional boundary <Info aria-hidden="true" size={16} /></summary><div>{section.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}<div className="kit-detail-callout"><ShieldCheck aria-hidden="true" size={18} /><p>{section.validation}</p></div></div></details></div>;
}

function AccountingDemo({ idea, section }: { idea: Idea; section: Extract<IdeaSection, { type: "demo-preview" }> }) {
  const demo = resourceById(idea, "accounting-demo");
  return <div className="kit-section-body"><section className="accounting-demo-status"><div><span>Local evidence only</span><h2>Review the verified synthetic demo scope</h2><p>{section.description}</p>{demo ? <IdeaResourceAction resource={demo} /> : null}</div><div className="accounting-demo-badge"><CircleDashed aria-hidden="true" size={22} /><strong>Public URL pending</strong><span>Do not share localhost as a visitor link</span></div></section><div className="demo-evidence-row">{section.metrics.map((metric) => <article key={metric.label}><span>{metric.label}</span><strong>{metric.value}</strong></article>)}</div><section className="accounting-evidence-ledger"><div className="accounting-evidence-head"><span>Area</span><span>Evidence</span><span>What was established</span></div>{accountingDemoEvidence.map((item) => <article key={item.feature}><strong>{item.feature}</strong><em>{item.evidence}</em><p>{item.notes}</p></article>)}</section><div className="kit-limitation"><Info aria-hidden="true" size={18} /><p><strong>Evidence boundary:</strong> the demo is browser-local and synthetic. Authenticated product mode, production posting, RLS, migrations, live integrations, AI output, and accounting/tax correctness were not verified by the demo.</p></div></div>;
}

function AccountingSoftware({ idea, section }: { idea: Idea; section: Extract<IdeaSection, { type: "workflow" }> }) {
  const source = resourceById(idea, "accounting-source");
  return <div className="kit-section-body"><div className="software-intro"><div><span>Inspected foundation</span><h2>Scope the software around the customer&apos;s real controls</h2><p>{section.description}</p></div>{source ? <IdeaResourceAction resource={source} /> : null}</div><section className="accounting-evidence-ledger"><div className="accounting-evidence-head"><span>Capability</span><span>Status</span><span>Bounded purpose</span></div>{accountingSoftwareScope.map((item) => <article key={item.feature}><strong>{item.feature}</strong><em>{item.status}</em><p>{item.purpose}</p></article>)}</section>{source ? <div className="kit-limitation"><FileArchive aria-hidden="true" size={18} /><p><strong>Source delivery stays closed:</strong> {source.description}</p></div> : null}{section.safeguard ? <details className="kit-details" open><summary>Technical and professional safeguards <ShieldCheck aria-hidden="true" size={16} /></summary><div><p>{section.safeguard}</p></div></details> : null}</div>;
}

function AccountingSetup({ idea, section }: { idea: Idea; section: Extract<IdeaSection, { type: "resources" }> }) {
  const guide = resourceById(idea, "accounting-setup-guide");
  const source = resourceById(idea, "accounting-source");
  return <div className="kit-section-body"><p className="kit-lead">{section.intro}</p><div className="kit-resource-list">{[guide, source].filter(Boolean).map((resource) => <article className={resource!.availability === "not-connected" ? "unavailable" : ""} key={resource!.id}><span>{resource!.availability === "available" ? <Check aria-hidden="true" size={18} /> : <LockKeyhole aria-hidden="true" size={18} />}</span><div><h3>{resource!.label}</h3><p>{resource!.description}</p><IdeaResourceAction resource={resource!} /></div><em>{resource!.availability === "available" ? "Available" : "Unavailable"}</em></article>)}</div><section className="setup-guide" aria-labelledby="accounting-setup-title"><div className="setup-guide-heading"><span>Member implementation guide</span><h2 id="accounting-setup-title">Prepare, configure, test, and hand over safely</h2><p>“Verified” describes the inspected local evidence only. Customer services, data, Auth/RLS, deployment, AI, recovery, and professional acceptance require separate work.</p></div><div className="setup-guide-sections">{accountingSetupGuide.map((step, index) => <details className="setup-guide-step" key={step.id} open={index === 0}><summary><span>{step.label}</span><div><strong>{step.title}</strong><em>{step.status}</em></div></summary><div><p>{step.body}</p>{"commands" in step && step.commands ? <pre><code>{step.commands.join("\n")}</code></pre> : null}</div></details>)}</div></section><section className="codex-prompt-list"><div><span>Safe AI-assisted preparation</span><h3>Prompts that exclude secrets and real finance data</h3></div>{accountingSafePrompts.slice(0, 4).map((prompt, index) => <article key={prompt}><p>{prompt}</p><CopyTextButton label={`Copy prompt ${index + 1}`} text={prompt} /></article>)}<p className="codex-secret-warning"><ShieldCheck aria-hidden="true" size={16} /> Never paste credentials, bank details, personal data, tax identifiers, full ledgers, or customer exports into an AI prompt.</p></section></div>;
}

function AccountingWorkflow({ section }: { section: Extract<IdeaSection, { type: "workflow" }> }) {
  return <div className="kit-section-body"><p className="kit-lead">{section.description}</p><ol className="accounting-workflow-steps">{section.steps.map((step, index) => <li key={step.id}><span>{String(index + 1).padStart(2, "0")}</span><div><h2>{step.title}</h2><p>{step.detail}</p>{step.condition ? <em>{step.condition}</em> : null}</div></li>)}</ol>{section.safeguard ? <div className="kit-limitation"><ShieldCheck aria-hidden="true" size={18} /><p>{section.safeguard}</p></div> : null}</div>;
}

function AccountingAiWorkflow({ section }: { section: Extract<IdeaSection, { type: "workflow" }> }) {
  return <div className="kit-section-body"><p className="kit-lead">{section.description}</p><div className="accounting-ai-evidence">{accountingAiEvidence.map((item) => <article key={item.title}><span><Bot aria-hidden="true" size={18} /></span><div><h2>{item.title}</h2><p>{item.body}</p></div></article>)}</div><details className="kit-details" open><summary>Customer-owned configuration checklist <ShieldCheck aria-hidden="true" size={16} /></summary><div><ol>{section.steps.map((step) => <li key={step.id}><strong>{step.title}:</strong> {step.detail}</li>)}</ol></div></details><section className="codex-prompt-list"><div><span>Optional prompt templates</span><h3>Use synthetic or minimised inputs only</h3></div>{accountingSafePrompts.slice(4).map((prompt, index) => <article key={prompt}><p>{prompt}</p><CopyTextButton label={`Copy optional prompt ${index + 1}`} text={prompt} /></article>)}</section><div className="clinic-privacy-boundary"><ShieldCheck aria-hidden="true" size={23} /><div><span>Human review required</span><h2>AI is optional, disabled by default, and not professional advice.</h2><p>Do not use AI output as authority for account coding, tax/VAT treatment, posting, payment, reconciliation, audit, legal, investment, or financial decisions.</p></div></div></div>;
}

function AccountingProspects({ section }: { section: Extract<IdeaSection, { type: "customer-discovery" }> }) {
  return <div className="kit-section-body"><section className="clinic-input-status"><span><Search aria-hidden="true" size={22} /></span><div><small>Research method ready</small><h2>Prospect list not supplied.</h2><p>No businesses, contacts, interest, or demand have been invented. Build a small list from published business sources and verify each contact route.</p></div></section><section className="customer-audiences"><div><span>Research targets—not demand evidence</span><h2>Businesses to investigate</h2></div><div>{section.audiences.map((audience) => <span key={audience}><Users aria-hidden="true" size={15} />{audience}</span>)}</div></section><details className="kit-details" open><summary>Discovery questions <ShieldCheck aria-hidden="true" size={16} /></summary><div><ol>{section.questions.map((question) => <li key={question}>{question}</li>)}</ol><p>{section.guidance}</p></div></details></div>;
}

function AccountingConversation({ section }: { section: Extract<IdeaSection, { type: "sales-kit" }> }) {
  const templates = section.items.filter((item): item is typeof item & SalesTemplate => Boolean(item.kind && item.kind !== "guide" && item.template)).map((item) => ({ title: item.title, detail: item.detail, kind: item.kind as SalesTemplate["kind"], subject: item.subject, template: item.template! }));
  return <div className="kit-section-body"><p className="kit-lead">{section.intro}</p><SalesTemplateWorkbench templates={templates} /><div className="kit-limitation"><Info aria-hidden="true" size={18} /><p>These are editable starting points, not proven sales scripts. Replace every placeholder, verify the recipient and relevance, and make no savings, revenue, accuracy, compliance, or demand claim.</p></div></div>;
}

function AccountingPricing({ section }: { section: Extract<IdeaSection, { type: "pricing-planner" }> }) {
  return <div className="kit-section-body"><p className="kit-lead">{section.intro}</p><AccountingPricingPlanner /><div className="clinic-package-grid">{section.packageStructures.map((item) => <article key={item.title}><span>Example structure</span><h2>{item.title}</h2><ul>{item.items.map((line) => <li key={line}><Check aria-hidden="true" size={15} />{line}</li>)}</ul></article>)}</div></div>;
}

function AccountingPackages({ section }: { section: Extract<IdeaSection, { type: "tools" }> }) {
  return <div className="kit-section-body"><p className="kit-lead">{section.intro}</p><div className="accounting-package-options">{section.tools.map((item, index) => <article key={item.name}><span>{String(index + 1).padStart(2, "0")}</span><h2>{item.name}</h2><p>{item.purpose}</p><dl><div><dt>Customer ownership</dt><dd>{item.ownership}</dd></div><div><dt>Commercial note</dt><dd>{item.costNote}</dd></div></dl><em>{item.requirement}</em></article>)}</div></div>;
}

function AccountingDelivery({ section }: { section: Extract<IdeaSection, { type: "updates-limitations" }> }) {
  return <div className="kit-section-body"><section className="delivery-readiness"><div><span>Customer handover boundary</span><h2>Complete evidence-led checks before delivery</h2><p>Adapt this checklist to the agreed scope. Deployment is not accounting, tax, security, audit, or legal certification.</p></div><ol>{accountingDeliveryGuide.map((item, index) => <li key={item}><span>{String(index + 1).padStart(2, "0")}</span><p>{item}</p></li>)}</ol></section><details className="kit-details"><summary>Known limitations to carry into the proposal <Info aria-hidden="true" size={16} /></summary><div><ul>{section.notes.map((note) => <li key={note}>{note}</li>)}</ul></div></details></div>;
}

function AccountingProject({ idea, section, project }: { idea: Idea; section: Extract<IdeaSection, { type: "action-plan" }>; project: KitProjectProgress | null }) {
  const savedByStage = new Map(project?.stages.map((stage) => [stage.id, stage]));
  return <div className="kit-section-body"><section className="delivery-summary"><div><span>Private full-member workspace</span><h2>{project?.meaningful ? project.nextActionTitle : "Turn this kit into one controlled implementation"}</h2><p>Your account-owned progress, pause state, and notes are separate from reading the kit. Starting is idempotent.</p></div>{project?.meaningful ? <div className="delivery-progress"><strong>{project.completedStageCount}/{project.totalStageCount}</strong><span>stages complete</span></div> : null}<StartIdeaControl appearance="primary" existingLabel="Open my Accounting project" existingProjectId={project?.id ?? null} ideaId={idea.id} mode="member" startLabel="Start my Accounting project" /></section><ol className="delivery-stage-map">{section.stages.map((stage, index) => { const saved = savedByStage.get(stage.id); const display = projectStageCopy(stage); return <li className={saved?.complete ? "complete" : ""} key={stage.id}><span>{saved?.complete ? <Check aria-hidden="true" size={15} /> : index + 1}</span><div><h3>{display.title}</h3><p>{display.summary}</p></div>{saved?.complete ? <em>Saved complete</em> : null}</li>; })}</ol></div>;
}

export function AccountingKitSection({ idea, section, project }: { idea: Idea; section: IdeaSection; project: KitProjectProgress | null }) {
  if (section.id === "accounting-opportunity" && section.type === "overview") return <AccountingOpportunity idea={idea} section={section} />;
  if (section.id === "accounting-demo" && section.type === "demo-preview") return <AccountingDemo idea={idea} section={section} />;
  if (section.id === "accounting-software" && section.type === "workflow") return <AccountingSoftware idea={idea} section={section} />;
  if (section.id === "accounting-setup" && section.type === "resources") return <AccountingSetup idea={idea} section={section} />;
  if (section.id === "accounting-workflow" && section.type === "workflow") return <AccountingWorkflow section={section} />;
  if (section.id === "accounting-ai" && section.type === "workflow") return <AccountingAiWorkflow section={section} />;
  if (section.id === "accounting-prospects" && section.type === "customer-discovery") return <AccountingProspects section={section} />;
  if (section.id === "accounting-conversation" && section.type === "sales-kit") return <AccountingConversation section={section} />;
  if (section.id === "accounting-pricing" && section.type === "pricing-planner") return <AccountingPricing section={section} />;
  if (section.id === "accounting-packages" && section.type === "tools") return <AccountingPackages section={section} />;
  if (section.id === "accounting-delivery" && section.type === "updates-limitations") return <AccountingDelivery section={section} />;
  if (section.id === "accounting-project" && section.type === "action-plan") return <AccountingProject idea={idea} project={project} section={section} />;
  return null;
}
