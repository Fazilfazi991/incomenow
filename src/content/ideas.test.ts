import { describe, expect, it } from "vitest";
import { ideas } from "./ideas";

describe("idea catalogue artwork and claims", () => {
  it("provides one local, descriptive cover for every catalogue idea", () => {
    expect(ideas).toHaveLength(6);
    expect(new Set(ideas.map((idea) => idea.coverArt.src)).size).toBe(ideas.length);
    ideas.forEach((idea) => {
      expect(idea.coverArt.src).toMatch(/^\/artwork\/ideas\/[a-z0-9-]+\.webp$/);
      expect(idea.coverArt.alt.length).toBeGreaterThan(20);
    });
  });

  it("publishes only the two complete kits with distinct modern covers", () => {
    const published = ideas.filter((idea) => idea.published);
    expect(published.map((idea) => idea.id)).toEqual(["idea-001", "idea-002"]);
    expect(published.map((idea) => idea.coverArt.src)).toEqual([
      "/artwork/ideas/pergola-business-kit.webp",
      "/artwork/ideas/clinic-operations-crm.webp",
    ]);
  });

  it("does not advertise unsupported speed, margin, or compatibility claims", () => {
    const catalogueCopy = ideas.map((idea) => `${idea.summary} ${idea.cardNote}`).join(" ");
    expect(catalogueCopy).not.toMatch(/high-margin|launch:\s*2 weeks|works with your tools/i);
  });
});

describe("Clinic Operations CRM kit", () => {
  const clinic = ideas.find((idea) => idea.id === "idea-002")!;

  it("uses the stable identity, approved summary, and ten focused activities", () => {
    expect(clinic.slug).toBe("clinic-operations-crm");
    expect(clinic.summary).toBe("A practical clinic operations system you can adapt, demonstrate, and offer to independent clinics.");
    expect(clinic.sections).toHaveLength(10);
    expect(clinic.implementationPlanVersion).toBe("1");
  });

  it("keeps unsupplied inputs unavailable without public download targets", () => {
    expect(clinic.resources).toHaveLength(4);
    for (const resource of clinic.resources) {
      expect(resource.availability).toBe("not-connected");
      expect(resource.downloadPath).toBeUndefined();
      expect(resource.externalUrl).toBeUndefined();
    }
  });

  it("states the healthcare and privacy boundary", () => {
    const copy = JSON.stringify(clinic);
    expect(copy).toMatch(/not an EHR, EMR/i);
    expect(copy).toMatch(/does not certify HIPAA, GDPR, DHA, DOH, MOHAP/i);
    expect(copy).not.toMatch(/HIPAA ready|DHA compliant|GDPR certified/i);
  });
});

describe("Pergola demo resource", () => {
  const pergola = ideas.find((idea) => idea.id === "idea-001")!;
  const demo = pergola.resources.find((resource) => resource.id === "crm-demo")!;

  it("publishes the verified original dashboard URL with its visitor warning", () => {
    expect(demo).toMatchObject({
      availability: "available",
      externalUrl: "https://universalpergola-public-demo.vercel.app/dashboard",
      actionLabel: "Open CRM demo",
      notice: "Demonstration uses synthetic data. Changes reset on reload.",
    });
  });

  it("connects the protected source, setup guide, and member-safe prospect export", () => {
    const source = pergola.resources.find((resource) => resource.id === "crm-source")!;
    const guide = pergola.resources.find((resource) => resource.id === "crm-guide")!;
    const discovery = pergola.resources.find((resource) => resource.id === "crm-discovery")!;

    expect(source.availability).toBe("available");
    expect(source.externalUrl).toBeUndefined();
    expect(source.downloadPath).toBe("/app/resources/pergola-source");
    expect(source.actionLabel).toBe("Download source ZIP");
    expect(source.description).toMatch(/offline\/UAT foundation/i);
    expect(guide).toMatchObject({ availability: "available", downloadPath: "/app/resources/pergola-setup-guide" });
    expect(discovery.availability).toBe("available");
    expect(discovery.externalUrl).toBeUndefined();
    expect(discovery.downloadPath).toBe("/app/resources/pergola-potential-customers");
    expect(discovery.description).toMatch(/member-safe projection/i);
  });

  it("orders the member kit from opportunity through delivery", () => {
    expect(pergola.kitTitle).toBe("Pergola Business Kit");
    expect(pergola.sections.map((section) => section.type)).toEqual([
      "overview",
      "demo-preview",
      "workflow",
      "resources",
      "customer-discovery",
      "sales-kit",
      "action-plan",
    ]);
  });

  it("describes observed navigation without presenting actions as verified", () => {
    const preview = pergola.sections.find((section) => section.type === "demo-preview")!;

    expect(preview.description).toContain("commercial documents");
    expect(preview.description).toContain("categories");
    expect(preview.description).toMatch(/individual records, actions.+were not tested/i);
    expect(preview.metrics).toContainEqual({ label: "Actions", value: "Not tested" });
  });

  it("provides inspected setup steps and five editable sales templates without fabricating results", () => {
    const setup = pergola.sections.find((section) => section.type === "resources")!;
    const sales = pergola.sections.find((section) => section.type === "sales-kit")!;

    expect(setup.steps).toHaveLength(4);
    expect(setup.steps?.map((step) => step.detail).join(" ")).toMatch(/offline\/UAT foundation/i);
    expect(sales.items.filter((item) => item.template).map((item) => item.kind)).toEqual(["email", "call", "follow-up", "demo", "proposal"]);
    expect(sales.items.filter((item) => item.template).every((item) => item.template?.includes("["))).toBe(true);
  });
});
