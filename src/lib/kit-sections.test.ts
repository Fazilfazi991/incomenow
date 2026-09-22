import { describe, expect, it } from "vitest";
import { ideas } from "@/content/ideas";
import { getKitActivities, getKitSection, isKitSectionSlug, legacyKitHashMap } from "./kit-sections";

describe("interactive kit sections", () => {
  const pergola = ideas.find((idea) => idea.id === "idea-001")!;
  const clinic = ideas.find((idea) => idea.id === "idea-002")!;
  const accounting = ideas.find((idea) => idea.id === "idea-003")!;
  const zeroDebt = ideas.find((idea) => idea.id === "idea-004")!;
  const resumi = ideas.find((idea) => idea.id === "idea-005")!;

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

  it("maps the twelve Accounting activities to the complete kit", () => {
    const activities = getKitActivities(accounting.id);
    expect(activities).toHaveLength(12);
    expect(new Set(activities.map((activity) => activity.slug)).size).toBe(12);
    expect(activities.map((activity) => getKitSection(accounting.sections, activity)?.id)).toEqual([
      "accounting-opportunity", "accounting-demo", "accounting-software", "accounting-setup",
      "accounting-workflow", "accounting-ai", "accounting-prospects", "accounting-conversation",
      "accounting-pricing", "accounting-packages", "accounting-delivery", "accounting-project",
    ]);
    expect(isKitSectionSlug(accounting.id, "ai-workflow")).toBe(true);
    expect(isKitSectionSlug(accounting.id, "customers")).toBe(false);
  });

  it("maps ten Clinic activities without changing Pergola", () => {
    const activities = getKitActivities(clinic.id);
    expect(activities).toHaveLength(10);
    expect(activities.map((activity) => getKitSection(clinic.sections, activity)?.type)).toEqual([
      "overview", "demo-preview", "workflow", "resources", "customer-discovery",
      "sales-kit", "pricing-planner", "tools", "discovery-questionnaire", "action-plan",
    ]);
    expect(activities.find((activity) => activity.slug === "demo")?.description).toMatch(/inspected synthetic demo/i);
    expect(activities.find((activity) => activity.slug === "software")?.description).toMatch(/approved sanitised package/i);
    expect(activities.find((activity) => activity.slug === "setup")?.description).toMatch(/fourteen-step guide/i);
    expect(activities.find((activity) => activity.slug === "clinics")?.description).toMatch(/protected UAE clinic dataset/i);
    expect(activities.find((activity) => activity.slug === "tools")?.description).toMatch(/Supabase, Vercel/i);
  });

  it("maps the thirteen ZeroDebt activities to the versioned member content", () => {
    const activities = getKitActivities(zeroDebt.id);
    expect(activities).toHaveLength(13);
    expect(new Set(activities.map((activity) => activity.slug)).size).toBe(13);
    expect(activities.map((activity) => activity.slug)).toEqual([
      "opportunity", "demo", "product", "source", "rebrand", "telegram", "ai",
      "business-model", "subscriptions", "advertising", "launch", "growth", "operate",
    ]);
    expect(activities.every((activity) => getKitSection(zeroDebt.sections, activity))).toBe(true);
  });

  it("maps fourteen Resumi activities to fourteen focused sections", () => {
    const activities = getKitActivities(resumi.id);
    expect(activities).toHaveLength(14);
    expect(new Set(activities.map((activity) => activity.slug)).size).toBe(14);
    expect(activities.map((activity) => getKitSection(resumi.sections, activity)?.id)).toEqual([
      "resumi-opportunity", "resumi-demo", "resumi-product", "resumi-source", "resumi-rebrand", "resumi-templates", "resumi-ats",
      "resumi-ai", "resumi-business-model", "resumi-premium", "resumi-growth", "resumi-seo", "resumi-launch", "resumi-operate",
    ]);
    expect(isKitSectionSlug(resumi.id, "source")).toBe(true);
    expect(isKitSectionSlug(resumi.id, "clinics")).toBe(false);
  });

  it("validates section query values and preserves every useful legacy anchor", () => {
    expect(isKitSectionSlug(pergola.id, "sales")).toBe(true);
    expect(isKitSectionSlug(pergola.id, "pricing")).toBe(false);
    expect(isKitSectionSlug(clinic.id, "pricing")).toBe(true);
    expect(isKitSectionSlug(clinic.id, "javascript:alert(1)")).toBe(false);
    expect(isKitSectionSlug(zeroDebt.id, "business-model")).toBe(true);
    expect(Object.values(legacyKitHashMap)).toEqual(getKitActivities(pergola.id).map((activity) => activity.slug));
  });
});
