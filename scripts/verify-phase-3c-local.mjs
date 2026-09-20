import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";

for (const name of ["API_URL", "ANON_KEY", "SERVICE_ROLE_KEY", "APP_ORIGIN"]) {
  assert.ok(process.env[name], `Missing ${name}`);
}

const service = createClient(process.env.API_URL, process.env.SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const password = `Phase3C-${randomUUID()}-Aa1!`;
const suffix = randomUUID().slice(0, 8);
const createdUserIds = [];

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

async function createAccount(label) {
  const email = `phase3c-${label}-${suffix}@example.test`;
  const { data, error } = await service.auth.admin.createUser({ email, password, email_confirm: true });
  assert.ifError(error);
  assert.ok(data.user);
  createdUserIds.push(data.user.id);
  return { email, user: data.user };
}

async function signIn(email) {
  const account = createCookieClient();
  const { data, error } = await account.client.auth.signInWithPassword({ email, password });
  assert.ifError(error);
  assert.ok(data.user && data.session);
  return { ...account, user: data.user };
}

async function appRequest(path, account) {
  return fetch(`${process.env.APP_ORIGIN}${path}`, {
    headers: { cookie: account.cookieHeader() },
    redirect: "manual",
  });
}

try {
  const [freeSeed, starterSeed, fullSeed, expiredSeed, otherSeed] = await Promise.all([
    createAccount("free"),
    createAccount("starter"),
    createAccount("full"),
    createAccount("expired"),
    createAccount("other"),
  ]);

  const starterGrant = await service.from("idea_access_grants").insert({
    user_id: starterSeed.user.id,
    offer_code: "starter-pergola-v1",
    idea_id: "idea-001",
    enabled: true,
    source: "local_test",
    source_reference: `phase3c-${suffix}-starter`,
  });
  assert.ifError(starterGrant.error);

  const expiredGrant = await service.from("idea_access_grants").insert({
    user_id: expiredSeed.user.id,
    offer_code: "starter-pergola-v1",
    idea_id: "idea-001",
    enabled: true,
    starts_at: new Date(Date.now() - 172_800_000).toISOString(),
    expires_at: new Date(Date.now() - 86_400_000).toISOString(),
    source: "local_test",
    source_reference: `phase3c-${suffix}-expired`,
  });
  assert.ifError(expiredGrant.error);

  const fullGrant = await service.from("membership_entitlements").insert({
    user_id: fullSeed.user.id,
    enabled: true,
    source: "complimentary",
    source_reference: `phase3c-${suffix}-full`,
  });
  assert.ifError(fullGrant.error);

  const [free, starter, full, expired, other] = await Promise.all([
    signIn(freeSeed.email),
    signIn(starterSeed.email),
    signIn(fullSeed.email),
    signIn(expiredSeed.email),
    signIn(otherSeed.email),
  ]);

  for (const account of [free, starter, full, expired]) {
    const response = await appRequest("/app/explore", account);
    assert.equal(response.status, 200, "every verified account can browse safe catalogue previews");
  }

  const freeExplore = await appRequest("/app/explore", free);
  const freeExploreBody = await freeExplore.text();
  assert.match(freeExploreBody, /Available with the US\$1 starter/);
  assert.doesNotMatch(freeExploreBody, /crm-validate|region-segment|Suggested contractor workflow to investigate/);

  const freePergola = await appRequest("/app/ideas/pergola-quotation-follow-up-crm", free);
  assert.equal(freePergola.status, 200);
  const freePergolaBody = await freePergola.text();
  assert.match(freePergolaBody, /Published catalogue preview/);
  assert.doesNotMatch(freePergolaBody, /crm-validate|region-segment|Starter readiness and operating responsibilities|crm-source/);

  const freeBookmark = await free.client.from("bookmarks").insert({ idea_id: "idea-003" });
  assert.ifError(freeBookmark.error);
  const freeStart = await free.client.rpc("start_member_project", { p_idea_id: "idea-001" });
  assert.equal(freeStart.error?.code, "42501");
  const forgedGrant = await free.client.from("idea_access_grants").insert({
    user_id: free.user.id, offer_code: "starter-pergola-v1", idea_id: "idea-001", enabled: true, source: "manual",
  });
  assert.equal(forgedGrant.error?.code, "42501");

  const starterPergola = await appRequest("/app/ideas/pergola-quotation-follow-up-crm", starter);
  assert.equal(starterPergola.status, 200);
  assert.match(await starterPergola.text(), /Suggested contractor workflow to investigate/);
  const starterOther = await appRequest("/app/ideas/quotation-follow-up-automation", starter);
  assert.equal(starterOther.status, 200);
  assert.doesNotMatch(await starterOther.text(), /flow-source|Configure, test, and hand over/);

  const concurrentStarts = await Promise.all([
    starter.client.rpc("start_member_project", { p_idea_id: "idea-001" }),
    starter.client.rpc("start_member_project", { p_idea_id: "idea-001" }),
  ]);
  concurrentStarts.forEach((result) => assert.ifError(result.error));
  assert.equal(concurrentStarts[0].data, concurrentStarts[1].data);
  const starterProjectId = concurrentStarts[0].data;
  assert.ok(starterProjectId);
  const starterProjects = await service.from("projects").select("id").eq("user_id", starter.user.id).eq("idea_id", "idea-001");
  assert.ifError(starterProjects.error);
  assert.equal(starterProjects.data.length, 1);

  const deniedOtherStart = await starter.client.rpc("start_member_project", { p_idea_id: "idea-003" });
  assert.equal(deniedOtherStart.error?.code, "42501");
  const completed = await starter.client.rpc("set_member_project_task_completed", {
    p_project_id: starterProjectId, p_stage_id: "crm-validate", p_task_id: "region-segment", p_completed: true,
  });
  assert.ifError(completed.error);
  const note = await starter.client.rpc("save_member_project_stage_note", {
    p_project_id: starterProjectId, p_stage_id: "crm-validate", p_content: "Phase 3C disposable starter note", p_expected_revision: 0,
  });
  assert.ifError(note.error);
  assert.equal(note.data?.[0]?.saved_revision, 1);
  const paused = await starter.client.rpc("set_member_project_paused", { p_project_id: starterProjectId, p_paused: true });
  assert.ifError(paused.error);
  const pausedWrite = await starter.client.rpc("set_member_project_task_completed", {
    p_project_id: starterProjectId, p_stage_id: "crm-validate", p_task_id: "region-interviews", p_completed: true,
  });
  assert.equal(pausedWrite.error?.code, "55000");
  const resumed = await starter.client.rpc("set_member_project_paused", { p_project_id: starterProjectId, p_paused: false });
  assert.ifError(resumed.error);

  const otherRead = await other.client.from("projects").select("id").eq("id", starterProjectId);
  assert.ifError(otherRead.error);
  assert.deepEqual(otherRead.data, []);
  const otherWrite = await other.client.rpc("set_member_project_paused", { p_project_id: starterProjectId, p_paused: true });
  assert.equal(otherWrite.error?.code, "P0002");

  const starterUpgrade = await service.from("membership_entitlements").insert({
    user_id: starter.user.id,
    enabled: true,
    source: "complimentary",
    source_reference: `phase3c-${suffix}-upgrade`,
  });
  assert.ifError(starterUpgrade.error);
  const existingAfterUpgrade = await starter.client.rpc("start_member_project", { p_idea_id: "idea-001" });
  assert.ifError(existingAfterUpgrade.error);
  assert.equal(existingAfterUpgrade.data, starterProjectId);
  const fullOnlyProject = await starter.client.rpc("start_member_project", { p_idea_id: "idea-003" });
  assert.ifError(fullOnlyProject.error);
  assert.ok(fullOnlyProject.data);

  const disableFull = await service.from("membership_entitlements").update({ enabled: false }).eq("user_id", starter.user.id);
  assert.ifError(disableFull.error);
  const afterDowngrade = await starter.client.from("projects").select("id, idea_id").order("idea_id");
  assert.ifError(afterDowngrade.error);
  assert.deepEqual(afterDowngrade.data, [{ id: starterProjectId, idea_id: "idea-001" }]);
  const persistedNote = await starter.client.from("project_stage_notes").select("content").eq("project_id", starterProjectId).eq("stage_id", "crm-validate").single();
  assert.ifError(persistedNote.error);
  assert.equal(persistedNote.data.content, "Phase 3C disposable starter note");

  const expiredStart = await expired.client.rpc("start_member_project", { p_idea_id: "idea-001" });
  assert.equal(expiredStart.error?.code, "42501");
  const revoke = await service.from("idea_access_grants").update({ revoked_at: new Date().toISOString() }).eq("user_id", starter.user.id);
  assert.ifError(revoke.error);
  const revokedProjects = await starter.client.from("projects").select("id");
  assert.ifError(revokedProjects.error);
  assert.deepEqual(revokedProjects.data, []);

  const fullExplore = await appRequest("/app/explore", full);
  assert.equal(fullExplore.status, 200);
  assert.match(await fullExplore.text(), /Included with full membership/);

  const onboarding = await appRequest("/account/getting-started?next=%2Fapp%2Fideas%2Fpergola-quotation-follow-up-crm", starter);
  assert.equal(onboarding.status, 200);
  assert.match(await onboarding.text(), /Skip for now/);

  console.log(JSON.stringify({
    result: "pass",
    checks: [
      "registered-preview-browsing-and-bookmarks",
      "locked-payload-minimisation",
      "starter-pergola-only",
      "concurrent-idempotent-project-start",
      "starter-task-note-and-pause-persistence",
      "cross-user-denial",
      "starter-to-full-project-reuse",
      "full-removal-preserves-independent-starter-project",
      "expired-and-revoked-grants",
      "optional-onboarding-deep-link",
    ],
  }));
} finally {
  for (const userId of createdUserIds) {
    const { error } = await service.auth.admin.deleteUser(userId);
    if (error) console.error(`Cleanup failed for disposable user ${userId}: ${error.message}`);
  }
}
