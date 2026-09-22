import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { createPergolaProspectCsv, pergolaProspectDatasetSchema, type PergolaProspect } from "./pergola-prospects";

const artifactPath = path.join(process.cwd(), "private-resources", "pergola", "potential-customers.json");

describe.skipIf(!existsSync(artifactPath))("Pergola prospect projection", () => {
  it("contains the approved 77-record projection without internal research fields or raw Excel dates", () => {
    const raw = readFileSync(artifactPath, "utf8");
    const dataset = pergolaProspectDatasetSchema.parse(JSON.parse(raw));
    expect(dataset.sourceSummary.sourceRecordCount).toBe(191);
    expect(dataset.sourceSummary.publishedRecordCount).toBe(77);
    expect(dataset.sourceSummary.duplicateEligibleRows).toBe(0);
    expect(dataset.records).toHaveLength(77);
    expect(raw).not.toMatch(/Outreach Status|First Contact Date|Contact Method|Email Sent To|Google Search Query|All Emails|All Phones|Email Validation|Contact Name|Contact Role|WhatsApp/);
    expect(raw).not.toMatch(/4628[34]/);
    expect(dataset.records.every((record) => /^2026-09-(18|19)$/.test(record.lastChecked ?? ""))).toBe(true);
  });

  it("quotes every CSV field, preserves UTF-8, and omits internal identifiers", () => {
    const record: PergolaProspect = {
      id: "prospect-0123456789abcdef",
      companyName: 'Pergola, "North"',
      website: "https://example.com/",
      country: "United States",
      stateRegion: "Arizona",
      city: "Phoenix",
      category: "Pergola Installer",
      businessModel: null,
      primaryEmail: "hello@example.com",
      primaryPhone: null,
      hasQuoteForm: false,
      quoteUrl: null,
      sourceUrl: "https://example.com/contact",
      lastChecked: "2026-09-19",
      researchPriority: "HIGH",
    };
    const csv = createPergolaProspectCsv([record]);
    expect(csv.startsWith("\uFEFF")).toBe(true);
    expect(csv).toContain('"Pergola, ""North"""');
    expect(csv).toContain('"Primary business email"');
    expect(csv).not.toContain(record.id);
    expect(csv).not.toMatch(/Outreach Status|Contact Method|All Emails/);
  });
});
