import { describe, expect, it } from "vitest";
import { getCurrentProjectPlan, getProjectPlanDefinition, projectPlanRegistry } from "./project-plans";

describe("versioned project plans", () => {
  it("resolves every current plan and keeps structural ids unique", () => {
    for (const [ideaId, entry] of Object.entries(projectPlanRegistry)) {
      const plan = getCurrentProjectPlan(ideaId);
      expect(plan?.version).toBe(entry.currentVersion);
      const stageIds = plan!.stages.map((stage) => stage.id);
      const taskIds = plan!.stages.flatMap((stage) => stage.tasks.map((task) => task.id));
      expect(new Set(stageIds).size).toBe(stageIds.length);
      expect(new Set(taskIds).size).toBe(taskIds.length);
      expect(plan!.stages.every((stage) => stage.tasks.some((task) => task.required))).toBe(true);
    }
  });

  it("returns null for a plan version that is not in repository content", () => {
    expect(getProjectPlanDefinition("idea-001", "missing")).toBeNull();
  });
});
