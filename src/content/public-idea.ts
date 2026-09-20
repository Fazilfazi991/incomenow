import type { Idea } from "./idea-schema";

export const publicIdeaIds = ["idea-001", "idea-003", "idea-004"] as const;

export type PublicIdea = {
  id: string;
  displayNumber: string;
  title: string;
  summary: string;
  solutionType: string;
  technicalRequirements: readonly string[];
  intendedCustomer: string;
  problemStatement: string;
  resourceTypes: ReadonlyArray<{
    label: string;
    type: Idea["resources"][number]["type"];
  }>;
  previewVariant: Idea["previewVariant"];
};

export function isPublicIdeaId(id: string): id is (typeof publicIdeaIds)[number] {
  return publicIdeaIds.includes(id as (typeof publicIdeaIds)[number]);
}

export function toPublicIdea(idea: Idea): PublicIdea {
  const overview = idea.sections.find((section) => section.type === "overview");

  return {
    id: idea.id,
    displayNumber: idea.displayNumber,
    title: idea.title,
    summary: idea.summary,
    solutionType: idea.solutionType,
    technicalRequirements: [...idea.technicalRequirements],
    intendedCustomer: idea.intendedCustomer,
    problemStatement: overview?.friction ?? idea.summary,
    resourceTypes: idea.resources.map(({ label, type }) => ({ label, type })),
    previewVariant: idea.previewVariant,
  };
}
