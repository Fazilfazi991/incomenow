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
> & {
  resources: Array<Pick<Idea["resources"][number], "id" | "label" | "type">>;
};

export function toIdeaCatalogEntry(idea: Idea): IdeaCatalogEntry {
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
    resources: idea.resources.map(({ id, label, type }) => ({ id, label, type })),
  };
}
