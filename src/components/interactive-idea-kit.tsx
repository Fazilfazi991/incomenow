import Link from "next/link";
import { clinicDistributionState } from "@/content/clinic-distribution";
import {
  ArrowLeft,
  ArrowRight,
  Boxes,
  BriefcaseBusiness,
  Check,
  CheckCircle2,
  CircleDashed,
  ClipboardCheck,
  Compass,
  Download,
  ExternalLink,
  FileArchive,
  Info,
  LayoutDashboard,
  LockKeyhole,
  MessageSquareText,
  PackageCheck,
  Route,
  ShieldCheck,
  Sparkles,
  Users,
  WandSparkles,
  Calculator,
  ListChecks,
} from "lucide-react";
import { pergolaCodexPrompts, pergolaDeliveryGuide, pergolaSetupGuide, pergolaSoftwareScope } from "@/content/pergola-kit-readiness";
import type { Idea, IdeaSection } from "@/content/idea-schema";
import { projectStageCopy } from "@/content/project-copy";
import { getKitActivities, getKitActivity, getKitSection, kitSectionHref, type KitSectionSlug } from "@/lib/kit-sections";
import type { PergolaProspect } from "@/lib/pergola-prospects";
import type { ClinicProspect } from "@/lib/clinic-prospects";
import { IdeaResourceAction, resourceAvailabilityLabel } from "./idea-resource-action";
import { CopyTextButton, KitSectionSelector, KitViewFocus, LegacyKitHashRedirect, SalesTemplateWorkbench, type SalesTemplate } from "./kit-interactions";
import { MemberBookmarkButton } from "./member-bookmark-button";
import { ProspectExplorer } from "./prospect-explorer";
import { StartIdeaControl } from "./start-idea-control";
import { ClinicKitSection } from "./clinic-kit-section";

type IdeaResource = Idea["resources"][number];

export type KitProjectProgress = {
  id: string;
  meaningful: boolean;
  isComplete: boolean;
  paused: boolean;
  completedStageCount: number;
  totalStageCount: number;
  currentStageTitle: string;
  nextActionTitle: string;
  stages: { id: string; title: string; complete: boolean }[];
};

type InteractiveIdeaKitProps = {
  idea: Idea;
  basePath: string;
  selectedSection: KitSectionSlug | null;
  project: KitProjectProgress | null;
  prospects: PergolaProspect[];
  clinicProspects: ClinicProspect[] | null;
};

const activityIcons: Record<KitSectionSlug, typeof Compass> = {
  opportunity: Compass,
  demo: LayoutDashboard,
  software: PackageCheck,
  setup: WandSparkles,
  customers: Users,
  sales: MessageSquareText,
  delivery: ClipboardCheck,
  clinics: Users,
  conversation: MessageSquareText,
  pricing: Calculator,
  tools: Boxes,
  discovery: ListChecks,
};

function findResource(idea: Idea, id: string) {
  return idea.resources.find((resource) => resource.id === id);
}

function findResourceByType(idea: Idea, type: IdeaResource["type"]) {
  return idea.resources.find((resource) => resource.type === type);
}

function activityState(idea: Idea, slug: KitSectionSlug, project: KitProjectProgress | null) {
  if (slug === "demo") return findResourceByType(idea, "demo")?.availability === "available" ? "Demo available" : "Demo unavailable";
  if (slug === "software") return findResourceByType(idea, "source")?.availability === "available" ? idea.id === "idea-002" ? clinicDistributionState.statusLabel : "Source included" : idea.id === "idea-002" ? clinicDistributionState.statusLabel : "Source unavailable";
  if (slug === "setup") return findResourceByType(idea, "guide")?.availability === "available" ? "Guide available" : "Setup guide pending";
  if (slug === "customers") return findResource(idea, "crm-discovery")?.availability === "available" ? "Prospect resource available" : "Research guide ready · sheet pending";
  if (slug === "clinics") return findResource(idea, "clinic-prospects")?.availability === "available" ? "100 clinic prospects ready" : "Research guide ready · prospect list unavailable";
  if (slug === "conversation") return "Editable templates ready";
  if (slug === "pricing") return "Local planning tool ready";
  if (slug === "tools") return "Tools verified";
  if (slug === "discovery") return "Questionnaire ready";
  if (slug === "delivery") {
    if (project?.isComplete) return "Checklist complete";
    if (project?.meaningful) return "Checklist in progress";
    return "Optional checklist";
  }
  return slug === "sales" ? "Editable templates ready" : "Ready to explore";
}

function isLimitedActivity(idea: Idea, slug: KitSectionSlug) {
  if (slug === "setup") return findResourceByType(idea, "guide")?.availability !== "available";
  if (slug === "customers") return findResource(idea, "crm-discovery")?.availability !== "available";
  if (idea.id === "idea-002" && ["demo", "software", "setup", "tools"].includes(slug)) return true;
  return false;
}

function FeaturedResource({ resource }: { resource: IdeaResource }) {
  const Icon = resource.type === "demo" ? ExternalLink : resource.type === "source" ? FileArchive : resource.type === "guide" ? Download : LockKeyhole;
  return (
    <article className={`kit-featured-resource ${resource.type}`}>
      <span className="kit-featured-icon"><Icon aria-hidden="true" size={20} /></span>
      <div className="kit-featured-copy"><strong>{resource.label}</strong><span>{resource.notice ?? resource.description}</span></div>
      <IdeaResourceAction resource={resource} />
    </article>
  );
}

function KitHub({ idea, basePath, project }: Pick<InteractiveIdeaKitProps, "idea" | "basePath" | "project">) {
  const demo = findResourceByType(idea, "demo");
  const source = findResourceByType(idea, "source");
  const guide = idea.id === "idea-002" ? findResourceByType(idea, "guide") : null;
  const featuredResources = [demo, guide, source].filter((resource): resource is IdeaResource => Boolean(resource));
  const activities = getKitActivities(idea.id);

  return (
    <KitViewFocus viewKey="hub">
      <LegacyKitHashRedirect enabled={idea.id === "idea-001"} />
      <header className="kit-hub-hero">
        <div className="kit-hub-heading">
          <div className="tag-row"><span className="tag strong">IDEA #{idea.displayNumber}</span><span className="tag">{idea.id === "idea-001" ? "Starter business kit" : "Full-member business kit"}</span></div>
          <h1 data-kit-view-title tabIndex={-1}>{idea.kitTitle ?? idea.title}</h1>
          <p>{idea.kitSummary ?? idea.summary} Choose any activity—there is no required reading order.</p>
        </div>
        <div className="kit-hub-utility">
          <MemberBookmarkButton ideaId={idea.id} />
          {project?.meaningful ? (
            <Link className="kit-continue" href={`/app/projects/${project.id}`}>
              <span>{project.paused ? "Checklist paused" : project.isComplete ? "Checklist complete" : "Continue your checklist"}</span>
              <strong>{project.currentStageTitle}</strong>
              <small>{project.completedStageCount}/{project.totalStageCount} checklist stages complete</small>
              <ArrowRight aria-hidden="true" size={17} />
            </Link>
          ) : (
            <div className="kit-explore-note"><Sparkles aria-hidden="true" size={17} /><span><strong>Explore in any order.</strong> Opening an activity does not change checklist progress.</span></div>
          )}
        </div>
        {featuredResources.length > 0 ? <div className={`kit-featured-grid${featuredResources.length === 3 ? " three" : ""}`} aria-label="Direct kit resources">{featuredResources.map((resource) => <FeaturedResource key={resource.id} resource={resource} />)}</div> : null}
      </header>

      <section className="kit-activity-section" aria-labelledby="activity-map-title">
        <div className="kit-activity-heading"><div><span>Your activity map</span><h2 id="activity-map-title">Pick the outcome you need now</h2></div><p>{activities.length} kit activities, separate from your {idea.id === "idea-002" ? "ten-stage" : "six-stage"} personal checklist.</p></div>
        <div className="kit-activity-grid">
          {activities.map((activity, index) => {
            const Icon = activityIcons[activity.slug];
            const limited = isLimitedActivity(idea, activity.slug);
            const complete = activity.slug === "delivery" && project?.isComplete;
            return (
              <Link
                className={`kit-activity-card activity-${activity.slug}${limited ? " limited" : ""}${complete ? " complete" : ""}`}
                data-accent={activity.accent}
                href={kitSectionHref(basePath, activity.slug)}
                key={activity.slug}
              >
                <div className="kit-card-top"><span className="kit-activity-number">{String(index + 1).padStart(2, "0")}</span><span className="kit-availability">{complete ? <CheckCircle2 aria-hidden="true" size={13} /> : limited ? <CircleDashed aria-hidden="true" size={13} /> : <Check aria-hidden="true" size={13} />}{activityState(idea, activity.slug, project)}</span></div>
                <div className="kit-activity-illustration" aria-hidden="true"><i /><i /><i /><span><Icon size={28} /></span></div>
                <div className="kit-card-copy"><h3>{activity.title}</h3><p>{activity.description}</p></div>
                <span className="kit-card-action">{activity.actionLabel}<ArrowRight aria-hidden="true" size={16} /></span>
              </Link>
            );
          })}
        </div>
      </section>
    </KitViewFocus>
  );
}

function SectionHeader({ activity, activities, basePath }: { activity: ReturnType<typeof getKitActivity>; activities: ReturnType<typeof getKitActivities>; basePath: string }) {
  const Icon = activityIcons[activity.slug];
  return (
    <>
      <div className="kit-section-toolbar">
        <Link className="kit-back-link" href={basePath}><ArrowLeft aria-hidden="true" size={16} /> Back to kit</Link>
        <KitSectionSelector activeSection={activity.slug} activities={activities} />
      </div>
      <header className="kit-section-heading" data-accent={activity.accent}>
        <span className="kit-section-icon"><Icon aria-hidden="true" size={24} /></span>
        <div><span>Kit activity {activities.findIndex((item) => item.slug === activity.slug) + 1} of {activities.length}</span><h1 data-kit-view-title tabIndex={-1}>{activity.title}</h1><p>{activity.description}</p></div>
      </header>
    </>
  );
}

function SectionNext({ activities, basePath, slug }: { activities: ReturnType<typeof getKitActivities>; basePath: string; slug: KitSectionSlug }) {
  const index = activities.findIndex((activity) => activity.slug === slug);
  const next = activities[index + 1];
  return (
    <div className="kit-section-next">
      <Link className="secondary-button" href={basePath}>Back to all activities</Link>
      {next ? <Link className="primary-button" href={kitSectionHref(basePath, next.slug)}>Next: {next.title}<ArrowRight aria-hidden="true" size={16} /></Link> : null}
    </div>
  );
}

function OpportunitySection({ idea, section }: { idea: Idea; section: Extract<IdeaSection, { type: "overview" }> }) {
  return (
    <div className="kit-section-body">
      <div className="opportunity-cards">
        <article><span><Users aria-hidden="true" size={19} /></span><small>Customer</small><h2>{idea.intendedCustomer}</h2></article>
        <article><span><Route aria-hidden="true" size={19} /></span><small>Problem to investigate</small><h2>{section.friction}</h2></article>
        <article><span><BriefcaseBusiness aria-hidden="true" size={19} /></span><small>Proposed offer</small><h2>{section.businessModel}</h2></article>
      </div>
      <section className="business-model-map"><div><span>01</span><strong>Research a real workflow</strong></div><ArrowRight aria-hidden="true" /><div><span>02</span><strong>Scope the useful change</strong></div><ArrowRight aria-hidden="true" /><div><span>03</span><strong>Configure and test</strong></div><ArrowRight aria-hidden="true" /><div><span>04</span><strong>Hand over with optional support</strong></div></section>
      <details className="kit-details"><summary>Evidence and validation notes <Info aria-hidden="true" size={16} /></summary><div>{section.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}<div className="kit-detail-callout"><ShieldCheck aria-hidden="true" size={18} /><p>{section.validation}</p></div></div></details>
    </div>
  );
}

function DemoSection({ idea, section }: { idea: Idea; section: Extract<IdeaSection, { type: "demo-preview" }> }) {
  const demo = findResourceByType(idea, "demo");
  return (
    <div className="kit-section-body">
      <section className="demo-inspection-board">
        <div className="demo-inspection-copy"><span>Public synthetic-data example</span><h2>See the operating areas that were inspected</h2><p>{section.description}</p>{demo ? <IdeaResourceAction resource={demo} /> : null}</div>
        <div className="demo-module-map" aria-label="Observed CRM navigation areas">{(section.modules ?? []).map((module, index) => <span className={index < 4 ? "strong" : ""} key={module}><Boxes aria-hidden="true" size={15} />{module}</span>)}</div>
      </section>
      <div className="demo-evidence-row">{section.metrics.map((metric) => <article key={metric.label}><span>{metric.label}</span><strong>{metric.value}</strong></article>)}</div>
      <div className="kit-limitation"><Info aria-hidden="true" size={18} /><p><strong>What this proves:</strong> visitor access and the named navigation were observed. It does not prove individual actions, persistence, messaging, payments, integrations, or production readiness.</p></div>
    </div>
  );
}

function SoftwareSection({ idea, section }: { idea: Idea; section: Extract<IdeaSection, { type: "workflow" }> }) {
  const source = findResourceByType(idea, "source");
  return (
    <div className="kit-section-body">
      <div className="software-intro"><div><span>Included foundation</span><h2>Choose capabilities around the customer—not the other way around</h2><p>{section.description}</p></div>{source ? <IdeaResourceAction resource={source} /> : null}</div>
      <div className="capability-grid">{section.steps.map((step, index) => <article key={step.id}><span>{String(index + 1).padStart(2, "0")}</span><h3>{step.title}</h3><p>{step.detail}</p></article>)}</div>
      <section className="software-scope" aria-labelledby="software-scope-title">
        <div className="software-scope-heading"><div><span>Source package scope</span><h2 id="software-scope-title">What was actually found</h2></div><p>“Verified locally” means the package’s offline automated check passed. It does not mean a live customer workflow or hosted service was tested.</p></div>
        <div className="software-scope-list">
          {pergolaSoftwareScope.map((item) => <article key={item.feature}><div><h3>{item.feature}</h3><p>{item.whatItDoes}</p></div><em data-status={item.status}>{item.status}</em></article>)}
        </div>
      </section>
      <div className="source-boundary-grid">
        <article><span>Public demo</span><strong>Synthetic example</strong><p>Useful for seeing the navigation and presentation. It is not evidence that every source-package action behaves identically.</p></article>
        <article><span>Source package</span><strong>Code inspected and built</strong><p>The archive passed its offline tests, typecheck, lint, and production build in an isolated folder.</p></article>
        <article><span>Live functionality</span><strong>Not verified in this phase</strong><p>Real database CRUD, Auth roles, Storage, email, backups, hosted deployment, and production configuration still require isolated acceptance work.</p></article>
      </div>
      {source ? <div className="kit-limitation"><FileArchive aria-hidden="true" size={18} /><p><strong>{source.label}:</strong> {source.description} {source.notice}</p></div> : null}
      {section.safeguard ? <details className="kit-details"><summary>Security and operating safeguards <ShieldCheck aria-hidden="true" size={16} /></summary><div><p>{section.safeguard}</p></div></details> : null}
    </div>
  );
}

function SetupSection({ idea, section }: { idea: Idea; section: Extract<IdeaSection, { type: "resources" }> }) {
  const resources = section.resourceIds.map((id) => findResource(idea, id)).filter((resource): resource is IdeaResource => Boolean(resource));
  return (
    <div className="kit-section-body">
      <p className="kit-lead">{section.intro}</p>
      <ol className="setup-steps">{(section.steps ?? []).map((step, index) => <li key={step.title}><span>{index + 1}</span><div><h2>{step.title}</h2><p>{step.detail}</p></div></li>)}</ol>
      <div className="kit-resource-list">{resources.map((resource) => <article className={resource.availability === "not-connected" ? "unavailable" : ""} key={resource.id}><span><Download aria-hidden="true" size={18} /></span><div><h3>{resource.label}</h3><p>{resource.description}</p><IdeaResourceAction resource={resource} /></div><em>{resourceAvailabilityLabel(resource.availability)}</em></article>)}</div>
      <section className="setup-guide" aria-labelledby="setup-guide-title">
        <div className="setup-guide-heading"><span>Inspected member guide</span><h2 id="setup-guide-title">Set up, adapt, test, and hand over the CRM</h2><p>Follow the status on each step. Only the package install and offline quality checks were executed in this phase.</p></div>
        <div className="setup-guide-sections">
          {pergolaSetupGuide.map((item, index) => (
            <details className="setup-guide-step" key={item.id} open={index === 0}>
              <summary><span>{item.label}</span><div><strong>{item.title}</strong><em>{item.status}</em></div></summary>
              <div><p>{item.body}</p>{"commands" in item && item.commands ? <pre><code>{item.commands.join("\n")}</code></pre> : null}</div>
            </details>
          ))}
        </div>
        <div className="codex-prompt-list">
          <div><span>Safe Codex helpers</span><h3>Copy a prompt without including secrets</h3></div>
          {pergolaCodexPrompts.map((prompt, index) => <article key={prompt}><p>{prompt}</p><CopyTextButton label={`Copy prompt ${index + 1}`} text={prompt} /></article>)}
          <p className="codex-secret-warning"><ShieldCheck aria-hidden="true" size={16} /> Never paste passwords, private keys, connection strings, customer exports, or other secrets into an AI prompt.</p>
        </div>
      </section>
    </div>
  );
}

function CustomersSection({ idea, prospects, section }: { idea: Idea; prospects: PergolaProspect[]; section: Extract<IdeaSection, { type: "customer-discovery" }> }) {
  const prospectResource = findResource(idea, "crm-discovery");
  return (
    <div className="kit-section-body">
      <div className="customer-resource-state available"><Users aria-hidden="true" size={20} /><div><span>Potential customers</span><h2>Research businesses that may fit this offer and decide which ones are worth approaching.</h2><p>Potential businesses to research — not confirmed buyers. Contact details come from published business sources and may change. Verify the company and contact route before outreach. This list is non-exclusive.</p></div>{prospectResource ? <IdeaResourceAction resource={prospectResource} /> : null}</div>
      <ProspectExplorer downloadPath={prospectResource?.downloadPath ?? "/app/resources/pergola-potential-customers"} records={prospects} />
      <section className="customer-audiences"><div><span>Research context</span><h2>Who this offer may fit</h2></div><div>{section.audiences.map((audience) => <span key={audience}><Users aria-hidden="true" size={15} />{audience}</span>)}</div></section>
      <details className="kit-details interview-questions" open><summary>Interview questions <MessageSquareText aria-hidden="true" size={16} /></summary><div><ol>{section.questions.map((question) => <li key={question}>{question}</li>)}</ol></div></details>
      <details className="kit-details"><summary>Turn research into a bounded offer <BriefcaseBusiness aria-hidden="true" size={16} /></summary><div><p>{section.guidance}</p></div></details>
    </div>
  );
}

function SalesSection({ section }: { section: Extract<IdeaSection, { type: "sales-kit" }> }) {
  const templates = section.items.filter((item): item is typeof item & SalesTemplate => Boolean(item.kind && item.kind !== "guide" && item.template)).map((item) => ({ title: item.title, detail: item.detail, kind: item.kind as SalesTemplate["kind"], subject: item.subject, template: item.template! }));
  const guidance = section.items.filter((item) => !item.template);
  return (
    <div className="kit-section-body">
      <p className="kit-lead">{section.intro}</p>
      <SalesTemplateWorkbench templates={templates} />
      {guidance.length ? <details className="kit-details"><summary>Demo and offer guidance <BriefcaseBusiness aria-hidden="true" size={16} /></summary><div className="sales-guidance-grid">{guidance.map((item) => <article key={item.title}><h3>{item.title}</h3><p>{item.detail}</p></article>)}</div></details> : null}
    </div>
  );
}

function DeliverySection({ idea, section, project }: { idea: Idea; section: Extract<IdeaSection, { type: "action-plan" }>; project: KitProjectProgress | null }) {
  const progressByStage = new Map(project?.stages.map((stage) => [stage.id, stage]));
  return (
    <div className="kit-section-body">
      <section className="delivery-summary">
        <div><span>Optional personal workspace</span><h2>{project?.meaningful ? project.nextActionTitle : "Keep delivery decisions in one checklist"}</h2><p>The checklist stores your task progress, pause state, and personal notes. Reading kit activities never marks its work complete.</p></div>
        {project?.meaningful ? <div className="delivery-progress"><strong>{project.completedStageCount}/{project.totalStageCount}</strong><span>checklist stages complete</span></div> : null}
        <StartIdeaControl appearance="primary" existingLabel="Open my personal checklist" existingProjectId={project?.id ?? null} ideaId={idea.id} mode="member" startLabel="Start my personal checklist" />
      </section>
      <section className="delivery-readiness" aria-labelledby="delivery-readiness-title">
        <div><span>Customer handover guide</span><h2 id="delivery-readiness-title">Complete these checks before delivery</h2><p>This practical guide does not update project progress. Use your personal checklist to record your own work.</p></div>
        <ol>{pergolaDeliveryGuide.map((item, index) => <li key={item}><span>{String(index + 1).padStart(2, "0")}</span><p>{item}</p></li>)}</ol>
      </section>
      <ol className="delivery-stage-map">{section.stages.map((stage, index) => {
        const saved = progressByStage.get(stage.id);
        const display = projectStageCopy(stage);
        return <li className={saved?.complete ? "complete" : ""} key={stage.id}><span>{saved?.complete ? <Check aria-hidden="true" size={15} /> : index + 1}</span><div><h3>{display.title}</h3><p>{display.summary}</p></div>{saved?.complete ? <em>Saved complete</em> : null}</li>;
      })}</ol>
    </div>
  );
}

function FocusedKitSection({ idea, basePath, selectedSection, project, prospects, clinicProspects }: InteractiveIdeaKitProps & { selectedSection: KitSectionSlug }) {
  const activities = getKitActivities(idea.id);
  const activity = getKitActivity(idea.id, selectedSection);
  const section = getKitSection(idea.sections, activity);
  if (!section) return null;

  return (
    <KitViewFocus viewKey={selectedSection}>
      <main className="kit-focused-view">
        <SectionHeader activity={activity} activities={activities} basePath={basePath} />
        {idea.id === "idea-002" ? <ClinicKitSection clinicProspects={clinicProspects} idea={idea} project={project} section={section} /> : <>
          {section.type === "overview" ? <OpportunitySection idea={idea} section={section} /> : null}
          {section.type === "demo-preview" ? <DemoSection idea={idea} section={section} /> : null}
          {section.type === "workflow" ? <SoftwareSection idea={idea} section={section} /> : null}
          {section.type === "resources" ? <SetupSection idea={idea} section={section} /> : null}
          {section.type === "customer-discovery" ? <CustomersSection idea={idea} prospects={prospects} section={section} /> : null}
          {section.type === "sales-kit" ? <SalesSection section={section} /> : null}
          {section.type === "action-plan" ? <DeliverySection idea={idea} project={project} section={section} /> : null}
        </>}
        <SectionNext activities={activities} basePath={basePath} slug={selectedSection} />
      </main>
    </KitViewFocus>
  );
}

export function InteractiveIdeaKit(props: InteractiveIdeaKitProps) {
  return props.selectedSection ? <FocusedKitSection {...props} selectedSection={props.selectedSection} /> : <KitHub idea={props.idea} basePath={props.basePath} project={props.project} />;
}
