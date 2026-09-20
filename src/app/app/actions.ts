"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getIdeaById } from "@/content/ideas";
import { getIdeaAccessDecision, requireVerifiedAccount } from "@/lib/membership.server";
import { createClient } from "@/lib/supabase/server";

const ideaIdSchema = z.string().regex(/^idea-\d{3}$/);
const uuidSchema = z.string().uuid();
const structuralIdSchema = z.string().regex(/^[a-z0-9-]+$/);

export type WorkspaceActionResult<T = undefined> =
  | { ok: true; data?: T }
  | { ok: false; error: string; code?: "conflict" | "invalid" | "unavailable" };

function validIdeaId(value: unknown) {
  const result = ideaIdSchema.safeParse(value);
  return result.success && getIdeaById(result.data) ? result.data : null;
}

export async function setBookmarkAction(ideaIdValue: string, saved: boolean): Promise<WorkspaceActionResult> {
  const ideaId = validIdeaId(ideaIdValue);
  if (!ideaId || typeof saved !== "boolean") return { ok: false, error: "That idea is unavailable.", code: "invalid" };
  await requireVerifiedAccount("/app/explore");
  const supabase = await createClient();
  const result = saved
    ? await supabase.from("bookmarks").insert({ idea_id: ideaId })
    : await supabase.from("bookmarks").delete().eq("idea_id", ideaId);
  if (result.error && !(saved && result.error.code === "23505")) {
    return { ok: false, error: saved ? "We couldn’t save this idea. Try again." : "We couldn’t remove this idea. Try again." };
  }
  revalidatePath("/app", "layout");
  revalidatePath("/app/saved");
  return { ok: true };
}

export async function startProjectAction(ideaIdValue: string): Promise<WorkspaceActionResult> {
  const ideaId = validIdeaId(ideaIdValue);
  if (!ideaId) return { ok: false, error: "This idea does not have an available project plan.", code: "invalid" };
  const context = await requireVerifiedAccount(`/app/ideas/${getIdeaById(ideaId)?.slug ?? ""}`);
  const access = getIdeaAccessDecision(context, ideaId);
  if (access.status === "unavailable") return { ok: false, error: "We couldn’t verify access to this idea. Try again before starting a project.", code: "unavailable" };
  if (access.status !== "active") return { ok: false, error: "This idea is available as a safe preview, but your account cannot start its project.", code: "unavailable" };
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("start_member_project", { p_idea_id: ideaId });
  if (error || !data) return { ok: false, error: error?.code === "42501" ? "Your account no longer has access to start this idea." : "We couldn’t start this project. Please try again." };
  revalidatePath("/app/projects");
  redirect(`/app/projects/${data}`);
}

export async function setProjectPausedAction(projectIdValue: string, paused: boolean): Promise<WorkspaceActionResult> {
  const projectId = uuidSchema.safeParse(projectIdValue);
  if (!projectId.success || typeof paused !== "boolean") return { ok: false, error: "That project is unavailable.", code: "invalid" };
  await requireVerifiedAccount(`/app/projects/${projectId.data}`);
  const supabase = await createClient();
  const { error } = await supabase.rpc("set_member_project_paused", { p_project_id: projectId.data, p_paused: paused });
  if (error) return { ok: false, error: error.code === "22023" ? "Completed projects can’t be paused." : "We couldn’t update this project." };
  revalidatePath("/app/projects");
  revalidatePath(`/app/projects/${projectId.data}`);
  return { ok: true };
}

export async function setTaskCompletedAction(
  projectIdValue: string,
  stageIdValue: string,
  taskIdValue: string,
  completed: boolean,
): Promise<WorkspaceActionResult<{ completedAt: string | null }>> {
  const parsed = z.object({ projectId: uuidSchema, stageId: structuralIdSchema, taskId: structuralIdSchema, completed: z.boolean() }).safeParse({
    projectId: projectIdValue,
    stageId: stageIdValue,
    taskId: taskIdValue,
    completed,
  });
  if (!parsed.success) return { ok: false, error: "That task is unavailable.", code: "invalid" };
  await requireVerifiedAccount(`/app/projects/${parsed.data.projectId}`);
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("set_member_project_task_completed", {
    p_project_id: parsed.data.projectId,
    p_stage_id: parsed.data.stageId,
    p_task_id: parsed.data.taskId,
    p_completed: parsed.data.completed,
  });
  if (error) return { ok: false, error: error.code === "55000" ? "Resume this project before changing progress." : "We couldn’t update that task." };
  revalidatePath("/app/projects");
  revalidatePath(`/app/projects/${parsed.data.projectId}`);
  return { ok: true, data: { completedAt: data } };
}

export async function saveStageNoteAction(
  projectIdValue: string,
  stageIdValue: string,
  contentValue: string,
  revisionValue: number,
): Promise<WorkspaceActionResult<{ content: string; revision: number; updatedAt: string }>> {
  const parsed = z.object({
    projectId: uuidSchema,
    stageId: structuralIdSchema,
    content: z.string().max(4000),
    revision: z.number().int().nonnegative(),
  }).safeParse({ projectId: projectIdValue, stageId: stageIdValue, content: contentValue, revision: revisionValue });
  if (!parsed.success) return { ok: false, error: "Notes must be plain text and no longer than 4,000 characters.", code: "invalid" };
  await requireVerifiedAccount(`/app/projects/${parsed.data.projectId}`);
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("save_member_project_stage_note", {
    p_project_id: parsed.data.projectId,
    p_stage_id: parsed.data.stageId,
    p_content: parsed.data.content,
    p_expected_revision: parsed.data.revision,
  });
  if (error) {
    if (error.code === "40001") return { ok: false, error: "This note changed in another session. Your draft is still here—review the latest saved version before trying again.", code: "conflict" };
    return { ok: false, error: error.code === "55000" ? "Resume this project before editing notes." : "We couldn’t save this note." };
  }
  const saved = data?.[0];
  if (!saved) return { ok: false, error: "We couldn’t confirm the saved note." };
  revalidatePath("/app/projects");
  revalidatePath(`/app/projects/${parsed.data.projectId}`);
  return { ok: true, data: { content: saved.saved_content, revision: saved.saved_revision, updatedAt: saved.saved_updated_at } };
}

export async function loadStageNoteAction(
  projectIdValue: string,
  stageIdValue: string,
): Promise<WorkspaceActionResult<{ content: string; revision: number; updatedAt: string }>> {
  const parsed = z.object({ projectId: uuidSchema, stageId: structuralIdSchema }).safeParse({ projectId: projectIdValue, stageId: stageIdValue });
  if (!parsed.success) return { ok: false, error: "That stage note is unavailable.", code: "invalid" };
  await requireVerifiedAccount(`/app/projects/${parsed.data.projectId}`);
  const supabase = await createClient();
  const { data, error } = await supabase.from("project_stage_notes").select("content, revision, updated_at").eq("project_id", parsed.data.projectId).eq("stage_id", parsed.data.stageId).maybeSingle();
  if (error || !data) return { ok: false, error: "We couldn’t load the latest saved note.", code: "unavailable" };
  return { ok: true, data: { content: data.content, revision: data.revision, updatedAt: data.updated_at } };
}
