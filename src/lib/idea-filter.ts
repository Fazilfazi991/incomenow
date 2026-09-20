import type { Readiness, SolutionType } from "@/content/idea-schema";

export type IdeaSort = "recent" | "number" | "title";

export type IdeaFilters = {
  query?: string;
  solutionType?: SolutionType | "all";
  industry?: string;
  readiness?: Readiness | "all";
  sort?: IdeaSort;
};

type FilterableIdea = {
  id: string;
  displayNumber: string;
  title: string;
  solutionType: SolutionType;
  industries: string[];
  readiness: Readiness;
  addedOrder: number;
};

export function filterIdeas<T extends FilterableIdea>(source: T[], filters: IdeaFilters): T[] {
  const query = filters.query?.trim().toLocaleLowerCase() ?? "";
  const type = filters.solutionType ?? "all";
  const industry = filters.industry?.trim() ?? "";
  const readiness = filters.readiness ?? "all";

  const filtered = source.filter((idea) => {
    const haystack = [
      idea.title,
      idea.id,
      idea.displayNumber,
      `IDEA #${idea.displayNumber}`,
      idea.solutionType,
      ...idea.industries,
    ].join(" ").toLocaleLowerCase();

    return (
      (!query || haystack.includes(query)) &&
      (type === "all" || idea.solutionType === type) &&
      (!industry || idea.industries.includes(industry)) &&
      (readiness === "all" || idea.readiness === readiness)
    );
  });

  return [...filtered].sort((a, b) => {
    if (filters.sort === "number") return a.displayNumber.localeCompare(b.displayNumber);
    if (filters.sort === "title") return a.title.localeCompare(b.title);
    return b.addedOrder - a.addedOrder;
  });
}

export function hasActiveFilters(filters: IdeaFilters) {
  return Boolean(
    filters.query?.trim() ||
      (filters.solutionType && filters.solutionType !== "all") ||
      filters.industry ||
      (filters.readiness && filters.readiness !== "all"),
  );
}
