import { describe, expect, it } from "vitest";
import { ideas } from "@/content/ideas";
import { getKitSection, isKitSectionSlug, kitActivities, legacyKitHashMap } from "./kit-sections";

describe("interactive kit sections", () => {
  const pergola = ideas.find((idea) => idea.id === "idea-001")!;

  it("maps exactly seven unique URL slugs to the seven Pergola sections", () => {
    expect(kitActivities).toHaveLength(7);
    expect(new Set(kitActivities.map((activity) => activity.slug)).size).toBe(7);
    expect(kitActivities.map((activity) => getKitSection(pergola.sections, activity.slug)?.type)).toEqual([
      "overview",
      "demo-preview",
      "workflow",
      "resources",
      "customer-discovery",
      "sales-kit",
      "action-plan",
    ]);
  });

  it("validates section query values and preserves every useful legacy anchor", () => {
    expect(isKitSectionSlug("sales")).toBe(true);
    expect(isKitSectionSlug("javascript:alert(1)")).toBe(false);
    expect(Object.values(legacyKitHashMap)).toEqual(kitActivities.map((activity) => activity.slug));
  });
});
