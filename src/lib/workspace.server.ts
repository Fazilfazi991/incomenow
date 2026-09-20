import "server-only";

import { getIdeaById } from "@/content/ideas";
import { getProjectPlanDefinition } from "@/content/project-plans";
import type { Idea, ImplementationStage } from "@/content/idea-schema";
import type { Database } from "@/types/database";
import { requireActiveMembership } from "./membership.server";
import { createClient } from "./supabase/server";
import { deriveProgress, deriveStageProgress, type ProjectProgress } from "./workspace-progress";

type ProjectRow = Database["public"]["Tables"]["projects"]["Row"];
type TaskRow = Database["public"]["Tables"]["project_tasks"]["Row"];
type NoteRow = Database["public"]["Tables"]["project_stage_notes"]["Row"];

export type MemberBookmark = {
  idea: Idea;
  savedAt: string;
};

export type { ProjectProgress } from "./workspace-progress";

export type MemberProjectSummary = {
  id: string;
  idea: Idea;
  planVersion: string;
  pausedAt: string | null;
  createdAt: string;
  updatedAt: string;
  progress: ProjectProgress;
  currentStageTitle: string;
  nextActionTitle: string;
};

export type WorkspaceTask = ImplementationStage["tasks"][number] & {
  completedAt: string | null;
};

export type WorkspaceStage = Omit<ImplementationStage, "tasks"> & {
  position: number;
  tasks: WorkspaceTask[];
  note: Pick<NoteRow, "content" | "revision" | "updated_at">;
  progress: ProjectProgress;
};

export type MemberProjectWorkspace = MemberProjectSummary & {
  stages: WorkspaceStage[];
};

export async function getMemberBookmarks(destination = "/app/saved") {
  await requireActiveMembership(destination);
  const supabase = await createClient();
  const { data, error } = await supabase.from("bookmarks").select("idea_id, saved_at").order("saved_at", { ascending: false });
  if (error) throw new Error("Unable to load saved ideas.", { cause: error });
  return (data ?? []).flatMap<MemberBookmark>((bookmark) => {
    const idea = getIdeaById(bookmark.idea_id);
    return idea ? [{ idea, savedAt: bookmark.saved_at }] : [];
  });
}

export async function getMemberSavedIdeaIds(destination = "/app/explore") {
  return (await getMemberBookmarks(destination)).map((bookmark) => bookmark.idea.id);
}

function buildSummary(project: ProjectRow, tasks: TaskRow[]): MemberProjectSummary | null {
  const idea = getIdeaById(project.idea_id);
  const plan = getProjectPlanDefinition(project.idea_id, project.plan_version);
  if (!idea || !plan) return null;
  const taskById = new Map(tasks.map((task) => [task.task_id, task]));
  const stageInputs = plan.stages.map((stage) => ({
    stage,
    tasks: stage.tasks.map((task) => ({ required: task.required, completed_at: taskById.get(task.id)?.completed_at ?? null })),
  }));
  const progress = deriveStageProgress(stageInputs);
  const currentStage = stageInputs.find(({ tasks: stageTasks }) => stageTasks.some((task) => task.required && !task.completed_at));
  const nextAction = currentStage?.stage.tasks.find((task) => task.required && !taskById.get(task.id)?.completed_at);
  return {
    id: project.id,
    idea,
    planVersion: project.plan_version,
    pausedAt: project.paused_at,
    createdAt: project.created_at,
    updatedAt: project.updated_at,
    progress,
    currentStageTitle: progress.isComplete ? "All required stages complete" : currentStage?.stage.title ?? "Plan unavailable",
    nextActionTitle: progress.isComplete ? "Review the completed implementation checklist" : nextAction?.title ?? "Review the current stage",
  };
}

export async function getMemberProjects(destination = "/app/projects") {
  await requireActiveMembership(destination);
  const supabase = await createClient();
  const [{ data: projects, error: projectError }, { data: tasks, error: taskError }] = await Promise.all([
    supabase.from("projects").select("*").order("updated_at", { ascending: false }),
    supabase.from("project_tasks").select("*"),
  ]);
  if (projectError || taskError) throw new Error("Unable to load projects.", { cause: projectError ?? taskError });
  return (projects ?? []).flatMap<MemberProjectSummary>((project) => {
    const summary = buildSummary(project, (tasks ?? []).filter((task) => task.project_id === project.id));
    return summary ? [summary] : [];
  });
}

export async function getMemberProject(projectId: string): Promise<MemberProjectWorkspace | null> {
  await requireActiveMembership(`/app/projects/${encodeURIComponent(projectId)}`);
  const supabase = await createClient();
  const { data: project, error: projectError } = await supabase.from("projects").select("*").eq("id", projectId).maybeSingle();
  if (projectError) throw new Error("Unable to load this project.", { cause: projectError });
  if (!project) return null;

  const [{ data: taskRows, error: taskError }, { data: notes, error: noteError }] = await Promise.all([
    supabase.from("project_tasks").select("*").eq("project_id", projectId).order("position"),
    supabase.from("project_stage_notes").select("*").eq("project_id", projectId),
  ]);
  if (taskError || noteError) throw new Error("Unable to load project progress.", { cause: taskError ?? noteError });

  const tasks = taskRows ?? [];
  const summary = buildSummary(project, tasks);
  const plan = getProjectPlanDefinition(project.idea_id, project.plan_version);
  if (!summary || !plan) return null;
  const noteByStage = new Map((notes ?? []).map((note) => [note.stage_id, note]));

  const stages = plan.stages.map<WorkspaceStage>((stage, index) => {
    const taskById = new Map(tasks.filter((task) => task.stage_id === stage.id).map((task) => [task.task_id, task]));
    const stageTasks = stage.tasks.map((task) => ({ ...task, completedAt: taskById.get(task.id)?.completed_at ?? null }));
    const note = noteByStage.get(stage.id);
    return {
      ...stage,
      position: index + 1,
      tasks: stageTasks,
      note: { content: note?.content ?? "", revision: note?.revision ?? 0, updated_at: note?.updated_at ?? project.created_at },
      progress: deriveProgress(stageTasks.map((task) => ({ required: task.required, completed_at: task.completedAt }))),
    };
  });
  return { ...summary, stages };
}

export async function getMemberProjectIdForIdea(ideaId: string) {
  await requireActiveMembership("/app/explore");
  const supabase = await createClient();
  const { data, error } = await supabase.from("projects").select("id").eq("idea_id", ideaId).maybeSingle();
  if (error) throw new Error("Unable to check project status.", { cause: error });
  return data?.id ?? null;
}
