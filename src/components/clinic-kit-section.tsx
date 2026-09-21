import { Boxes, Check, CheckCircle2, Download, FileArchive, Info, LockKeyhole, Search, ShieldCheck, Users } from "lucide-react";
import type { Idea, IdeaSection } from "@/content/idea-schema";
import type { ClinicProspect } from "@/lib/clinic-prospects";
import { clinicDistributionState } from "@/content/clinic-distribution";
import {
  clinicCodexPrompts,
  clinicDeliveryGuide,
  clinicDemoEvidence,
  clinicDemoWalkthrough,
  clinicHealthDataFlags,
  clinicSetupGuide,
  clinicSoftwareScope,
  clinicToolGroups,
} from "@/content/clinic-kit-readiness";
import { projectStageCopy } from "@/content/project-copy";
import { ClinicPricingPlanner, ClinicQuestionnaireActions } from "./clinic-kit-tools";
import { ClinicProspectExplorer } from "./clinic-prospect-explorer";
import { IdeaResourceAction, resourceAvailabilityLabel } from "./idea-resource-action";
import { CopyTextButton, SalesTemplateWorkbench, type SalesTemplate } from "./kit-interactions";
import type { KitProjectProgress } from "./interactive-idea-kit";
import { StartIdeaControl } from "./start-idea-control";

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
  return <div className="kit-section-body">
    <section className="clinic-input-status"><span><CheckCircle2 aria-hidden="true" size={22} /></span><div><small>Inspected public demo</small><h2>Explore the synthetic BSmile CRM.</h2><p>{section.description}</p></div>{demo ? <IdeaResourceAction resource={demo} /> : null}</section>
    <div className="demo-evidence-row">{section.metrics.map((metric) => <article key={metric.label}><span>{metric.label}</span><strong>{metric.value}</strong></article>)}</div>
    <section className="software-scope" aria-labelledby="clinic-demo-evidence-title">
      <div className="software-scope-heading"><div><span>Demo evidence</span><h2 id="clinic-demo-evidence-title">Observed is not the same as tested</h2></div><p>No mutating control was used. Navigation labels alone are recorded separately from inspected views.</p></div>
      <div className="software-scope-list">{clinicDemoEvidence.map((item) => <article key={item.feature}><div><h3>{item.feature}</h3><p>{item.notes}</p><small>Interaction: {item.interaction}</small></div><em data-status={item.observed === "Yes" ? "Observed in demo" : "Included but not tested"}>{item.observed}</em></article>)}</div>
    </section>
    <section className="clinic-verification-list"><div><span>What to look at</span><h2>A short evidence-led walkthrough</h2></div><ol>{clinicDemoWalkthrough.map((step, index) => <li key={step}><span>{String(index + 1).padStart(2, "0")}</span><p>{step}</p></li>)}</ol></section>
    <div className="kit-limitation"><Info aria-hidden="true" size={18} /><p><strong>Not tested:</strong> record changes, persistence/reset behaviour, exports, generated reports, messages, payments, integrations, authentication, or production operation. The reset statement comes from the demo banner.</p></div>
  </div>;
}

function ClinicSoftware({ idea, section }: { idea: Idea; section: Extract<IdeaSection, { type: "workflow" }> }) {
  const source = idea.resources.find((resource) => resource.id === "clinic-source");
  return <div className="kit-section-body">
    <section className="clinic-input-status"><span><FileArchive aria-hidden="true" size={22} /></span><div><small>Approved sanitised full-member package</small><h2>{clinicDistributionState.statusLabel}</h2><p>{section.description}</p></div>{source ? <IdeaResourceAction resource={source} /> : null}</section>
    <div className="capability-grid">{section.steps.map((step, index) => <article key={step.id}><span>{String(index + 1).padStart(2, "0")}</span><h3>{step.title}</h3><p>{step.detail}</p></article>)}</div>
    <section className="software-scope" aria-labelledby="clinic-software-scope-title"><div className="software-scope-heading"><div><span>Software scope matrix</span><h2 id="clinic-software-scope-title">What the evidence supports</h2></div><p>Local status reflects source checks, not a live clinic deployment or customer acceptance.</p></div><div className="software-scope-list">{clinicSoftwareScope.map((item) => <article key={item.feature}><div><h3>{item.feature}</h3><p>{item.purpose}</p><small>Demo: {item.demoObserved} · Source: {item.sourceInspected ? "Inspected" : "Not inspected"}</small></div><em data-status={item.localStatus}>{item.localStatus}</em></article>)}</div></section>
    <details className="kit-details" open><summary>Health-data review <ShieldCheck aria-hidden="true" size={16} /></summary><div><p>The source is broader than the commercial “Clinic Operations CRM” position. It can process highly sensitive personal and clinical information:</p><ul>{clinicHealthDataFlags.map((flag) => <li key={flag}>{flag}</li>)}</ul><p>No HIPAA, GDPR, DHA, DOH, MOHAP, security, or production-readiness claim is made. Dedicated structured diagnosis, laboratory, and imaging modules were not found, but uploaded documents and free-text notes can still contain that information.</p></div></details>
    {source ? <div className="kit-limitation"><FileArchive aria-hidden="true" size={18} /><p><strong>{source.label}:</strong> {source.notice}</p></div> : null}
    {section.safeguard ? <div className="kit-limitation"><ShieldCheck aria-hidden="true" size={18} /><p>{section.safeguard}</p></div> : null}
  </div>;
}

function ClinicSetup({ idea, section }: { idea: Idea; section: Extract<IdeaSection, { type: "resources" }> }) {
  const resources = section.resourceIds.map((id) => idea.resources.find((resource) => resource.id === id)).filter((resource): resource is Idea["resources"][number] => Boolean(resource));
  return <div className="kit-section-body">
    <p className="kit-lead">{section.intro}</p>
    <ol className="setup-steps">{(section.steps ?? []).map((step, index) => <li key={step.title}><span>{index + 1}</span><div><h2>{step.title}</h2><p>{step.detail}</p></div></li>)}</ol>
    <div className="kit-resource-list">{resources.map((resource) => <article className={resource.availability === "not-connected" ? "unavailable" : ""} key={resource.id}><span>{resource.availability === "available" ? <Download aria-hidden="true" size={18} /> : <LockKeyhole aria-hidden="true" size={18} />}</span><div><h3>{resource.label}</h3><p>{resource.description}</p><IdeaResourceAction resource={resource} /></div><em>{resourceAvailabilityLabel(resource.availability)}</em></article>)}</div>
    <section className="setup-guide" aria-labelledby="clinic-setup-guide-title"><div className="setup-guide-heading"><span>Inspected member guide</span><h2 id="clinic-setup-guide-title">Set up, adapt, test, and hand over responsibly</h2><p>Only steps marked VERIFIED were confirmed by source inspection or isolated code checks. Production services, customer acceptance, backups, and deployment remain separate work.</p></div><div className="setup-guide-sections">{clinicSetupGuide.map((item, index) => <details className="setup-guide-step" key={item.id} open={index === 0}><summary><span>{item.label}</span><div><strong>{item.title}</strong><em>{item.status}</em></div></summary><div><p>{item.body}</p>{"commands" in item && item.commands ? <pre><code>{item.commands.join("\n")}</code></pre> : null}</div></details>)}</div><div className="codex-prompt-list"><div><span>Safe Codex helpers</span><h3>Copy a bounded prompt without including secrets</h3></div>{clinicCodexPrompts.map((prompt, index) => <article key={prompt}><p>{prompt}</p><CopyTextButton label={`Copy prompt ${index + 1}`} text={prompt} /></article>)}<p className="codex-secret-warning"><ShieldCheck aria-hidden="true" size={16} /> Never paste passwords, private keys, service-role keys, connection strings, clinic exports, patient details, or other secrets into an AI prompt.</p></div></section>
  </div>;
}

function ClinicProspecting({ section, prospects }: { section: Extract<IdeaSection, { type: "customer-discovery" }>; prospects: ClinicProspect[] | null }) {
  return <div className="kit-section-body">
    <section className="clinic-input-status clinic-prospect-intro"><span><Search aria-hidden="true" size={22} /></span><div><small>Protected full-member research resource</small><h2>100 UAE clinics to research</h2><p>Explore independent clinics and small medical centres in Dubai and Abu Dhabi using publicly listed business contact routes.</p><p className="clinic-prospect-caution">Potential businesses to research — not confirmed buyers. Contact information comes from publicly available business sources and may change. Verify the clinic and contact route before outreach. The list is non-exclusive.</p></div></section>
    {prospects ? <ClinicProspectExplorer downloadPath="/app/resources/clinic-uae-potential-customers" records={prospects} salesTemplatesPath="/app/ideas/clinic-operations-crm?section=conversation" /> : <div className="kit-limitation"><LockKeyhole aria-hidden="true" size={18} /><p><strong>Full membership required.</strong> The protected Clinic prospect dataset is not included with the Pergola Starter.</p></div>}
    <section className="customer-audiences"><div><span>Discovery targets—not proof of demand</span><h2>How to research more clinics</h2></div><div>{section.audiences.map((audience) => <span key={audience}><Users aria-hidden="true" size={15} />{audience}</span>)}</div></section>
    <div className="clinic-research-fields"><article><span>Suggested Dubai searches</span><p>dental clinic Dubai<br />aesthetic clinic Dubai<br />physiotherapy clinic Dubai</p></article><article><span>Suggested Abu Dhabi searches</span><p>dental clinic Abu Dhabi<br />dermatology clinic Abu Dhabi<br />physiotherapy clinic Abu Dhabi</p></article></div>
    <details className="kit-details" open><summary>Safe research method <ShieldCheck aria-hidden="true" size={16} /></summary><div><ol>{section.questions.map((question) => <li key={question}>{question}</li>)}</ol><p>{section.guidance}</p><p>Prefer the clinic&apos;s official website as evidence. Do not bulk scrape business data or infer private contact details.</p></div></details>
  </div>;
}

function ClinicConversation({ section }: { section: Extract<IdeaSection, { type: "sales-kit" }> }) {
  const templates = section.items.filter((item): item is typeof item & SalesTemplate => Boolean(item.kind && item.kind !== "guide" && item.template)).map((item) => ({ title: item.title, detail: item.detail, kind: item.kind as SalesTemplate["kind"], subject: item.subject, template: item.template! }));
  return <div className="kit-section-body"><p className="kit-lead">{section.intro}</p><SalesTemplateWorkbench templates={templates} /><div className="kit-limitation"><ShieldCheck aria-hidden="true" size={18} /><p>These tools copy text only. They do not send email, contact clinics, or create a mass-outreach workflow.</p></div></div>;
}

function ClinicPricing({ section }: { section: Extract<IdeaSection, { type: "pricing-planner" }> }) {
  return <div className="kit-section-body"><p className="kit-lead">{section.intro}</p><ClinicPricingPlanner /><section className="clinic-package-grid">{section.packageStructures.map((structure) => <article key={structure.title}><span>Scope template</span><h2>{structure.title}</h2><ul>{structure.items.map((item) => <li key={item}><Check aria-hidden="true" size={15} />{item}</li>)}</ul></article>)}</section></div>;
}

function ClinicTools({ section }: { section: Extract<IdeaSection, { type: "tools" }> }) {
  return <div className="kit-section-body"><p className="kit-lead">{section.intro}</p>{clinicToolGroups.map((group) => <section className="clinic-tool-group" key={group.category}><h2>{group.category}</h2><div className="clinic-tools-table"><div className="clinic-tools-head"><span>Tool</span><span>Purpose</span><span>Need</span><span>Ownership</span><span>Cost note</span></div>{group.tools.map((tool) => <article key={tool.name}><strong>{tool.name}</strong><span>{tool.purpose}</span><em>{tool.requirement}</em><span>{tool.ownership}</span><span>{tool.costNote}</span></article>)}</div></section>)}</div>;
}

function ClinicDiscovery({ section }: { section: Extract<IdeaSection, { type: "discovery-questionnaire" }> }) {
  return <div className="kit-section-body"><p className="kit-lead">{section.intro}</p><ClinicQuestionnaireActions questions={section.questions} /><section className="clinic-questionnaire-group"><div><span>Product fit questions</span><h2>Discuss workflows and requirements</h2><p>Do not enter real patient data into IncomeNow.</p></div><ol className="clinic-question-list">{section.questions.map((question, index) => <li key={question}><span>{String(index + 1).padStart(2, "0")}</span><p>{question}</p></li>)}</ol></section><section className="clinic-privacy-boundary"><ShieldCheck aria-hidden="true" size={23} /><div><span>Sensitive information</span><h2>{section.privacyTitle}</h2>{section.privacyBody.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div></section></div>;
}

function ClinicDelivery({ idea, section, project }: { idea: Idea; section: Extract<IdeaSection, { type: "action-plan" }>; project: KitProjectProgress | null }) {
  const progressByStage = new Map(project?.stages.map((stage) => [stage.id, stage]));
  return <div className="kit-section-body"><section className="delivery-summary"><div><span>Optional personal workspace</span><h2>{project?.meaningful ? project.nextActionTitle : "Turn the kit into one practical delivery plan"}</h2><p>Your private task progress and notes are separate from reading these activities.</p></div>{project?.meaningful ? <div className="delivery-progress"><strong>{project.completedStageCount}/{project.totalStageCount}</strong><span>checklist stages complete</span></div> : null}<StartIdeaControl appearance="primary" existingLabel="Open my Clinic project" existingProjectId={project?.id ?? null} ideaId={idea.id} mode="member" startLabel="Start my Clinic project" /></section><section className="delivery-readiness"><div><span>Delivery boundary</span><h2>Checks before a clinic handover</h2><p>Adapt these to the agreed scope and record evidence in the personal project. Deployment does not certify healthcare compliance.</p></div><ol>{clinicDeliveryGuide.map((item, index) => <li key={item}><span>{String(index + 1).padStart(2, "0")}</span><p>{item}</p></li>)}</ol></section><ol className="delivery-stage-map">{section.stages.map((stage, index) => { const saved = progressByStage.get(stage.id); const display = projectStageCopy(stage); return <li className={saved?.complete ? "complete" : ""} key={stage.id}><span>{saved?.complete ? <Check aria-hidden="true" size={15} /> : index + 1}</span><div><h3>{display.title}</h3><p>{display.summary}</p></div>{saved?.complete ? <em>Saved complete</em> : null}</li>; })}</ol></div>;
}

export function ClinicKitSection({ idea, section, project, clinicProspects }: { idea: Idea; section: IdeaSection; project: KitProjectProgress | null; clinicProspects: ClinicProspect[] | null }) {
  if (section.type === "overview") return <ClinicOpportunity idea={idea} section={section} />;
  if (section.type === "demo-preview") return <ClinicDemo idea={idea} section={section} />;
  if (section.type === "workflow") return <ClinicSoftware idea={idea} section={section} />;
  if (section.type === "resources") return <ClinicSetup idea={idea} section={section} />;
  if (section.type === "customer-discovery") return <ClinicProspecting prospects={clinicProspects} section={section} />;
  if (section.type === "sales-kit") return <ClinicConversation section={section} />;
  if (section.type === "pricing-planner") return <ClinicPricing section={section} />;
  if (section.type === "tools") return <ClinicTools section={section} />;
  if (section.type === "discovery-questionnaire") return <ClinicDiscovery section={section} />;
  if (section.type === "action-plan") return <ClinicDelivery idea={idea} project={project} section={section} />;
  return null;
}
