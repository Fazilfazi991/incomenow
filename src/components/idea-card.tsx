import Link from "next/link";
import { ArrowRight, FileText, FlaskConical, ListChecks, Route, Wrench } from "lucide-react";
import { LockKeyhole } from "lucide-react";
import type { IdeaCatalogEntry } from "@/content/idea-catalog";
import type { CatalogueAccess } from "@/lib/member-content.server";
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

type IdeaCardData = Pick<IdeaCatalogEntry,
  "id" | "displayNumber" | "slug" | "title" | "summary" | "solutionType" | "industries" |
  "readiness" | "detailAvailable" | "fixtureLabel" | "previewVariant" | "cardNote" | "resources"
>;

export function IdeaCard({
  idea,
  savedView = false,
  onRemove,
  basePath = "/preview/ideas",
  bookmarkMode = "preview",
  access,
  projectId = null,
}: {
  idea: IdeaCardData;
  savedView?: boolean;
  onRemove?: () => void;
  basePath?: string;
  bookmarkMode?: "preview" | "member" | "disabled";
  access?: CatalogueAccess;
  projectId?: string | null;
}) {
  const accessLabel = access === "full"
    ? "Included with full membership"
    : access === "starter"
      ? projectId ? "Starter project started" : "Starter project not started"
      : access === "starter-available"
        ? "Available with the US$1 starter"
        : access === "locked"
          ? "Full membership required"
          : access === "not-published"
            ? "Full guide not published"
            : access === "unavailable"
              ? "Access check unavailable"
              : null;
  const actionLabel = access === "full" || access === "starter"
      ? "Open kit"
      : access
        ? "View safe preview"
        : "View idea";

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
        {accessLabel ? <span className={`catalogue-access ${access}`}>{accessLabel}</span> : null}
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
            return <span className="resource-pill" key={`${resource.type}-${resource.label}`}><Icon aria-hidden="true" size={13} />{resource.label}</span>;
          })}
        </div>
      </div>

      <div className="card-footer">
        <span>{idea.fixtureLabel ?? idea.cardNote}</span>
        {bookmarkMode === "member" || idea.detailAvailable ? (
          <div className="card-entry-actions">
            <Link className="primary-button card-action" href={`${basePath}/${idea.slug}`}>
              {actionLabel} <ArrowRight aria-hidden="true" size={16} />
            </Link>
            {bookmarkMode === "member" && projectId ? <Link className="text-button card-checklist-link" href={`/app/projects/${projectId}`}><ListChecks aria-hidden="true" size={15} /> My checklist</Link> : null}
          </div>
        ) : (
          <span className="unavailable-action">Detail not in Phase 1</span>
        )}
      </div>
    </article>
  );
}
