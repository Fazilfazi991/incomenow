import { z } from "zod";

const publicWebUrlSchema = z.string().url().refine((value) => {
  const protocol = new URL(value).protocol;
  return protocol === "https:" || protocol === "http:";
}, "Public links must use HTTP or HTTPS");

export const clinicProspectSchema = z.object({
  id: z.string().regex(/^clinic-prospect-[a-f0-9]{16}$/),
  companyName: z.string().min(1),
  website: publicWebUrlSchema.nullable(),
  country: z.literal("United Arab Emirates"),
  emirate: z.enum(["Dubai", "Abu Dhabi"]),
  city: z.enum(["Dubai", "Abu Dhabi"]),
  area: z.string().min(1).nullable(),
  clinicType: z.enum([
    "Aesthetic / Dermatology Clinic",
    "Dental Clinic",
    "Physiotherapy / Chiropractic Clinic",
    "Specialist / Medical Centre",
  ]),
  mainServices: z.string().min(1).nullable(),
  primaryEmail: z.string().email().nullable(),
  primaryPhone: z.string().min(1).nullable(),
  contactFormUrl: publicWebUrlSchema.nullable(),
  bookingUrl: publicWebUrlSchema.nullable(),
  whatsappStatus: z.enum(["available", "not-publicly-listed", "unknown"]),
  whatsappNumber: z.string().min(1).nullable(),
  sourceUrl: publicWebUrlSchema,
  lastChecked: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  researchPriority: z.enum(["HIGH", "MEDIUM"]),
}).strict().superRefine((record, context) => {
  if (record.whatsappStatus !== "available" && record.whatsappNumber) {
    context.addIssue({ code: "custom", message: "A WhatsApp number requires an explicitly available clinic-published route" });
  }
});

export const clinicProspectDatasetSchema = z.object({
  schemaVersion: z.literal(1),
  datasetVersion: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  sourceSummary: z.object({
    sourceWorkbookSha256: z.string().regex(/^[A-F0-9]{64}$/),
    sourceCsvSha256: z.string().regex(/^[A-F0-9]{64}$/),
    sourceRecordCount: z.number().int().nonnegative(),
    publishedRecordCount: z.number().int().nonnegative(),
    rejectedSourceRecordCount: z.number().int().nonnegative(),
    duplicateBranchRecordsConsolidated: z.number().int().nonnegative(),
  }).strict(),
  records: z.array(clinicProspectSchema),
}).strict().superRefine((dataset, context) => {
  if (dataset.records.length !== dataset.sourceSummary.publishedRecordCount) {
    context.addIssue({ code: "custom", message: "Published clinic count does not match the projected records" });
  }

  const ids = new Set<string>();
  for (const record of dataset.records) {
    if (ids.has(record.id)) context.addIssue({ code: "custom", message: `Duplicate clinic prospect id: ${record.id}` });
    ids.add(record.id);
  }
});

export type ClinicProspect = z.infer<typeof clinicProspectSchema>;
export type ClinicProspectDataset = z.infer<typeof clinicProspectDatasetSchema>;
export type ClinicContactFilter = "all" | "email" | "phone" | "contact-form" | "booking" | "whatsapp";

export type ClinicProspectFilters = {
  query: string;
  country: string;
  emirate: string;
  city: string;
  area: string;
  clinicType: string;
  researchPriority: "all" | ClinicProspect["researchPriority"];
  contact: ClinicContactFilter;
};

export const emptyClinicProspectFilters: ClinicProspectFilters = {
  query: "",
  country: "all",
  emirate: "all",
  city: "all",
  area: "all",
  clinicType: "all",
  researchPriority: "all",
  contact: "all",
};

function websiteDomain(website: string | null) {
  if (!website) return "";
  try { return new URL(website).hostname.replace(/^www\./, ""); } catch { return ""; }
}

export function filterClinicProspects(records: readonly ClinicProspect[], filters: ClinicProspectFilters) {
  const query = filters.query.trim().toLowerCase();
  return records.filter((record) => {
    const matchesQuery = !query || `${record.companyName} ${websiteDomain(record.website)} ${record.area ?? ""} ${record.mainServices ?? ""}`.toLowerCase().includes(query);
    const matchesCountry = filters.country === "all" || record.country === filters.country;
    const matchesEmirate = filters.emirate === "all" || record.emirate === filters.emirate;
    const matchesCity = filters.city === "all" || record.city === filters.city;
    const matchesArea = filters.area === "all" || record.area === filters.area;
    const matchesType = filters.clinicType === "all" || record.clinicType === filters.clinicType;
    const matchesPriority = filters.researchPriority === "all" || record.researchPriority === filters.researchPriority;
    const matchesContact = filters.contact === "all"
      || (filters.contact === "email" && Boolean(record.primaryEmail))
      || (filters.contact === "phone" && Boolean(record.primaryPhone))
      || (filters.contact === "contact-form" && Boolean(record.contactFormUrl))
      || (filters.contact === "booking" && Boolean(record.bookingUrl))
      || (filters.contact === "whatsapp" && record.whatsappStatus === "available" && Boolean(record.whatsappNumber));
    return matchesQuery && matchesCountry && matchesEmirate && matchesCity && matchesArea && matchesType && matchesPriority && matchesContact;
  });
}

function csvCell(value: string | null) {
  const text = value ?? "";
  return `"${text.replaceAll('"', '""')}"`;
}

function whatsappLabel(status: ClinicProspect["whatsappStatus"]) {
  if (status === "available") return "Available";
  if (status === "not-publicly-listed") return "Not publicly listed";
  return "Unknown";
}

export function createClinicProspectCsv(records: readonly ClinicProspect[]) {
  const headers = [
    "Company Name",
    "Website",
    "Country",
    "Emirate",
    "City",
    "Area",
    "Clinic Type",
    "Main Services",
    "Primary Email",
    "Primary Phone",
    "WhatsApp Available",
    "WhatsApp Number",
    "Contact Form URL",
    "Appointment / Booking URL",
    "Source URL",
    "Last Checked",
    "Research Priority",
  ];
  const rows = records.map((record) => [
    record.companyName,
    record.website,
    record.country,
    record.emirate,
    record.city,
    record.area,
    record.clinicType,
    record.mainServices,
    record.primaryEmail,
    record.primaryPhone,
    whatsappLabel(record.whatsappStatus),
    record.whatsappNumber,
    record.contactFormUrl,
    record.bookingUrl,
    record.sourceUrl,
    record.lastChecked,
    record.researchPriority,
  ].map(csvCell).join(","));

  return `\uFEFF${headers.map(csvCell).join(",")}\r\n${rows.join("\r\n")}\r\n`;
}
