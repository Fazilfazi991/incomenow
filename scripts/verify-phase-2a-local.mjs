import assert from "node:assert/strict";
import { createServerClient } from "@supabase/ssr";

const required = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  "APP_ORIGIN",
  "PHASE2A_EMAIL_A",
  "PHASE2A_EMAIL_B",
  "PHASE2A_PASSWORD",
  "PHASE2A_EXPECTED_ACCESS",
];

for (const name of required) {
  assert.ok(process.env[name], `Missing ${name}`);
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const appOrigin = process.env.APP_ORIGIN;
const expectedAccess = process.env.PHASE2A_EXPECTED_ACCESS;

function createCookieClient() {
  const jar = new Map();
  const client = createServerClient(supabaseUrl, publishableKey, {
    cookies: {
      getAll() {
        return [...jar].map(([name, value]) => ({ name, value }));
      },
      setAll(cookies) {
        for (const { name, value } of cookies) {
          if (value) jar.set(name, value);
          else jar.delete(name);
        }
      },
    },
  });

  return {
    client,
    cookieHeader() {
      return [...jar].map(([name, value]) => `${name}=${value}`).join("; ");
    },
  };
}

async function signIn(email, password) {
  const context = createCookieClient();
  const { data, error } = await context.client.auth.signInWithPassword({ email, password });
  assert.ifError(error);
  assert.ok(data.user);
  assert.ok(data.session);
  return { ...context, user: data.user, session: data.session };
}

async function appRequest(path, context) {
  return fetch(`${appOrigin}${path}`, {
    headers: context ? { cookie: context.cookieHeader() } : undefined,
    redirect: "manual",
  });
}

const invalid = createCookieClient();
const invalidResult = await invalid.client.auth.signInWithPassword({
  email: process.env.PHASE2A_EMAIL_A,
  password: `${process.env.PHASE2A_PASSWORD}-invalid`,
});
assert.ok(invalidResult.error, "Invalid credentials must be rejected");

const [accountA, accountB] = await Promise.all([
  signIn(process.env.PHASE2A_EMAIL_A, process.env.PHASE2A_PASSWORD),
  signIn(process.env.PHASE2A_EMAIL_B, process.env.PHASE2A_PASSWORD),
]);
assert.notEqual(accountA.user.id, accountB.user.id);

const verifiedA = await accountA.client.auth.getUser();
const verifiedB = await accountB.client.auth.getUser();
assert.equal(verifiedA.data.user?.id, accountA.user.id);
assert.equal(verifiedB.data.user?.id, accountB.user.id);

const refreshResult = await accountA.client.auth.refreshSession();
assert.ifError(refreshResult.error);
assert.ok(refreshResult.data.session, "The real Auth service must refresh the session");

const ownProfile = await accountA.client.from("profiles").select("user_id, display_name");
assert.ifError(ownProfile.error);
assert.deepEqual(ownProfile.data?.map(({ user_id }) => user_id), [accountA.user.id]);

const otherProfile = await accountA.client
  .from("profiles")
  .select("user_id")
  .eq("user_id", accountB.user.id);
assert.ifError(otherProfile.error);
assert.deepEqual(otherProfile.data, []);

const ownUpdate = await accountA.client
  .from("profiles")
  .update({ display_name: "Phase 2A User A" })
  .eq("user_id", accountA.user.id)
  .select("user_id, display_name");
assert.ifError(ownUpdate.error);
assert.equal(ownUpdate.data?.[0]?.user_id, accountA.user.id);

const crossUpdate = await accountA.client
  .from("profiles")
  .update({ display_name: "Cross-user write must not land" })
  .eq("user_id", accountB.user.id)
  .select("user_id");
assert.ifError(crossUpdate.error);
assert.deepEqual(crossUpdate.data, []);

const ownershipUpdate = await accountA.client
  .from("profiles")
  .update({ user_id: accountB.user.id })
  .eq("user_id", accountA.user.id);
assert.equal(ownershipUpdate.error?.code, "42501");

const selfGrant = await accountA.client.from("membership_entitlements").insert({
  user_id: accountA.user.id,
  enabled: true,
  source: "manual",
});
assert.equal(selfGrant.error?.code, "42501");

const otherGrantUpdate = await accountA.client
  .from("membership_entitlements")
  .update({ enabled: true })
  .eq("user_id", accountB.user.id);
assert.equal(otherGrantUpdate.error?.code, "42501");

const anonymous = createCookieClient();
const anonymousProfiles = await anonymous.client.from("profiles").select("user_id");
assert.equal(anonymousProfiles.error?.code, "42501");

const anonymousApi = await appRequest("/api/member/access");
assert.equal(anonymousApi.status, 401);
assert.match(anonymousApi.headers.get("cache-control") ?? "", /private/);
assert.match(anonymousApi.headers.get("cache-control") ?? "", /no-store/);

const accessApi = await appRequest("/api/member/access", accountA);
const expectedStatus = expectedAccess === "active" ? 200 : expectedAccess === "unavailable" ? 503 : 403;
assert.equal(accessApi.status, expectedStatus);
assert.deepEqual(await accessApi.json(), { access: expectedAccess });
assert.match(accessApi.headers.get("cache-control") ?? "", /private/);
assert.match(accessApi.headers.get("cache-control") ?? "", /no-store/);

const accountBAccessApi = await appRequest("/api/member/access", accountB);
assert.equal(accountBAccessApi.status, expectedAccess === "unavailable" ? 503 : 403);
assert.deepEqual(await accountBAccessApi.json(), {
  access: expectedAccess === "unavailable" ? "unavailable" : "inactive",
});

const protectedPage = await appRequest("/app/explore", accountA);
if (expectedAccess === "active") {
  assert.equal(protectedPage.status, 200);
  const html = await protectedPage.text();
  assert.match(html, /Explore ideas/);

  for (const [path, marker] of [
    ["/app/ideas/pergola-quotation-follow-up-crm", "Pergola Quotation"],
    ["/app/ideas/ai-accounting-finance-operations", "AI Accounting & Finance Operations Kit"],
    ["/app/ideas/local-service-lead-generation", "Local-Service Lead Website"],
  ]) {
    const detail = await appRequest(path, accountA);
    assert.equal(detail.status, 200);
    assert.match(await detail.text(), new RegExp(marker));
  }
} else {
  assert.equal(protectedPage.status, 307);
  assert.equal(protectedPage.headers.get("location"), "/account/access");
  assert.doesNotMatch(await protectedPage.text(), /Pergola Quotation/);
}

const accountBProtectedPage = await appRequest("/app/explore", accountB);
assert.equal(accountBProtectedPage.status, 307);
assert.equal(accountBProtectedPage.headers.get("location"), "/account/access");

await accountA.client.auth.signOut();
const afterSignOut = await appRequest("/api/member/access", accountA);
assert.equal(afterSignOut.status, 401);

console.log(
  JSON.stringify({
    result: "pass",
    expectedAccess,
    checks: [
      "invalid-login",
      "two-user-login",
      "verified-user",
      "session-refresh",
      "own-profile-read-update",
      "cross-user-profile-isolation",
      "ownership-change-denied",
      "entitlement-mutation-denied",
      "anonymous-data-denied",
      "access-api-cache-policy",
      "protected-content-boundary",
      "sign-out-denial",
    ],
  }),
);
