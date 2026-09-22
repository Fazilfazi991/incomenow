import { describe, expect, it } from "vitest";
import { ideas, getIdeaBySlug, publishedIdeas } from "@/content/ideas";
import { filterIdeas, hasActiveFilters } from "./idea-filter";

describe("idea discovery filters", () => {
  it("searches title, identifier, industry, and solution type", () => {
    expect(filterIdeas(ideas, { query: "pergola" }).map((idea) => idea.id)).toEqual(["idea-001"]);
    expect(filterIdeas(ideas, { query: "#003" }).map((idea) => idea.id)).toEqual(["idea-003"]);
    expect(filterIdeas(ideas, { query: "real estate" }).map((idea) => idea.id)).toEqual(["idea-034"]);
    expect(filterIdeas(ideas, { query: "consumer saas" }).map((idea) => idea.id)).toEqual(["idea-004", "idea-005"]);
  });

  it("combines solution, industry, and readiness filters", () => {
    const results = filterIdeas(ideas, {
      solutionType: "Web tool",
      industry: "Accounting Operations",
      readiness: "Sample blueprint",
    });
    expect(results.map((idea) => idea.id)).toEqual(["idea-003"]);
  });

  it("recognises cleared filters", () => {
    expect(hasActiveFilters({ solutionType: "all", readiness: "all", query: "" })).toBe(false);
    expect(filterIdeas(ideas, { solutionType: "all", readiness: "all" })).toHaveLength(6);
  });

  it("cannot discover unpublished ideas when the canonical published catalogue is used", () => {
    expect(filterIdeas(publishedIdeas, {}).map((idea) => idea.id)).toEqual(["idea-001", "idea-002", "idea-003", "idea-004", "idea-005"]);
    expect(filterIdeas(publishedIdeas, { query: "#003" }).map((idea) => idea.id)).toEqual(["idea-003"]);
    expect(filterIdeas(publishedIdeas, { query: "real estate" })).toEqual([]);
  });
});

describe("idea routes and optional sections", () => {
  it("resolves valid slugs and rejects unknown slugs", () => {
    expect(getIdeaBySlug("ai-accounting-finance-operations")?.id).toBe("idea-003");
    expect(getIdeaBySlug("not-an-idea")).toBeUndefined();
  });

  it("supports idea-specific optional sections", () => {
    const crm = getIdeaBySlug("pergola-quotation-follow-up-crm");
    const accounting = getIdeaBySlug("ai-accounting-finance-operations");
    expect(crm?.sections.some((section) => section.type === "demo-preview")).toBe(true);
    expect(crm?.sections.some((section) => section.type === "workflow")).toBe(true);
    expect(accounting?.sections.some((section) => section.type === "workflow")).toBe(true);
    expect(accounting?.sections.some((section) => section.type === "demo-preview")).toBe(true);
  });

  it("links every resource section to an idea resource", () => {
    for (const idea of ideas) {
      const resourceIds = new Set(idea.resources.map((resource) => resource.id));
      for (const section of idea.sections) {
        if (section.type === "resources") {
          expect(section.resourceIds.every((id) => resourceIds.has(id))).toBe(true);
        }
      }
    }
  });
});
