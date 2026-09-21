import { Boxes, Check, CircleDashed, Info, LockKeyhole, Search, ShieldCheck, Users } from "lucide-react";
import type { Idea, IdeaSection } from "@/content/idea-schema";
import { projectStageCopy } from "@/content/project-copy";
import { ClinicPricingPlanner, ClinicQuestionnaireActions } from "./clinic-kit-tools";
import { IdeaResourceAction, resourceAvailabilityLabel } from "./idea-resource-action";
import { SalesTemplateWorkbench, type SalesTemplate } from "./kit-interactions";
import type { KitProjectProgress } from "./interactive-idea-kit";
import { StartIdeaControl } from "./start-idea-control";

const deliveryChecks = [
  "Confirm scope and inclusions or exclusions.", "Confirm data preparation, import, retention, and validation responsibilities.",
  "Configure branding and the agreed administrative workflow.", "Test roles and permissions.",
  "Test appointment and follow-up flows with synthetic data.", "Test billing logic only where it is actually included.",
  "Test errors and important edge cases.", "Confirm deployment account ownership.",
  "Confirm backups and recovery expectations.", "Hand over credentials through an appropriate secure process.",
  "Brief or train staff.", "Document unresolved limitations.", "Agree future support boundaries.",
];

function ClinicOpportunity({ idea, section }: { idea: Idea; section: Extract<IdeaSection, { type: "overview" }> }) {
  const serviceLayers = ["Initial CRM configuration", "Branding and customisation", "Agreed workflow changes", "Appropriate data import", "Staff onboarding", "Separately agreed hosting or maintenance", "Additional modules later"];
  return <div className="kit-section-body clinic-opportunity">
    <div className="opportunity-cards"><article><span><Users aria-hidden="true" size={19} /></span><small>Customer</small><h2>{idea.intendedCustomer}</h2></article><article><span><Boxes aria-hidden="true" size={19} /></span><small>Focus</small><h2>Administrative operations—not clinical records or decisions</h2></article><article><span><ShieldCheck aria-hidden="true" size={19} /></span><small>Validation rule</small><h2>Confirm the actual workflow with each clinic</h2></article></div>
    <section className="clinic-workflow-example" aria-labelledby="clinic-workflow-title"><div><span>Example workflow — confirm with the clinic</span><h2 id="clinic-workflow-title">One possible administrative journey</h2></div><ol>{["Enquiry", "Appointment", "Visit / attendance", "Follow-up", "Payment / next action"].map((item, index) => <li key={item}><span>{String(index + 1).padStart(2, "0")}</span><strong>{item}</strong></li>)}</ol></section>
    <section className="clinic-service-layers"><div><span>Possible ways to structure the service</span><h2>Start bounded, then add only what is agreed</h2></div><ol>{serviceLayers.map((item, index) => <li key={item}><span>{index + 1}</span>{item}</li>)}</ol></section>
    <details className="kit-details" open><summary>Opportunity and validation notes <Info aria-hidden="true" size={16} /></summary><div>{section.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}<div className="kit-detail-callout"><ShieldCheck aria-hidden="true" size={18} /><p>{section.validation}</p></div></div></details>
  </div>;
}

function ClinicDemo({ idea, section }: { idea: Idea; section: Extract<IdeaSection, { type: "demo-preview" }> }) {
  const demo = idea.resources.find((resource) => resource.id === "clinic-demo");
  return <div className="kit-section-body"><section className="clinic-input-status"><span><CircleDashed aria-hidden="true" size={22} /></span><div><small>Waiting for owner input</small><h2>Clinic CRM demo will be added.</h2><p>{section.description}</p></div>{demo ? <IdeaResourceAction resource={demo} /> : null}</section><div className="demo-evidence-row">{section.metrics.map((metric) => <article key={metric.label}><span>{metric.label}</span><strong>{metric.value}</strong></article>)}</div><section className="clinic-verification-list"><div><span>When the URL arrives</span><h2>What will be checked before publishing a walkthrough</h2></div><ul><li>Visitor accessibility and synthetic-data notice</li><li>Actual navigation and administrative features observed</li><li>Genuine screenshots without sensitive personal information</li><li>A walkthrough limited to verified capabilities</li></ul></section></div>;
}

function ClinicSoftware({ idea, section }: { idea: Idea; section: Extract<IdeaSection, { type: "workflow" }> }) {
  const source = idea.resources.find((resource) => resource.id === "clinic-source");
  return <div className="kit-section-body"><section className="clinic-input-status"><span><LockKeyhole aria-hidden="true" size={22} /></span><div><small>Protected source boundary</small><h2>Source archive not supplied</h2><p>{section.description}</p></div>{source ? <IdeaResourceAction resource={source} /> : null}</section><div className="capability-grid">{section.steps.map((step, index) => <article key={step.id}><span>{String(index + 1).padStart(2, "0")}</span><h3>{step.title}</h3><p>{step.detail}</p></article>)}</div><section className="software-scope"><div className="software-scope-heading"><div><span>Future scope matrix</span><h2>Evidence states that will be used</h2></div><p>Demo behaviour and source capability will be assessed separately.</p></div><div className="software-scope-list">{["Included and inspected", "Locally verified", "Present but unverified", "Not included"].map((state) => <article key={state}><div><h3>{state}</h3><p>Applied only when supported by the inspected archive and appropriate local checks.</p></div><em data-status={state === "Locally verified" ? "Verified locally" : "Not verified"}>{state === "Not included" ? "Explicit" : "Evidence required"}</em></article>)}</div></section>{section.safeguard ? <div className="kit-limitation"><ShieldCheck aria-hidden="true" size={18} /><p>{section.safeguard}</p></div> : null}</div>;
}

function ClinicSetup({ idea, section }: { idea: Idea; section: Extract<IdeaSection, { type: "resources" }> }) {
  const prompts = ["Inspect this Clinic CRM and explain how clinic branding is configured. Identify every file and setting involved before making changes.", "Inspect the existing appointment workflow. Explain its statuses and dependencies before changing it. Do not modify database structures until you report the affected files and migration requirements."];
  return <div className="kit-section-body"><p className="kit-lead">{section.intro}</p><ol className="setup-steps">{(section.steps ?? []).map((step, index) => <li key={step.title}><span>{index + 1}</span><div><h2>{step.title}</h2><p>{step.detail}</p></div></li>)}</ol><div className="kit-resource-list">{section.resourceIds.map((id) => idea.resources.find((resource) => resource.id === id)).filter(Boolean).map((resource) => resource ? <article className="unavailable" key={resource.id}><span><LockKeyhole aria-hidden="true" size={18} /></span><div><h3>{resource.label}</h3><p>{resource.description}</p><IdeaResourceAction resource={resource} /></div><em>{resourceAvailabilityLabel(resource.availability)}</em></article> : null)}</div><section className="setup-guide"><div className="setup-guide-heading"><span>Expected sequence — not yet verified</span><h2>Exact commands wait for the source package</h2><p>No runtime, backend, environment, or deployment assumption is presented as fact.</p></div><div className="codex-prompt-list"><div><span>Safe Codex helpers</span><h3>Copy only after you have the source locally</h3></div>{prompts.map((prompt) => <article key={prompt}><p>{prompt}</p></article>)}<p className="codex-secret-warning"><ShieldCheck aria-hidden="true" size={16} /> Never paste passwords, API keys, connection strings, clinic exports, patient details, or other secrets into an AI prompt.</p></div></section></div>;
}

function ClinicProspecting({ section }: { section: Extract<IdeaSection, { type: "customer-discovery" }> }) {
  return <div className="kit-section-body"><section className="clinic-input-status"><span><Search aria-hidden="true" size={22} /></span><div><small>Research process ready</small><h2>Clinic prospect list not connected yet.</h2><p>No businesses or contacts have been invented. Build a small, verifiable list from published business sources.</p></div></section><section className="customer-audiences"><div><span>Discovery targets—not proof of demand</span><h2>Clinic categories to research</h2></div><div>{section.audiences.map((audience) => <span key={audience}><Users aria-hidden="true" size={15} />{audience}</span>)}</div></section><div className="clinic-research-fields"><article><span>Suggested searches</span><p>dental clinic Dubai<br />aesthetic clinic Abu Dhabi<br />physiotherapy clinic Dubai<br />dental clinic London<br />aesthetic clinic Manchester</p></article><article><span>Record only published business details</span><p>Clinic name · Website · Country · City · Clinic type · Business email · Business phone · Contact form · Source · Last checked date</p></article></div><details className="kit-details" open><summary>Safe research method <ShieldCheck aria-hidden="true" size={16} /></summary><div><ol>{section.questions.map((question) => <li key={question}>{question}</li>)}</ol><p>{section.guidance}</p></div></details></div>;
}

function ClinicConversation({ section }: { section: Extract<IdeaSection, { type: "sales-kit" }> }) {
  const templates = section.items.filter((item): item is typeof item & SalesTemplate => Boolean(item.kind && item.kind !== "guide" && item.template)).map((item) => ({ title: item.title, detail: item.detail, kind: item.kind as SalesTemplate["kind"], subject: item.subject, template: item.template! }));
  return <div className="kit-section-body"><p className="kit-lead">{section.intro}</p><SalesTemplateWorkbench templates={templates} /><div className="kit-limitation"><ShieldCheck aria-hidden="true" size={18} /><p>These tools copy text only. They do not send email, contact clinics, or create a mass-outreach workflow.</p></div></div>;
}

function ClinicPricing({ section }: { section: Extract<IdeaSection, { type: "pricing-planner" }> }) {
  return <div className="kit-section-body"><p className="kit-lead">{section.intro}</p><ClinicPricingPlanner /><section className="clinic-package-grid">{section.packageStructures.map((structure) => <article key={structure.title}><span>Scope template</span><h2>{structure.title}</h2><ul>{structure.items.map((item) => <li key={item}><Check aria-hidden="true" size={15} />{item}</li>)}</ul></article>)}</section></div>;
}

function ClinicTools({ section }: { section: Extract<IdeaSection, { type: "tools" }> }) {
  return <div className="kit-section-body"><p className="kit-lead">{section.intro}</p><div className="clinic-tools-table"><div className="clinic-tools-head"><span>Tool</span><span>Purpose</span><span>Need</span><span>Ownership</span><span>Cost note</span></div>{section.tools.map((tool) => <article key={tool.name}><strong>{tool.name}</strong><span>{tool.purpose}</span><em>{tool.requirement}</em><span>{tool.ownership}</span><span>{tool.costNote}</span></article>)}</div></div>;
}

function ClinicDiscovery({ section }: { section: Extract<IdeaSection, { type: "discovery-questionnaire" }> }) {
  return <div className="kit-section-body"><p className="kit-lead">{section.intro}</p><ClinicQuestionnaireActions questions={section.questions} /><ol className="clinic-question-list">{section.questions.map((question, index) => <li key={question}><span>{String(index + 1).padStart(2, "0")}</span><p>{question}</p></li>)}</ol><section className="clinic-privacy-boundary"><ShieldCheck aria-hidden="true" size={23} /><div><span>Privacy and security boundary</span><h2>{section.privacyTitle}</h2>{section.privacyBody.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div></section></div>;
}

function ClinicDelivery({ idea, section, project }: { idea: Idea; section: Extract<IdeaSection, { type: "action-plan" }>; project: KitProjectProgress | null }) {
  const progressByStage = new Map(project?.stages.map((stage) => [stage.id, stage]));
  return <div className="kit-section-body"><section className="delivery-summary"><div><span>Optional personal workspace</span><h2>{project?.meaningful ? project.nextActionTitle : "Turn the kit into one practical delivery plan"}</h2><p>Your private task progress and notes are separate from reading these activities.</p></div>{project?.meaningful ? <div className="delivery-progress"><strong>{project.completedStageCount}/{project.totalStageCount}</strong><span>checklist stages complete</span></div> : null}<StartIdeaControl appearance="primary" existingLabel="Open my Clinic project" existingProjectId={project?.id ?? null} ideaId={idea.id} mode="member" startLabel="Start my Clinic project" /></section><section className="delivery-readiness"><div><span>Delivery boundary</span><h2>Checks before a clinic handover</h2><p>Adapt these to the agreed scope and record evidence in the personal project.</p></div><ol>{deliveryChecks.map((item, index) => <li key={item}><span>{String(index + 1).padStart(2, "0")}</span><p>{item}</p></li>)}</ol></section><ol className="delivery-stage-map">{section.stages.map((stage, index) => { const saved = progressByStage.get(stage.id); const display = projectStageCopy(stage); return <li className={saved?.complete ? "complete" : ""} key={stage.id}><span>{saved?.complete ? <Check aria-hidden="true" size={15} /> : index + 1}</span><div><h3>{display.title}</h3><p>{display.summary}</p></div>{saved?.complete ? <em>Saved complete</em> : null}</li>; })}</ol></div>;
}

export function ClinicKitSection({ idea, section, project }: { idea: Idea; section: IdeaSection; project: KitProjectProgress | null }) {
  if (section.type === "overview") return <ClinicOpportunity idea={idea} section={section} />;
  if (section.type === "demo-preview") return <ClinicDemo idea={idea} section={section} />;
  if (section.type === "workflow") return <ClinicSoftware idea={idea} section={section} />;
  if (section.type === "resources") return <ClinicSetup idea={idea} section={section} />;
  if (section.type === "customer-discovery") return <ClinicProspecting section={section} />;
  if (section.type === "sales-kit") return <ClinicConversation section={section} />;
  if (section.type === "pricing-planner") return <ClinicPricing section={section} />;
  if (section.type === "tools") return <ClinicTools section={section} />;
  if (section.type === "discovery-questionnaire") return <ClinicDiscovery section={section} />;
  if (section.type === "action-plan") return <ClinicDelivery idea={idea} project={project} section={section} />;
  return null;
}
