import { z } from "zod";

export const pergolaProspectSchema = z.object({
  id: z.string().regex(/^prospect-[a-f0-9]{16}$/),
  companyName: z.string().min(1),
  website: z.string().url().nullable(),
  country: z.string().min(1).nullable(),
  stateRegion: z.string().min(1).nullable(),
  city: z.string().min(1).nullable(),
  category: z.string().min(1),
  businessModel: z.string().min(1).nullable(),
  primaryEmail: z.string().email().nullable(),
  primaryPhone: z.string().min(1).nullable(),
  hasQuoteForm: z.boolean(),
  quoteUrl: z.string().url().nullable(),
  sourceUrl: z.string().url().nullable(),
  lastChecked: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable(),
  researchPriority: z.enum(["HIGH", "MEDIUM"]),
});

export const pergolaProspectDatasetSchema = z.object({
  schemaVersion: z.literal(1),
  datasetVersion: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  sourceSummary: z.object({
    sheet: z.literal("Leads"),
    sourceRecordCount: z.number().int().nonnegative(),
    publishedRecordCount: z.number().int().nonnegative(),
    duplicateEligibleRows: z.number().int().nonnegative(),
  }),
  records: z.array(pergolaProspectSchema),
}).superRefine((dataset, context) => {
  if (dataset.records.length !== dataset.sourceSummary.publishedRecordCount) {
    context.addIssue({ code: "custom", message: "Published prospect count does not match the normalized records" });
  }
  const ids = new Set<string>();
  for (const record of dataset.records) {
    if (ids.has(record.id)) context.addIssue({ code: "custom", message: `Duplicate prospect id: ${record.id}` });
    ids.add(record.id);
  }
});

export type PergolaProspect = z.infer<typeof pergolaProspectSchema>;
export type PergolaProspectDataset = z.infer<typeof pergolaProspectDatasetSchema>;

function csvCell(value: string | null | boolean) {
  const text = value === null ? "" : typeof value === "boolean" ? value ? "Yes" : "No" : value;
  return `"${text.replaceAll('"', '""')}"`;
}

export function createPergolaProspectCsv(records: PergolaProspect[]) {
  const headers = [
    "Company name",
    "Website",
    "Country",
    "State / region",
    "City",
    "Category",
    "Business model",
    "Primary business email",
    "Primary business phone",
    "Has quote form",
    "Quote URL",
    "Source URL",
    "Last checked",
    "Research priority",
  ];
  const rows = records.map((record) => [
    record.companyName,
    record.website,
    record.country,
    record.stateRegion,
    record.city,
    record.category,
    record.businessModel,
    record.primaryEmail,
    record.primaryPhone,
    record.hasQuoteForm,
    record.quoteUrl,
    record.sourceUrl,
    record.lastChecked,
    record.researchPriority,
  ].map(csvCell).join(","));

  return `\uFEFF${headers.map(csvCell).join(",")}\r\n${rows.join("\r\n")}\r\n`;
}
