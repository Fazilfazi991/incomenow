import { Download, ExternalLink, LockKeyhole } from "lucide-react";
import type { Idea } from "@/content/idea-schema";

type IdeaResource = Idea["resources"][number];

export function resourceAvailabilityLabel(availability: IdeaResource["availability"]) {
  if (availability === "available") return "Available";
  if (availability === "sample") return "Sample";
  return "Not connected";
}

export function IdeaResourceAction({ resource }: { resource: IdeaResource }) {
  if (!resource.actionLabel) return null;

  if (!resource.externalUrl && !resource.downloadPath) {
    return (
      <div className="resource-external-action resource-unavailable-action">
        <span aria-disabled="true" className="resource-external-link disabled">
          {resource.actionLabel}
          <LockKeyhole aria-hidden="true" size={15} />
        </span>
        <span className="resource-new-tab">Not yet supplied</span>
      </div>
    );
  }

  const href = resource.externalUrl ?? resource.downloadPath!;
  const isExternal = Boolean(resource.externalUrl);

  return (
    <div className="resource-external-action">
      <a
        aria-label={isExternal ? `${resource.actionLabel} (opens in a new tab)` : resource.actionLabel}
        className="resource-external-link"
        href={href}
        rel={isExternal ? "noopener noreferrer" : undefined}
        target={isExternal ? "_blank" : undefined}
      >
        {resource.actionLabel}
        {isExternal ? <ExternalLink aria-hidden="true" size={15} /> : <Download aria-hidden="true" size={15} />}
      </a>
      <span className="resource-new-tab">{isExternal ? "Opens in a new tab" : "Protected member download"}</span>
      {resource.notice ? <p className="resource-external-note">{resource.notice}</p> : null}
    </div>
  );
}
