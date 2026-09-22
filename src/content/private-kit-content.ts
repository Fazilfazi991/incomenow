import { z } from "zod";

const guideStepSchema = z.object({
  id: z.string(),
  label: z.string(),
  title: z.string(),
  status: z.string(),
  body: z.string(),
  commands: z.array(z.string()).optional(),
});

const softwareScopeItemSchema = z.object({
  feature: z.string(),
  whatItDoes: z.string().optional(),
  purpose: z.string().optional(),
  status: z.string().optional(),
  demoObserved: z.enum(["Yes", "Navigation only", "No"]).optional(),
  sourceInspected: z.boolean().optional(),
  localStatus: z.string().optional(),
});

const demoEvidenceItemSchema = z.object({
  feature: z.string(),
  evidence: z.string().optional(),
  observed: z.string().optional(),
  interaction: z.string().optional(),
  notes: z.string(),
});

const markdownMetadataSchema = z.object({
  title: z.string(),
  introduction: z.string(),
  promptHeading: z.string(),
  warning: z.string(),
});

const toolSchema = z.object({
  name: z.string(),
  purpose: z.string(),
  requirement: z.string(),
  ownership: z.string(),
  costNote: z.string(),
});

export const pergolaPrivateKitContentSchema = z.object({
  schemaVersion: z.literal(1),
  ideaId: z.literal("idea-001"),
  markdown: markdownMetadataSchema,
  softwareScope: z.array(softwareScopeItemSchema),
  setupGuide: z.array(guideStepSchema),
  codexPrompts: z.array(z.string()),
  deliveryGuide: z.array(z.string()),
});

export const clinicPrivateKitContentSchema = z.object({
  schemaVersion: z.literal(1),
  ideaId: z.literal("idea-002"),
  markdown: markdownMetadataSchema,
  demoEvidence: z.array(demoEvidenceItemSchema),
  demoWalkthrough: z.array(z.string()),
  softwareScope: z.array(softwareScopeItemSchema),
  healthDataFlags: z.array(z.string()),
  setupGuide: z.array(guideStepSchema),
  codexPrompts: z.array(z.string()),
  toolGroups: z.array(z.object({ category: z.string(), tools: z.array(toolSchema) })),
  deliveryGuide: z.array(z.string()),
});

export const accountingPrivateKitContentSchema = z.object({
  schemaVersion: z.literal(1),
  ideaId: z.literal("idea-003"),
  markdown: markdownMetadataSchema,
  demoEvidence: z.array(demoEvidenceItemSchema),
  softwareScope: z.array(softwareScopeItemSchema),
  setupGuide: z.array(guideStepSchema),
  aiEvidence: z.array(z.object({ title: z.string(), body: z.string() })),
  safePrompts: z.array(z.string()),
  deliveryGuide: z.array(z.string()),
});

export type PergolaPrivateKitContent = z.infer<typeof pergolaPrivateKitContentSchema>;
export type ClinicPrivateKitContent = z.infer<typeof clinicPrivateKitContentSchema>;
export type AccountingPrivateKitContent = z.infer<typeof accountingPrivateKitContentSchema>;

export type PrivateKitContent = PergolaPrivateKitContent | ClinicPrivateKitContent | AccountingPrivateKitContent;
