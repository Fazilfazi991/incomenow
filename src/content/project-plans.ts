import { z } from "zod";
import planData from "./project-plan-data.json";
import { implementationStageSchema, type ImplementationStage } from "./idea-schema";

const planVersionSchema = z.object({
  stages: z.array(implementationStageSchema).min(1),
});

const ideaPlansSchema = z.object({
  currentVersion: z.string().regex(/^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$/),
  versions: z.record(z.string(), planVersionSchema),
}).superRefine((entry, context) => {
  if (!entry.versions[entry.currentVersion]) {
    context.addIssue({ code: "custom", message: `Missing current plan version ${entry.currentVersion}` });
  }
});

const projectPlanRegistrySchema = z.record(z.string().regex(/^idea-\d{3}$/), ideaPlansSchema);

export const projectPlanRegistry = projectPlanRegistrySchema.parse(planData);

export type ProjectPlanDefinition = {
  ideaId: string;
  version: string;
  stages: ImplementationStage[];
};

export function getProjectPlanDefinition(ideaId: string, version: string): ProjectPlanDefinition | null {
  const entry = projectPlanRegistry[ideaId];
  const plan = entry?.versions[version];
  return plan ? { ideaId, version, stages: plan.stages } : null;
}

export function getCurrentProjectPlan(ideaId: string): ProjectPlanDefinition | null {
  const entry = projectPlanRegistry[ideaId];
  return entry ? getProjectPlanDefinition(ideaId, entry.currentVersion) : null;
}
