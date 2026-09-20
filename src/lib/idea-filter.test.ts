import { describe, expect, it } from "vitest";
import { ideas, getIdeaBySlug } from "@/content/ideas";
import { filterIdeas, hasActiveFilters } from "./idea-filter";

describe("idea discovery filters", () => {
  it("searches title, identifier, industry, and solution type", () => {
    expect(filterIdeas(ideas, { query: "pergola" }).map((idea) => idea.id)).toEqual(["idea-001"]);
    expect(filterIdeas(ideas, { query: "#003" }).map((idea) => idea.id)).toEqual(["idea-003"]);
    expect(filterIdeas(ideas, { query: "real estate" }).map((idea) => idea.id)).toEqual(["idea-034"]);
    expect(filterIdeas(ideas, { query: "digital service" }).map((idea) => idea.id)).toEqual(["idea-005"]);
  });

  it("combines solution, industry, and readiness filters", () => {
    const results = filterIdeas(ideas, {
      solutionType: "Automation",
      industry: "Professional Services",
      readiness: "Setup ready",
    });
    expect(results.map((idea) => idea.id)).toEqual(["idea-003"]);
  });

  it("recognises cleared filters", () => {
    expect(hasActiveFilters({ solutionType: "all", readiness: "all", query: "" })).toBe(false);
    expect(filterIdeas(ideas, { solutionType: "all", readiness: "all" })).toHaveLength(6);
  });
});

describe("idea routes and optional sections", () => {
  it("resolves valid slugs and rejects unknown slugs", () => {
    expect(getIdeaBySlug("quotation-follow-up-automation")?.id).toBe("idea-003");
    expect(getIdeaBySlug("not-an-idea")).toBeUndefined();
  });

  it("supports idea-specific optional sections", () => {
    const crm = getIdeaBySlug("pergola-quotation-follow-up-crm");
    const automation = getIdeaBySlug("quotation-follow-up-automation");
    expect(crm?.sections.some((section) => section.type === "demo-preview")).toBe(true);
    expect(crm?.sections.some((section) => section.type === "workflow")).toBe(true);
    expect(automation?.sections.some((section) => section.type === "workflow")).toBe(true);
    expect(automation?.sections.some((section) => section.type === "demo-preview")).toBe(false);
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
