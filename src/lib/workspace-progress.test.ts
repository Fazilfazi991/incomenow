import { describe, expect, it } from "vitest";
import { deriveProgress, deriveStageProgress } from "./workspace-progress";

describe("workspace progress", () => {
  it("derives progress from required tasks only", () => {
    expect(deriveProgress([
      { required: true, completed_at: "2026-09-20T12:00:00Z" },
      { required: true, completed_at: null },
      { required: false, completed_at: "2026-09-20T12:00:00Z" },
    ])).toEqual({ completed: 1, total: 2, percent: 50, isComplete: false });
  });

  it("reopens completion when a required task is unchecked", () => {
    const completed = deriveProgress([{ required: true, completed_at: "2026-09-20T12:00:00Z" }]);
    const reopened = deriveProgress([{ required: true, completed_at: null }]);
    expect(completed.isComplete).toBe(true);
    expect(reopened).toEqual({ completed: 0, total: 1, percent: 0, isComplete: false });
  });

  it("does not treat an empty plan as complete", () => {
    expect(deriveProgress([])).toEqual({ completed: 0, total: 0, percent: 0, isComplete: false });
  });

  it("derives overall project progress from completed required stages", () => {
    expect(deriveStageProgress([
      { tasks: [{ required: true, completed_at: "2026-09-20T12:00:00Z" }] },
      { tasks: [{ required: true, completed_at: null }, { required: false, completed_at: "2026-09-20T12:00:00Z" }] },
      { tasks: [{ required: false, completed_at: null }] },
    ])).toEqual({ completed: 1, total: 2, percent: 50, isComplete: false });
  });
});
