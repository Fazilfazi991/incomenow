import { z } from "zod";

export const solutionTypeSchema = z.enum([
  "Custom CRM",
  "Lead-generation website",
  "Automation",
  "Web tool",
  "Digital service",
]);

export const readinessSchema = z.enum([
  "Concept ready",
  "Sample blueprint",
  "Setup ready",
]);

export const marketEvidenceSchema = z.enum([
  "Not yet validated",
  "Discovery in progress",
]);

const resourceSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  type: z.enum([
    "demo",
    "source",
    "guide",
    "workflow",
    "template",
    "worksheet",
    "checklist",
    "script",
  ]),
  availability: z.enum(["available", "sample", "not-connected"]),
  description: z.string().min(1),
  externalUrl: z.string().url().optional(),
  downloadPath: z.string().regex(/^\/app\/resources\/[a-z0-9-]+$/).optional(),
  actionLabel: z.string().min(1).optional(),
  notice: z.string().min(1).optional(),
}).superRefine((resource, context) => {
  const actionTargetCount = Number(Boolean(resource.externalUrl)) + Number(Boolean(resource.downloadPath));
  if (resource.availability === "available" && actionTargetCount !== 1) {
    context.addIssue({ code: "custom", message: `${resource.id} is available but does not have exactly one action target` });
  }
  if (actionTargetCount > 0 && resource.availability !== "available") {
    context.addIssue({ code: "custom", message: `${resource.id} has an action target but is not available` });
  }
  if (resource.availability === "available" && !resource.actionLabel) {
    context.addIssue({ code: "custom", message: `${resource.id} is available but has no action label` });
  }
});

export const implementationTaskSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  title: z.string().min(1),
  description: z.string().min(1),
  required: z.boolean(),
});

export const implementationStageSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  summary: z.string().min(1),
  tasks: z.array(implementationTaskSchema).min(1),
  condition: z.string().optional(),
  resourceIds: z.array(z.string().min(1)).default([]),
});

const overviewSectionSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  type: z.literal("overview"),
  title: z.string(),
  body: z.array(z.string()).min(1),
  friction: z.string(),
  validation: z.string(),
  businessModel: z.string(),
});

const workflowSectionSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  type: z.literal("workflow"),
  title: z.string(),
  description: z.string(),
  steps: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      detail: z.string(),
      condition: z.string().optional(),
    }),
  ).min(2),
  safeguard: z.string().optional(),
});

const demoSectionSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  type: z.literal("demo-preview"),
  title: z.string(),
  description: z.string(),
  variant: z.enum(["crm", "website"]),
  metrics: z.array(z.object({ label: z.string(), value: z.string() })).min(2),
  modules: z.array(z.string().min(1)).min(1).optional(),
});

const actionPlanSectionSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  type: z.literal("action-plan"),
  title: z.string(),
  stages: z.array(implementationStageSchema).min(1),
});

const resourcesSectionSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  type: z.literal("resources"),
  title: z.string(),
  intro: z.string(),
  resourceIds: z.array(z.string()).min(1),
  steps: z.array(z.object({
    title: z.string().min(1),
    detail: z.string().min(1),
  })).min(1).optional(),
});

const discoverySectionSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  type: z.literal("customer-discovery"),
  title: z.string(),
  audiences: z.array(z.string()).min(1),
  questions: z.array(z.string()).min(1),
  guidance: z.string(),
});

const updatesSectionSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  type: z.literal("updates-limitations"),
  title: z.string(),
  notes: z.array(z.string()).min(1),
});

const salesKitSectionSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  type: z.literal("sales-kit"),
  title: z.string(),
  intro: z.string(),
  items: z.array(z.object({
    title: z.string().min(1),
    detail: z.string().min(1),
    kind: z.enum(["email", "call", "follow-up", "demo", "proposal", "guide"]).optional(),
    subject: z.string().min(1).optional(),
    template: z.string().min(1).optional(),
  })).min(1),
}).superRefine((section, context) => {
  for (const item of section.items) {
    if (item.kind && item.kind !== "guide" && !item.template) {
      context.addIssue({ code: "custom", message: `${item.title} requires editable template copy` });
    }
  }
});

const pricingPlannerSectionSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  type: z.literal("pricing-planner"),
  title: z.string().min(1),
  intro: z.string().min(1),
  packageStructures: z.array(z.object({
    title: z.string().min(1),
    items: z.array(z.string().min(1)).min(1),
  })).min(1),
});

const toolsSectionSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  type: z.literal("tools"),
  title: z.string().min(1),
  intro: z.string().min(1),
  tools: z.array(z.object({
    name: z.string().min(1),
    purpose: z.string().min(1),
    requirement: z.enum(["Required", "Optional", "Confirm from source"]),
    ownership: z.string().min(1),
    costNote: z.string().min(1),
  })).min(1),
});

const questionnaireSectionSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  type: z.literal("discovery-questionnaire"),
  title: z.string().min(1),
  intro: z.string().min(1),
  questions: z.array(z.string().min(1)).min(1),
  privacyTitle: z.string().min(1),
  privacyBody: z.array(z.string().min(1)).min(1),
});

export const ideaSectionSchema = z.discriminatedUnion("type", [
  overviewSectionSchema,
  workflowSectionSchema,
  demoSectionSchema,
  actionPlanSectionSchema,
  resourcesSectionSchema,
  discoverySectionSchema,
  salesKitSectionSchema,
  updatesSectionSchema,
  pricingPlannerSectionSchema,
  toolsSectionSchema,
  questionnaireSectionSchema,
]);

const coverArtSchema = z.object({
  src: z.string().regex(/^\/artwork\/(?:ideas|marketing\/modern)\/[a-z0-9-]+\.webp$/),
  alt: z.string().min(1),
  position: z.string().min(1).default("50% 50%"),
});

export const ideaSchema = z.object({
  id: z.string().regex(/^idea-\d{3}$/),
  displayNumber: z.string().regex(/^\d{3}$/),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  title: z.string().min(1),
  summary: z.string().min(1),
  kitTitle: z.string().min(1).optional(),
  kitSummary: z.string().min(1).optional(),
  solutionType: solutionTypeSchema,
  industries: z.array(z.string().min(1)).min(1),
  technicalRequirements: z.array(z.string().min(1)),
  intendedCustomer: z.string().min(1),
  proposedBusinessModel: z.string().min(1),
  readiness: readinessSchema,
  marketEvidence: marketEvidenceSchema,
  addedOrder: z.number().int().nonnegative(),
  published: z.boolean(),
  detailAvailable: z.boolean(),
  implementationPlanVersion: z.string().regex(/^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$/).optional(),
  fixtureLabel: z.string().optional(),
  previewVariant: z.enum(["pipeline", "dispatch", "automation", "website", "scorecard", "property"]),
  coverArt: coverArtSchema,
  publicCoverArt: coverArtSchema.optional(),
  cardNote: z.string().min(1),
  resources: z.array(resourceSchema),
  featuredResourceIds: z.array(z.string().min(1)).max(3).optional(),
  sections: z.array(ideaSectionSchema),
});

export const ideasSchema = z.array(ideaSchema).superRefine((ideas, context) => {
  const ids = new Set<string>();
  const slugs = new Set<string>();

  for (const idea of ideas) {
    if (ids.has(idea.id)) {
      context.addIssue({ code: "custom", message: `Duplicate idea id: ${idea.id}` });
    }
    if (slugs.has(idea.slug)) {
      context.addIssue({ code: "custom", message: `Duplicate idea slug: ${idea.slug}` });
    }
    ids.add(idea.id);
    slugs.add(idea.slug);

    const resourceIds = new Set(idea.resources.map((resource) => resource.id));
    const sectionIds = new Set<string>();
    for (const resourceId of idea.featuredResourceIds ?? []) {
      if (!resourceIds.has(resourceId)) {
        context.addIssue({ code: "custom", message: `${idea.id} features unknown resource ${resourceId}` });
      }
    }
    const actionPlan = idea.sections.find((section) => section.type === "action-plan");
    if (idea.detailAvailable && (!idea.implementationPlanVersion || !actionPlan)) {
      context.addIssue({
        code: "custom",
        message: `${idea.id} requires a versioned implementation plan`,
      });
    }
    for (const section of idea.sections) {
      if (sectionIds.has(section.id)) {
        context.addIssue({ code: "custom", message: `${idea.id} has duplicate section ${section.id}` });
      }
      sectionIds.add(section.id);
      if (section.type === "resources") {
        for (const resourceId of section.resourceIds) {
          if (!resourceIds.has(resourceId)) {
            context.addIssue({
              code: "custom",
              message: `${idea.id} links to unknown resource ${resourceId}`,
            });
          }
        }
      }
      if (section.type === "action-plan") {
        const stageIds = new Set<string>();
        const taskIds = new Set<string>();
        for (const stage of section.stages) {
          if (stageIds.has(stage.id)) {
            context.addIssue({ code: "custom", message: `${idea.id} has duplicate stage ${stage.id}` });
          }
          stageIds.add(stage.id);
          for (const resourceId of stage.resourceIds) {
            if (!resourceIds.has(resourceId)) {
              context.addIssue({ code: "custom", message: `${idea.id} stage ${stage.id} links to unknown resource ${resourceId}` });
            }
          }
          for (const task of stage.tasks) {
            if (taskIds.has(task.id)) {
              context.addIssue({ code: "custom", message: `${idea.id} has duplicate task ${task.id}` });
            }
            taskIds.add(task.id);
          }
        }
      }
    }
  }
});

export type Idea = z.infer<typeof ideaSchema>;
export type IdeaSection = z.infer<typeof ideaSectionSchema>;
export type ImplementationStage = z.infer<typeof implementationStageSchema>;
export type ImplementationTask = z.infer<typeof implementationTaskSchema>;
export type SolutionType = z.infer<typeof solutionTypeSchema>;
export type Readiness = z.infer<typeof readinessSchema>;
