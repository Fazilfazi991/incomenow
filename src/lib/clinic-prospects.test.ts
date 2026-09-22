import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  clinicProspectSchema,
  clinicProspectDatasetSchema,
  createClinicProspectCsv,
  emptyClinicProspectFilters,
  filterClinicProspects,
} from "./clinic-prospects";

const datasetPath = path.join(process.cwd(), "private-resources", "clinic", "uae-clinic-prospects-v1.json");
const dataset = existsSync(datasetPath) ? clinicProspectDatasetSchema.parse(JSON.parse(await readFile(datasetPath, "utf8"))) : null;
const records = dataset?.records ?? [];

describe.skipIf(!dataset)("Clinic prospect member-safe projection", () => {
  it("publishes all 100 accepted HIGH and MEDIUM records with the stated geography and taxonomy", () => {
    expect(records).toHaveLength(100);
    expect(records.filter((record) => record.researchPriority === "HIGH")).toHaveLength(62);
    expect(records.filter((record) => record.researchPriority === "MEDIUM")).toHaveLength(38);
    expect(records.filter((record) => record.city === "Dubai")).toHaveLength(70);
    expect(records.filter((record) => record.city === "Abu Dhabi")).toHaveLength(30);
    expect(records.filter((record) => record.clinicType === "Dental Clinic")).toHaveLength(33);
    expect(records.filter((record) => record.clinicType === "Aesthetic / Dermatology Clinic")).toHaveLength(29);
    expect(records.filter((record) => record.clinicType === "Physiotherapy / Chiropractic Clinic")).toHaveLength(25);
    expect(records.filter((record) => record.clinicType === "Specialist / Medical Centre")).toHaveLength(13);
    expect(dataset!.sourceSummary).toMatchObject({
      sourceRecordCount: 100,
      publishedRecordCount: 100,
      rejectedSourceRecordCount: 3,
      duplicateBranchRecordsConsolidated: 3,
    });
  });

  it("matches the stated public contact-route counts without turning unknown WhatsApp into no", () => {
    expect(records.filter((record) => record.primaryEmail)).toHaveLength(70);
    expect(records.filter((record) => record.primaryPhone)).toHaveLength(97);
    expect(records.filter((record) => record.contactFormUrl)).toHaveLength(84);
    expect(records.filter((record) => record.bookingUrl)).toHaveLength(37);
    expect(records.filter((record) => record.whatsappStatus === "available")).toHaveLength(62);
    expect(records.filter((record) => record.whatsappStatus === "not-publicly-listed")).toHaveLength(23);
    expect(records.filter((record) => record.whatsappStatus === "unknown")).toHaveLength(15);
    expect(records.every((record) => record.primaryEmail || record.primaryPhone || record.contactFormUrl || record.bookingUrl || record.whatsappNumber)).toBe(true);
  });

  it("contains only the approved record projection and no internal research fields", () => {
    const recordKeys = Object.keys(records[0]).sort();
    expect(recordKeys).toEqual([
      "area", "bookingUrl", "city", "clinicType", "companyName", "contactFormUrl", "country", "emirate", "id",
      "lastChecked", "mainServices", "primaryEmail", "primaryPhone", "researchPriority", "sourceUrl", "website",
      "whatsappNumber", "whatsappStatus",
    ]);
    expect(JSON.stringify(records)).not.toMatch(/Priority Reason|Research Notes|Email Source URL|Phone Source URL|Email Status|Business Description|LinkedIn|Instagram|Domain/);
  });

  it("rejects non-web link schemes before member-facing actions are rendered", () => {
    expect(clinicProspectSchema.safeParse({ ...records[0], sourceUrl: "javascript:alert(1)" }).success).toBe(false);
    expect(clinicProspectSchema.safeParse({ ...records[0], website: "data:text/html,unsafe" }).success).toBe(false);
  });

  it("combines location, type, priority, and contact filters deterministically", () => {
    expect(filterClinicProspects(records, { ...emptyClinicProspectFilters, city: "Dubai", researchPriority: "HIGH", contact: "whatsapp" })).toHaveLength(32);
    expect(filterClinicProspects(records, { ...emptyClinicProspectFilters, city: "Abu Dhabi", clinicType: "Dental Clinic", contact: "phone" })).toHaveLength(12);
    expect(filterClinicProspects(records, { ...emptyClinicProspectFilters, city: "Dubai", clinicType: "Aesthetic / Dermatology Clinic", contact: "email" })).toHaveLength(13);
  });

  it("creates a stable UTF-8 CSV with only approved headers and 100 records", () => {
    const csv = createClinicProspectCsv(records);
    expect(csv.startsWith("\uFEFF")).toBe(true);
    expect(csv.trimEnd().split(/\r?\n/)).toHaveLength(101);
    expect(csv.split(/\r?\n/, 1)[0]).toBe('\uFEFF"Company Name","Website","Country","Emirate","City","Area","Clinic Type","Main Services","Primary Email","Primary Phone","WhatsApp Available","WhatsApp Number","Contact Form URL","Appointment / Booking URL","Source URL","Last Checked","Research Priority"');
    expect(csv).not.toMatch(/Priority Reason|Research Notes|Email Source URL|Phone Source URL|Email Status|Business Description|LinkedIn|Instagram|Domain/);
  });
});
