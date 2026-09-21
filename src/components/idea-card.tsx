import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  CircleAlert,
  Clock3,
  FileText,
  FlaskConical,
  ListChecks,
  Route,
  Wrench,
} from "lucide-react";
import type { IdeaCatalogEntry } from "@/content/idea-catalog";
import type { CatalogueAccess } from "@/lib/member-content.server";
import { ArtworkImage } from "./artwork-image";
import { BookmarkButton } from "./bookmark-button";
import { MemberBookmarkButton } from "./member-bookmark-button";

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
  "readiness" | "detailAvailable" | "coverArt" | "resources"
>;

const accessCopy: Record<Exclude<CatalogueAccess, "unavailable">, { label: string; tone: string }> = {
  full: { label: "Full-member access", tone: "open" },
  starter: { label: "Starter access", tone: "open" },
  "starter-available": { label: "US$1 Pergola starter", tone: "offer" },
  locked: { label: "Full membership", tone: "locked" },
  "not-published": { label: "Kit not published", tone: "pending" },
};

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
  const canOpen = access === "full" || access === "starter";
  const actionLabel = canOpen ? "Open kit" : access ? "Preview idea" : "View idea";
  const usableResources = idea.resources.filter((resource) => resource.availability !== "not-connected").slice(0, 2);

  return (
    <article className={`${savedView ? "idea-card saved-card" : "idea-card"} idea-card-artwork`}>
      <div className="card-meta-row">
        <div className="idea-card-identity">
          <span>IDEA #{idea.displayNumber}</span>
          <strong>{idea.solutionType}</strong>
        </div>
        {bookmarkMode === "preview" ? (
          <BookmarkButton ideaId={idea.id} compact onToggle={onRemove} />
        ) : bookmarkMode === "member" ? (
          <MemberBookmarkButton ideaId={idea.id} compact onRemoved={onRemove} />
        ) : null}
      </div>

      <ArtworkImage
        alt={idea.coverArt.alt}
        className="idea-cover"
        position={idea.coverArt.position}
        sizes="(max-width: 767px) calc(100vw - 48px), (max-width: 1120px) 44vw, 29vw"
        src={idea.coverArt.src}
      />

      <div className="idea-card-status-row">
        <span className="readiness-label">{idea.readiness}</span>
        {access === "unavailable" ? (
          <span className="catalogue-access unavailable"><CircleAlert aria-hidden="true" size={13} /> Access check unavailable</span>
        ) : access ? (
          <span className={`catalogue-access ${accessCopy[access].tone}`}>
            {canOpen ? <CheckCircle2 aria-hidden="true" size={13} /> : null}
            {accessCopy[access].label}
          </span>
        ) : null}
      </div>

      <div className="card-copy">
        <h2>{idea.title}</h2>
        <p>{idea.summary}</p>
      </div>

      <div className="idea-card-resources">
        <span>Resources</span>
        {usableResources.length ? (
          <ul>
            {usableResources.map((resource) => {
              const Icon = resourceIcon[resource.type];
              return (
                <li key={`${resource.type}-${resource.label}`}>
                  <Icon aria-hidden="true" size={14} />
                  <span>{resource.label}</span>
                  <em>{resource.availability === "available" ? "Available" : "Sample"}</em>
                </li>
              );
            })}
          </ul>
        ) : (
          <p><Clock3 aria-hidden="true" size={14} /> No connected resources yet</p>
        )}
      </div>

      <div className="card-footer">
        <Link className="primary-button card-action" href={`${basePath}/${idea.slug}`}>
          {actionLabel} <ArrowRight aria-hidden="true" size={16} />
        </Link>
        <div className="card-secondary-actions">
          {bookmarkMode === "member" && projectId ? (
            <Link className="text-button card-checklist-link" href={`/app/projects/${projectId}`}>
              <ListChecks aria-hidden="true" size={15} /> My checklist
            </Link>
          ) : <span />}
          {access === "unavailable" ? <Link className="text-button" href="/app/explore">Retry access check</Link> : null}
        </div>
      </div>
    </article>
  );
}
