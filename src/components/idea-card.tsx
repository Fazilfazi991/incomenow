import Link from "next/link";
import { ArrowRight, FileText, FlaskConical, Route, Wrench } from "lucide-react";
import { LockKeyhole } from "lucide-react";
import type { IdeaCatalogEntry } from "@/content/idea-catalog";
import { BookmarkButton } from "./bookmark-button";
import { MemberBookmarkButton } from "./member-bookmark-button";
import { IdeaPreview } from "./idea-preview";

const resourceIcon = {
  demo: FlaskConical,
  source: Wrench,
  guide: FileText,
  workflow: Route,
  template: FileText,
  worksheet: FileText,
  checklist: FileText,
  script: FileText,
};

export function IdeaCard({
  idea,
  savedView = false,
  onRemove,
  basePath = "/preview/ideas",
  bookmarkMode = "preview",
}: {
  idea: IdeaCatalogEntry;
  savedView?: boolean;
  onRemove?: () => void;
  basePath?: string;
  bookmarkMode?: "preview" | "member" | "disabled";
}) {
  return (
    <article className={savedView ? "idea-card saved-card" : "idea-card"}>
      <div className="card-meta-row">
        <div className="tag-row">
          <span className="tag strong">IDEA #{idea.displayNumber}</span>
          <span className="tag">{idea.industries[0]}</span>
        </div>
        {bookmarkMode === "preview" ? <BookmarkButton ideaId={idea.id} compact onToggle={onRemove} /> : bookmarkMode === "member" ? <MemberBookmarkButton ideaId={idea.id} compact onRemoved={onRemove} /> : <span className="member-card-status"><LockKeyhole size={13} /> Member</span>}
      </div>

      <IdeaPreview variant={idea.previewVariant} />

      <div className="card-copy">
        <h2>{idea.title}</h2>
        <p>{idea.summary}</p>
      </div>

      <div className="tag-row card-types">
        <span className="tag">{idea.solutionType}</span>
        <span className="tag">{idea.readiness}</span>
      </div>

      <div className="resource-group">
        <p>Resources included</p>
        <div className="resource-pills">
          {idea.resources.slice(0, 3).map((resource) => {
            const Icon = resourceIcon[resource.type];
            return <span className="resource-pill" key={resource.id}><Icon aria-hidden="true" size={13} />{resource.label}</span>;
          })}
        </div>
      </div>

      <div className="card-footer">
        <span>{idea.fixtureLabel ?? idea.cardNote}</span>
        {idea.detailAvailable ? (
          <Link className="primary-button card-action" href={`${basePath}/${idea.slug}`}>
            View idea <ArrowRight aria-hidden="true" size={16} />
          </Link>
        ) : (
          <span className="unavailable-action">Detail not in Phase 1</span>
        )}
      </div>
    </article>
  );
}
