import assert from "node:assert/strict";
import { createServerClient } from "@supabase/ssr";

for (const name of ["API_URL", "ANON_KEY", "APP_ORIGIN", "PHASE3B_EMAIL_INACTIVE", "PHASE3B_EMAIL_ACTIVE", "PHASE3B_PASSWORD"]) assert.ok(process.env[name], `Missing ${name}`);

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
  const account = createCookieClient();
  const { data, error } = await account.client.auth.signInWithPassword({ email, password: process.env.PHASE3B_PASSWORD });
  assert.ifError(error);
  assert.ok(data.user && data.session);
  return { ...account, user: data.user };
}

async function appRequest(path, account) {
  return fetch(`${process.env.APP_ORIGIN}${path}`, { headers: { cookie: account.cookieHeader() }, redirect: "manual" });
}

const [inactive, active] = await Promise.all([
  signIn(process.env.PHASE3B_EMAIL_INACTIVE),
  signIn(process.env.PHASE3B_EMAIL_ACTIVE),
]);
assert.notEqual(inactive.user.id, active.user.id);

for (const account of [inactive, active]) {
  const settings = await appRequest("/account/settings", account);
  assert.equal(settings.status, 200);
  assert.match(await settings.text(), /Account settings/);
  const onboarding = await appRequest("/account/getting-started", account);
  assert.equal(onboarding.status, 200);
  assert.match(await onboarding.text(), /What would you like to explore/);
}

const inactiveApp = await appRequest("/app/explore", inactive);
assert.equal(inactiveApp.status, 200);
const inactiveCatalogue = await inactiveApp.text();
assert.match(inactiveCatalogue, /Explore ideas/);
assert.doesNotMatch(inactiveCatalogue, /crm-validate|region-segment|crm-source/);
const activeApp = await appRequest("/app/explore", active);
assert.equal(activeApp.status, 200);
assert.match(await activeApp.text(), /Explore ideas/);

const inactiveSave = await inactive.client.rpc("save_account_preferences", {
  p_interest_categories: ["automation", "custom-crm"],
  p_experience_level: "adapting-tools",
  p_preferred_approach: "client-service",
  p_expected_revision: 0,
  p_mark_completed: true,
});
assert.ifError(inactiveSave.error);
assert.equal(inactiveSave.data?.[0]?.saved_revision, 1);

const activeSkip = await active.client.rpc("skip_account_onboarding", { p_expected_revision: 0 });
assert.ifError(activeSkip.error);
assert.equal(activeSkip.data?.[0]?.saved_onboarding_state, "skipped");

const inactiveOwn = await inactive.client.from("account_preferences").select("user_id, interest_categories, onboarding_state, revision").single();
assert.ifError(inactiveOwn.error);
assert.equal(inactiveOwn.data.user_id, inactive.user.id);
assert.deepEqual(inactiveOwn.data.interest_categories, ["automation", "custom-crm"]);
const inactiveCannotReadActive = await inactive.client.from("account_preferences").select("user_id").eq("user_id", active.user.id);
assert.ifError(inactiveCannotReadActive.error);
assert.deepEqual(inactiveCannotReadActive.data, []);

const stale = await inactive.client.rpc("save_account_preferences", {
  p_interest_categories: [], p_experience_level: null, p_preferred_approach: null, p_expected_revision: 0, p_mark_completed: false,
});
assert.equal(stale.error?.code, "40001");
const directWrite = await inactive.client.from("account_preferences").update({ onboarding_state: "skipped" }).eq("user_id", inactive.user.id);
assert.equal(directWrite.error?.code, "42501");
const selfGrant = await inactive.client.from("membership_entitlements").insert({ user_id: inactive.user.id, enabled: true, source: "manual" });
assert.equal(selfGrant.error?.code, "42501");

const profileUpdate = await inactive.client.from("profiles").update({ display_name: "Phase 3B Renamed" }).eq("user_id", inactive.user.id).select("display_name").single();
assert.ifError(profileUpdate.error);
assert.equal(profileUpdate.data.display_name, "Phase 3B Renamed");
const stillSaved = await inactive.client.from("account_preferences").select("revision, interest_categories").single();
assert.ifError(stillSaved.error);
assert.equal(stillSaved.data.revision, 1);

const freshInactive = await signIn(process.env.PHASE3B_EMAIL_INACTIVE);
const persistedProfile = await freshInactive.client.from("profiles").select("display_name").single();
assert.ifError(persistedProfile.error);
assert.equal(persistedProfile.data.display_name, "Phase 3B Renamed");
const persistedPreferences = await freshInactive.client.from("account_preferences").select("interest_categories, onboarding_state, revision").single();
assert.ifError(persistedPreferences.error);
assert.deepEqual(persistedPreferences.data, { interest_categories: ["automation", "custom-crm"], onboarding_state: "completed", revision: 1 });

console.log(JSON.stringify({
  result: "pass",
  checks: [
    "inactive-and-active-account-routes",
    "registered-catalogue-preview-and-full-content-boundary",
    "optional-empty-skip-and-selected-save",
    "owner-read-isolation",
    "stale-write-conflict",
    "direct-write-denial",
    "self-entitlement-denial",
    "independent-profile-update",
    "fresh-session-persistence",
  ],
}));
