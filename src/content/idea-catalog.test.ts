import { describe, expect, it } from "vitest";
import { ideas } from "./ideas";
import { toIdeaCatalogEntry } from "./idea-catalog";

describe("authenticated catalogue projection", () => {
  it("keeps protected sections, plan versions, and resource identifiers out of browse payloads", () => {
    const source = ideas[0];
    const projected = toIdeaCatalogEntry(source);
    const payload = JSON.stringify(projected);

    expect(Object.keys(projected.resources[0]).sort()).toEqual(["availability", "label", "type"]);
    expect(Object.keys(projected.coverArt).sort()).toEqual(["alt", "position", "src"]);
    expect(payload).not.toContain(source.resources[0].id);
    expect(payload).not.toContain(source.resources[0].externalUrl);
    expect(payload).not.toContain(source.resources[1].downloadPath);
    expect(projected).not.toHaveProperty("implementationPlanVersion");
    expect(payload).not.toContain("crm-validate");
    expect(payload).not.toContain("region-segment");
    expect(payload).not.toContain("Starter readiness and operating responsibilities");
  });

  it("keeps protected Clinic prospect records and download routes out of browse payloads", () => {
    const clinic = ideas.find((idea) => idea.id === "idea-002")!;
    const payload = JSON.stringify(toIdeaCatalogEntry(clinic));

    expect(payload).toContain("UAE clinic prospect list");
    expect(payload).toContain("Clinic CRM source");
    expect(payload).not.toContain("clinic-uae-potential-customers");
    expect(payload).not.toContain("/app/resources/clinic-source");
    expect(payload).not.toMatch(/primaryEmail|primaryPhone|whatsappNumber|contactFormUrl|bookingUrl|sourceUrl/);
  });

  it("keeps Accounting guide paths, source evidence, templates, and plan tasks out of the safe preview", () => {
    const accounting = ideas.find((idea) => idea.id === "idea-003")!;
    const payload = JSON.stringify(toIdeaCatalogEntry(accounting));

    expect(payload).toContain("Accounting setup guide");
    expect(payload).not.toContain("/app/resources/accounting-setup-guide");
    expect(payload).not.toContain("8653f614f745052be30d96812c2f8a8a9833b9c9");
    expect(payload).not.toContain("accounting-map-current-workflow");
    expect(payload).not.toContain("Quick question about [Company]");
    expect(payload).not.toContain("AI output requires human review");
  });

  it("keeps ZeroDebt implementation, source, and integration details out of authenticated browse payloads", () => {
    const zeroDebt = ideas.find((idea) => idea.id === "idea-004")!;
    const payload = JSON.stringify(toIdeaCatalogEntry(zeroDebt));

    expect(payload).toContain("one understandable path toward zero");
    expect(payload).not.toContain("zerodebt-license-approval");
    expect(payload).not.toContain("TELEGRAM_BOT_TOKEN");
    expect(payload).not.toContain("app/layout.tsx");
    expect(payload).not.toContain("FinancePublic.git");
  });

  it("keeps Resumi full-kit sections, source commit and distribution route out of browse payloads", () => {
    const resumi = ideas.find((idea) => idea.id === "idea-005")!;
    const payload = JSON.stringify(toIdeaCatalogEntry(resumi));

    expect(payload).toContain("Sanitised source package");
    expect(payload).not.toContain("resumi-source");
    expect(payload).not.toContain("/app/resources/resumi-source");
    expect(payload).not.toContain("3ed78e615e746cb9e7e70d3f53625532bfeda9bd");
    expect(payload).not.toContain("resumi-backend-access");
  });
});
