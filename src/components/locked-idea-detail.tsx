import Link from "next/link";
import { ArrowRight, Check, Clock3, Info, LockKeyhole, ShieldAlert } from "lucide-react";
import type { IdeaCatalogEntry } from "@/content/idea-catalog";
import { STARTER_IDEA_ID } from "@/content/membership-offer";
import type { CatalogueAccess } from "@/lib/member-content.server";
import { ArtworkImage } from "./artwork-image";
import { MemberBookmarkButton } from "./member-bookmark-button";
import { SafeIdeaPreview } from "./safe-idea-preview";

export function LockedIdeaDetail({
  idea,
  access,
}: {
  idea: IdeaCatalogEntry;
  access: Exclude<CatalogueAccess, "full" | "starter">;
}) {
  const isStarterIdea = idea.id === STARTER_IDEA_ID;
  const unavailable = access === "unavailable";
  const notPublished = access === "not-published";

  return (
    <div className="detail-page locked-detail-page">
      <header className="detail-hero">
        <div className="tag-row"><span className="tag strong">IDEA #{idea.displayNumber}</span><span className="tag">{idea.solutionType}</span><span className="tag">Safe preview</span></div>
        <div className="detail-hero-grid">
          <div><h1>{idea.title}</h1><p>{idea.summary}</p></div>
          <div className="detail-actions"><MemberBookmarkButton ideaId={idea.id} /></div>
        </div>
      </header>

      <div className="locked-preview-grid">
        <section className="locked-preview-main">
          <ArtworkImage
            alt={idea.coverArt.alt}
            className="public-dialog-art locked-cover-art"
            position={idea.coverArt.position}
            preload
            sizes="(max-width: 900px) 100vw, 65vw"
            src={idea.coverArt.src}
          />
          {idea.safePreview ? <SafeIdeaPreview preview={idea.safePreview} /> : null}
          <div className="section-card prose-card">
            <span className="locked-preview-kicker"><Info size={15} /> Published catalogue preview</span>
            <h2>What this idea explores</h2>
            <p>{idea.problemStatement}</p>
            <dl className="locked-preview-facts">
              <div><dt>Potential customer</dt><dd>{idea.intendedCustomer}</dd></div>
              <div><dt>Current evidence</dt><dd>{idea.marketEvidence}</dd></div>
              <div><dt>Likely requirements</dt><dd>{idea.technicalRequirements.join(" · ") || "Requirements still being scoped"}</dd></div>
            </dl>
          </div>
          <section className="section-card">
            <h2>Published resource types</h2>
            <p>These labels describe the intended kit. They are not download links or proof that every resource is ready.</p>
            <ul className="locked-resource-list">
              {idea.resources.map((resource) => <li className={resource.availability} key={`${resource.type}-${resource.label}`}>{resource.availability === "not-connected" ? <Clock3 size={15} /> : <Check size={15} />}<span>{resource.label}</span><em>{resource.availability === "available" ? "Available" : resource.availability === "sample" ? "Sample" : "Not connected"}</em></li>)}
            </ul>
          </section>
        </section>

        <aside className={`locked-access-card ${unavailable ? "warning" : ""}`}>
          {unavailable ? <ShieldAlert size={24} /> : <LockKeyhole size={24} />}
          <h2>{unavailable ? "Access check unavailable" : notPublished ? "Full guide not published" : "Full implementation content stays protected"}</h2>
          <p>
            {unavailable
              ? "You can keep browsing this safe preview. Protected sections and project actions stay closed until access can be checked again. This is not a payment failure."
              : notPublished
                ? "This catalogue idea is visible for comparison, but its full implementation guide and project plan are not published."
                : isStarterIdea
                  ? "The IncomeNow Starter Pass unlocks this Pergola idea and one personal project. Checkout is not connected in this local build."
                  : "This idea requires full monthly membership. The US$1 starter includes the Pergola kit, not this idea."}
          </p>
          <div className="access-actions">
            {unavailable ? <Link className="secondary-button" href="/account/access">Retry access check</Link> : null}
            {!unavailable && !notPublished ? <Link className="primary-button" href={isStarterIdea ? "/membership?offer=starter#starter-offer" : "/membership#full-membership"}>{isStarterIdea ? "See the US$1 Starter Pass" : "See full membership"} <ArrowRight size={16} /></Link> : null}
            <Link className="text-button" href="/app/explore">Back to all ideas</Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
