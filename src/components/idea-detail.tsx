import { AlertTriangle, ArrowDown, Check, FileText, Info, LockKeyhole, Route, ShieldCheck, Users } from "lucide-react";
import type { Idea, IdeaSection } from "@/content/idea-schema";
import { BookmarkButton } from "./bookmark-button";
import { MemberBookmarkButton } from "./member-bookmark-button";
import { IdeaPreview } from "./idea-preview";
import { StartIdeaControl } from "./start-idea-control";

const sectionLabels: Record<IdeaSection["type"], string> = {
  overview: "Overview",
  workflow: "Workflow",
  "demo-preview": "Demo preview",
  "action-plan": "Action plan",
  resources: "Resources",
  "customer-discovery": "Finding customers",
  "updates-limitations": "Updates & notes",
};

function sectionId(type: IdeaSection["type"]) {
  return `section-${type}`;
}

function DetailSection({ idea, section }: { idea: Idea; section: IdeaSection }) {
  if (section.type === "overview") {
    return (
      <section className="detail-section" id={sectionId(section.type)}>
        <div className="section-title-row"><span className="section-marker" /><h2>{section.title}</h2><small>Analysis & model</small></div>
        <div className="overview-grid">
          <div className="section-card prose-card">{section.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>
          <div className="callout warning"><AlertTriangle size={19} /><div><strong>Operational friction</strong><p>{section.friction}</p></div></div>
          <div className="callout"><ShieldCheck size={19} /><div><strong>Validation requirement</strong><p>{section.validation}</p></div></div>
          <div className="model-strip"><span>Proposed business model</span><strong>{section.businessModel}</strong></div>
        </div>
      </section>
    );
  }

  if (section.type === "workflow") {
    return (
      <section className="detail-section" id={sectionId(section.type)}>
        <div className="section-title-row"><span className="section-marker" /><h2>{section.title}</h2><small>Illustrative architecture</small></div>
        <p className="section-intro">{section.description}</p>
        <div className="workflow-board">
          {section.steps.map((step, index) => (
            <div className="workflow-step" key={step.id}>
              <div className="step-number">{String(index + 1).padStart(2, "0")}</div>
              <div><strong>{step.title}</strong><p>{step.detail}</p>{step.condition ? <span className="condition">If: {step.condition}</span> : null}</div>
              {index < section.steps.length - 1 ? <ArrowDown className="workflow-arrow" size={18} aria-hidden="true" /> : null}
            </div>
          ))}
        </div>
        {section.safeguard ? <div className="callout"><LockKeyhole size={18} /><div><strong>Safeguard</strong><p>{section.safeguard}</p></div></div> : null}
      </section>
    );
  }

  if (section.type === "demo-preview") {
    return (
      <section className="detail-section" id={sectionId(section.type)}>
        <div className="section-title-row"><span className="section-marker" /><h2>{section.title}</h2><small>Fictional preview</small></div>
        <p className="section-intro">{section.description}</p>
        <div className="demo-shell">
          <div className="demo-toolbar"><span><i /> {idea.title} preview</span><span>Sample data</span></div>
          <IdeaPreview variant={section.variant === "crm" ? "pipeline" : "website"} />
          <div className="demo-metrics">{section.metrics.map((metric) => <div key={metric.label}><span>{metric.label}</span><strong>{metric.value}</strong></div>)}</div>
          <div className="locked-demo"><LockKeyhole size={16} /> Live systems and form submission are not connected in this build.</div>
        </div>
      </section>
    );
  }

  if (section.type === "action-plan") {
    return (
      <section className="detail-section" id={sectionId(section.type)}>
        <div className="section-title-row"><span className="section-marker" /><h2>{section.title}</h2><small>{section.stages.length} stages</small></div>
        <div className="stage-list">
          {section.stages.map((stage, index) => (
            <details className="stage-item" key={stage.id} open={index === 0}>
              <summary><span>{index + 1}</span><div><strong>{stage.title}</strong><small>{stage.summary}</small></div><b>+</b></summary>
              <div className="stage-body">{stage.condition ? <p className="condition"><Info size={14} /> {stage.condition}</p> : null}<ul>{stage.tasks.map((task) => <li key={task.id}><Check size={14} />{task.title}</li>)}</ul></div>
            </details>
          ))}
        </div>
      </section>
    );
  }

  if (section.type === "resources") {
    const linkedResources = section.resourceIds.map((id) => idea.resources.find((resource) => resource.id === id)).filter((resource): resource is Idea["resources"][number] => Boolean(resource));
    return (
      <section className="detail-section" id={sectionId(section.type)}>
        <div className="section-title-row"><span className="section-marker" /><h2>{section.title}</h2><small>Sample assets</small></div>
        <p className="section-intro">{section.intro}</p>
        <div className="resource-list">
          {linkedResources.map((resource) => (
            <article className="resource-row" key={resource.id}>
              <span className="resource-icon"><FileText size={18} /></span>
              <div><strong>{resource.label}</strong><p>{resource.description}</p></div>
              <span className="resource-state">{resource.availability === "sample" ? "Sample" : "Not connected"}</span>
            </article>
          ))}
        </div>
      </section>
    );
  }

  if (section.type === "customer-discovery") {
    return (
      <section className="detail-section" id={sectionId(section.type)}>
        <div className="section-title-row"><span className="section-marker" /><h2>{section.title}</h2><small>Discovery guide</small></div>
        <div className="discovery-grid">
          <div className="section-card"><Users size={20} /><h3>Who to investigate</h3><ul>{section.audiences.map((audience) => <li key={audience}>{audience}</li>)}</ul></div>
          <div className="section-card"><Route size={20} /><h3>Questions to ask</h3><ol>{section.questions.map((question) => <li key={question}>{question}</li>)}</ol></div>
        </div>
        <div className="callout"><Info size={18} /><div><strong>Guidance</strong><p>{section.guidance}</p></div></div>
      </section>
    );
  }

  return (
    <section className="detail-section" id={sectionId(section.type)}>
      <div className="section-title-row"><span className="section-marker" /><h2>{section.title}</h2><small>Limitations</small></div>
      <div className="updates-grid">{section.notes.map((note) => <div className="callout" key={note}><Info size={17} /><p>{note}</p></div>)}</div>
    </section>
  );
}

export function IdeaDetail({ idea, mode = "preview", existingProjectId = null }: { idea: Idea; mode?: "preview" | "member"; existingProjectId?: string | null }) {
  return (
    <div className="detail-page">
      <header className="detail-hero">
        <div className="tag-row"><span className="tag strong">IDEA #{idea.displayNumber}</span><span className="tag">{idea.solutionType}</span><span className="tag">{idea.industries[0]}</span></div>
        <div className="detail-hero-grid">
          <div><h1>{idea.title}</h1><p>{idea.summary}</p></div>
          <div className="detail-actions">{mode === "preview" ? <BookmarkButton ideaId={idea.id} /> : <MemberBookmarkButton ideaId={idea.id} />}<StartIdeaControl ideaId={idea.id} existingProjectId={existingProjectId} mode={mode} /></div>
        </div>
      </header>

      <nav className="section-nav" aria-label="Idea sections">
        {idea.sections.map((section) => <a href={`#${sectionId(section.type)}`} key={section.type}>{sectionLabels[section.type]}</a>)}
      </nav>

      <div className="detail-layout">
        <div className="detail-content">{idea.sections.map((section) => <DetailSection idea={idea} section={section} key={section.type} />)}</div>
        <aside className="quick-facts">
          <h2>Quick facts</h2>
          <dl>
            <div><dt>Intended customer</dt><dd>{idea.intendedCustomer}</dd></div>
            <div><dt>Proposed model</dt><dd>{idea.proposedBusinessModel}</dd></div>
            <div><dt>Readiness</dt><dd>{idea.readiness}</dd></div>
            <div><dt>Market evidence</dt><dd>{idea.marketEvidence}</dd></div>
            <div><dt>Technical requirements</dt><dd>{idea.technicalRequirements.join(", ")}</dd></div>
          </dl>
          <StartIdeaControl ideaId={idea.id} existingProjectId={existingProjectId} mode={mode} />
          {mode === "preview" ? <BookmarkButton ideaId={idea.id} /> : <MemberBookmarkButton ideaId={idea.id} />}
        </aside>
      </div>
    </div>
  );
}
