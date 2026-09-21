import { describe, expect, it } from "vitest";
import { ideas } from "@/content/ideas";
import { getKitActivities, getKitSection, isKitSectionSlug, legacyKitHashMap } from "./kit-sections";

describe("interactive kit sections", () => {
  const pergola = ideas.find((idea) => idea.id === "idea-001")!;
  const clinic = ideas.find((idea) => idea.id === "idea-002")!;

  it("maps exactly seven unique URL slugs to the seven Pergola sections", () => {
    const activities = getKitActivities(pergola.id);
    expect(activities).toHaveLength(7);
    expect(new Set(activities.map((activity) => activity.slug)).size).toBe(7);
    expect(activities.map((activity) => getKitSection(pergola.sections, activity)?.type)).toEqual([
      "overview",
      "demo-preview",
      "workflow",
      "resources",
      "customer-discovery",
      "sales-kit",
      "action-plan",
    ]);
  });

  it("maps ten Clinic activities without changing Pergola", () => {
    const activities = getKitActivities(clinic.id);
    expect(activities).toHaveLength(10);
    expect(activities.map((activity) => getKitSection(clinic.sections, activity)?.type)).toEqual([
      "overview", "demo-preview", "workflow", "resources", "customer-discovery",
      "sales-kit", "pricing-planner", "tools", "discovery-questionnaire", "action-plan",
    ]);
    expect(activities.find((activity) => activity.slug === "demo")?.description).toMatch(/inspected synthetic demo/i);
    expect(activities.find((activity) => activity.slug === "software")?.description).toMatch(/sanitised package evidence/i);
    expect(activities.find((activity) => activity.slug === "setup")?.description).toMatch(/fourteen-step guide/i);
    expect(activities.find((activity) => activity.slug === "clinics")?.description).toMatch(/protected UAE clinic dataset/i);
    expect(activities.find((activity) => activity.slug === "tools")?.description).toMatch(/Supabase, Vercel/i);
  });

  it("validates section query values and preserves every useful legacy anchor", () => {
    expect(isKitSectionSlug(pergola.id, "sales")).toBe(true);
    expect(isKitSectionSlug(pergola.id, "pricing")).toBe(false);
    expect(isKitSectionSlug(clinic.id, "pricing")).toBe(true);
    expect(isKitSectionSlug(clinic.id, "javascript:alert(1)")).toBe(false);
    expect(Object.values(legacyKitHashMap)).toEqual(getKitActivities(pergola.id).map((activity) => activity.slug));
  });
});
