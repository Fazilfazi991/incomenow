import assert from "node:assert/strict";
import { createClient } from "@supabase/supabase-js";

const [mode] = process.argv.slice(2);
assert.ok(["create", "delete"].includes(mode), "Usage: node manage-phase-3b-test-users.mjs <create|delete>");
for (const name of ["API_URL", "SERVICE_ROLE_KEY", "PHASE3B_EMAIL_INACTIVE", "PHASE3B_EMAIL_ACTIVE"]) assert.ok(process.env[name], `Missing ${name}`);
if (mode === "create") assert.ok(process.env.PHASE3B_PASSWORD, "Missing PHASE3B_PASSWORD");

const admin = createClient(process.env.API_URL, process.env.SERVICE_ROLE_KEY, { auth: { autoRefreshToken: false, persistSession: false } });
const emails = [process.env.PHASE3B_EMAIL_INACTIVE, process.env.PHASE3B_EMAIL_ACTIVE];

async function targets() {
  const { data, error } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  assert.ifError(error);
  return data.users.filter((user) => emails.includes(user.email));
}

async function removeTargets() {
  for (const user of await targets()) {
    const { error } = await admin.auth.admin.deleteUser(user.id);
    assert.ifError(error);
  }
}

if (mode === "delete") {
  await removeTargets();
  console.log("Removed Phase 3B disposable accounts and their account-owned data.");
  process.exit(0);
}

await removeTargets();
for (const [index, email] of emails.entries()) {
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password: process.env.PHASE3B_PASSWORD,
    email_confirm: true,
    user_metadata: { display_name: index === 0 ? "Phase 3B Inactive" : "Phase 3B Active" },
  });
  assert.ifError(error);
  assert.ok(data.user);
  if (index === 1) {
    const { error: entitlementError } = await admin.from("membership_entitlements").insert({
      user_id: data.user.id,
      enabled: true,
      source: "manual",
      source_reference: "phase-3b-local-verification",
    });
    assert.ifError(entitlementError);
  }
}
console.log("Created one inactive and one active Phase 3B disposable account.");
