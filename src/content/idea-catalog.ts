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
  | "detailAvailable"
  | "fixtureLabel"
  | "previewVariant"
  | "cardNote"
  | "intendedCustomer"
  | "technicalRequirements"
  | "marketEvidence"
> & {
  problemStatement: string;
  resources: Array<Pick<Idea["resources"][number], "label" | "type">>;
};

export function toIdeaCatalogEntry(idea: Idea): IdeaCatalogEntry {
  const overview = idea.sections.find((section) => section.type === "overview");
  return {
    id: idea.id,
    displayNumber: idea.displayNumber,
    slug: idea.slug,
    title: idea.title,
    summary: idea.summary,
    solutionType: idea.solutionType,
    industries: idea.industries,
    readiness: idea.readiness,
    addedOrder: idea.addedOrder,
    detailAvailable: idea.detailAvailable,
    fixtureLabel: idea.fixtureLabel,
    previewVariant: idea.previewVariant,
    cardNote: idea.cardNote,
    intendedCustomer: idea.intendedCustomer,
    technicalRequirements: [...idea.technicalRequirements],
    marketEvidence: idea.marketEvidence,
    problemStatement: overview?.friction ?? idea.summary,
    resources: idea.resources.map(({ label, type }) => ({ label, type })),
  };
}
