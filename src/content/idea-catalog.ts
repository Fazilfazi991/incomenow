import type { Idea } from "./idea-schema";

export type IdeaCatalogEntry = Pick<
  Idea,
  | "id"
  | "displayNumber"
  | "slug"
  | "title"
  | "summary"
  | "solutionType"
  | "industries"
  | "readiness"
  | "addedOrder"
  | "published"
  | "detailAvailable"
  | "fixtureLabel"
  | "previewVariant"
  | "coverArt"
  | "cardNote"
  | "intendedCustomer"
  | "technicalRequirements"
  | "marketEvidence"
  | "safePreview"
> & {
  problemStatement: string;
  resources: Array<Pick<Idea["resources"][number], "label" | "type" | "availability">>;
};

export function toIdeaCatalogEntry(idea: Idea): IdeaCatalogEntry {
  const overview = idea.sections.find((section) => section.type === "overview");
  return {
    id: idea.id,
    displayNumber: idea.displayNumber,
    slug: idea.slug,
    title: idea.kitTitle ?? idea.title,
    summary: idea.summary,
    solutionType: idea.solutionType,
    industries: idea.industries,
    readiness: idea.readiness,
    addedOrder: idea.addedOrder,
    published: idea.published,
    detailAvailable: idea.detailAvailable,
    fixtureLabel: idea.fixtureLabel,
    previewVariant: idea.previewVariant,
    coverArt: idea.coverArt,
    cardNote: idea.cardNote,
    intendedCustomer: idea.intendedCustomer,
    technicalRequirements: [...idea.technicalRequirements],
    marketEvidence: idea.marketEvidence,
    safePreview: idea.safePreview,
    problemStatement: overview?.friction ?? idea.summary,
    resources: idea.resources.map(({ label, type, availability }) => ({ label, type, availability })),
  };
}
