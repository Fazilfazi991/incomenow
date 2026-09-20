import assert from "node:assert/strict";
import { createServerClient } from "@supabase/ssr";

for (const name of ["API_URL", "ANON_KEY", "APP_ORIGIN", "PHASE2B_EMAIL_A", "PHASE2B_EMAIL_B", "PHASE2B_PASSWORD"]) assert.ok(process.env[name], `Missing ${name}`);

function createCookieClient() {
  const jar = new Map();
  const client = createServerClient(process.env.API_URL, process.env.ANON_KEY, {
    cookies: {
      getAll: () => [...jar].map(([name, value]) => ({ name, value })),
      setAll: (cookies) => cookies.forEach(({ name, value }) => value ? jar.set(name, value) : jar.delete(name)),
    },
  });
  return { client, cookieHeader: () => [...jar].map(([name, value]) => `${name}=${value}`).join("; ") };
}

async function signIn(email) {
  const context = createCookieClient();
  const { data, error } = await context.client.auth.signInWithPassword({ email, password: process.env.PHASE2B_PASSWORD });
  assert.ifError(error);
  assert.ok(data.user && data.session);
  return { ...context, user: data.user };
}

async function appRequest(path, account) {
  return fetch(`${process.env.APP_ORIGIN}${path}`, { headers: { cookie: account.cookieHeader() }, redirect: "manual" });
}

const [a, b] = await Promise.all([signIn(process.env.PHASE2B_EMAIL_A), signIn(process.env.PHASE2B_EMAIL_B)]);
assert.notEqual(a.user.id, b.user.id);

const save = await a.client.from("bookmarks").insert({ idea_id: "idea-001" });
assert.ifError(save.error);
const duplicate = await a.client.from("bookmarks").insert({ idea_id: "idea-001" });
assert.equal(duplicate.error?.code, "23505");
const aBookmarks = await a.client.from("bookmarks").select("idea_id, saved_at");
assert.ifError(aBookmarks.error);
assert.deepEqual(aBookmarks.data?.map(({ idea_id }) => idea_id), ["idea-001"]);
const bBookmarks = await b.client.from("bookmarks").select("idea_id");
assert.ifError(bBookmarks.error);
assert.deepEqual(bBookmarks.data, []);

const firstStart = await a.client.rpc("start_member_project", { p_idea_id: "idea-001" });
assert.ifError(firstStart.error);
assert.ok(firstStart.data);
const secondStart = await a.client.rpc("start_member_project", { p_idea_id: "idea-001" });
assert.ifError(secondStart.error);
assert.equal(secondStart.data, firstStart.data);
const projectId = firstStart.data;

const tasks = await a.client.from("project_tasks").select("stage_id, task_id, completed_at").eq("project_id", projectId);
assert.ifError(tasks.error);
assert.equal(tasks.data?.length, 14);
const bCannotReadA = await b.client.from("projects").select("id").eq("id", projectId);
assert.ifError(bCannotReadA.error);
assert.deepEqual(bCannotReadA.data, []);

const taskComplete = await a.client.rpc("set_member_project_task_completed", { p_project_id: projectId, p_stage_id: "crm-validate", p_task_id: "region-segment", p_completed: true });
assert.ifError(taskComplete.error);
assert.ok(taskComplete.data);
const note = await a.client.rpc("save_member_project_stage_note", { p_project_id: projectId, p_stage_id: "crm-validate", p_content: "Phase 2B local verification note", p_expected_revision: 0 });
assert.ifError(note.error);
assert.equal(note.data?.[0]?.saved_revision, 1);
const secondStageNote = await a.client.rpc("save_member_project_stage_note", { p_project_id: projectId, p_stage_id: "crm-adapt", p_content: "Second stage verification note", p_expected_revision: 0 });
assert.ifError(secondStageNote.error);
assert.equal(secondStageNote.data?.[0]?.saved_revision, 1);
const staleNote = await a.client.rpc("save_member_project_stage_note", { p_project_id: projectId, p_stage_id: "crm-validate", p_content: "Stale write must not land", p_expected_revision: 0 });
assert.equal(staleNote.error?.code, "40001");
const savedNotes = await a.client.from("project_stage_notes").select("stage_id, content").eq("project_id", projectId).order("stage_id");
assert.ifError(savedNotes.error);
assert.equal(savedNotes.data?.length, 6);
assert.deepEqual(savedNotes.data?.filter(({ content }) => content), [
  { stage_id: "crm-adapt", content: "Second stage verification note" },
  { stage_id: "crm-validate", content: "Phase 2B local verification note" },
]);

const paused = await a.client.rpc("set_member_project_paused", { p_project_id: projectId, p_paused: true });
assert.ifError(paused.error);
assert.ok(paused.data);
const blockedTask = await a.client.rpc("set_member_project_task_completed", { p_project_id: projectId, p_stage_id: "crm-validate", p_task_id: "operator-interviews", p_completed: true });
assert.equal(blockedTask.error?.code, "55000");
const resumed = await a.client.rpc("set_member_project_paused", { p_project_id: projectId, p_paused: false });
assert.ifError(resumed.error);
assert.equal(resumed.data, null);

const directProjectUpdate = await a.client.from("projects").update({ paused_at: new Date().toISOString() }).eq("id", projectId);
assert.equal(directProjectUpdate.error?.code, "42501");

const bCannotMutateA = await b.client.rpc("set_member_project_task_completed", { p_project_id: projectId, p_stage_id: "crm-validate", p_task_id: "operator-interviews", p_completed: true });
assert.ok(bCannotMutateA.error);
const bProjectResponse = await appRequest(`/app/projects/${projectId}`, b);
assert.equal(bProjectResponse.status, 404);

for (const [path, marker] of [["/app/saved", "Saved ideas"], ["/app/projects", "My projects"], [`/app/projects/${projectId}`, "Project workspace"]]) {
  const response = await appRequest(path, a);
  assert.equal(response.status, 200, `${path} should render`);
  const body = await response.text();
  assert.match(body, new RegExp(marker));
  if (path === "/app/projects") {
    const renderedText = body.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
    assert.match(renderedText, /0 of 6 stages complete/);
    assert.match(renderedText, /Next action:/);
  }
}

for (const task of tasks.data ?? []) {
  const completion = await a.client.rpc("set_member_project_task_completed", { p_project_id: projectId, p_stage_id: task.stage_id, p_task_id: task.task_id, p_completed: true });
  assert.ifError(completion.error);
}
const completedTasks = await a.client.from("project_tasks").select("completed_at").eq("project_id", projectId);
assert.ifError(completedTasks.error);
assert.equal(completedTasks.data?.length, 14);
assert.ok(completedTasks.data?.every((task) => task.completed_at));
const reopen = await a.client.rpc("set_member_project_task_completed", { p_project_id: projectId, p_stage_id: "crm-validate", p_task_id: "operator-interviews", p_completed: false });
assert.ifError(reopen.error);
assert.equal(reopen.data, null);
const reopenedTask = await a.client.from("project_tasks").select("completed_at").eq("project_id", projectId).eq("task_id", "operator-interviews").single();
assert.ifError(reopenedTask.error);
assert.equal(reopenedTask.data.completed_at, null);

const freshA = await signIn(process.env.PHASE2B_EMAIL_A);
const persisted = await freshA.client.from("bookmarks").select("idea_id, saved_at");
assert.ifError(persisted.error);
assert.deepEqual(persisted.data?.map(({ idea_id }) => idea_id), ["idea-001"]);
const persistedProject = await freshA.client.from("projects").select("id, plan_version, paused_at").eq("id", projectId).single();
assert.ifError(persistedProject.error);
assert.equal(persistedProject.data.plan_version, "1");
assert.equal(persistedProject.data.paused_at, null);
const persistedNotes = await freshA.client.from("project_stage_notes").select("stage_id, content").eq("project_id", projectId);
assert.ifError(persistedNotes.error);
assert.equal(persistedNotes.data?.length, 6);
assert.equal(persistedNotes.data?.filter(({ content }) => content).length, 2);

console.log(JSON.stringify({ result: "pass", checks: ["two-account-isolation", "cross-user-route-and-mutation-denial", "bookmark-persistence", "idempotent-project-start", "atomic-child-plan", "stage-progress-render", "full-checklist-completion-and-reopen", "two-stage-note-persistence", "revision-conflict", "pause-edit-lock", "direct-write-denial", "protected-route-render", "fresh-session-persistence"], projectId }));
