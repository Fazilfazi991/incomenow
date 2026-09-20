import { describe, expect, it } from "vitest";
import { ideas } from "./ideas";

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

  it("connects the protected source ZIP while keeping the missing prospect sheet honest", () => {
    const source = pergola.resources.find((resource) => resource.id === "crm-source")!;
    const discovery = pergola.resources.find((resource) => resource.id === "crm-discovery")!;

    expect(source.availability).toBe("available");
    expect(source.externalUrl).toBeUndefined();
    expect(source.downloadPath).toBe("/app/resources/pergola-source");
    expect(source.actionLabel).toBe("Download source ZIP");
    expect(source.description).toMatch(/offline\/UAT foundation/i);
    expect(discovery.availability).toBe("not-connected");
    expect(discovery.externalUrl).toBeUndefined();
    expect(discovery.description).toMatch(/prospect sheet has not been supplied/i);
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
});
