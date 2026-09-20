import assert from "node:assert/strict";
import { createClient } from "@supabase/supabase-js";

const [mode] = process.argv.slice(2);
assert.ok(["create", "delete"].includes(mode), "Usage: node manage-phase-2b-test-users.mjs <create|delete>");
for (const name of ["API_URL", "SERVICE_ROLE_KEY", "PHASE2B_EMAIL_A", "PHASE2B_EMAIL_B"]) assert.ok(process.env[name], `Missing ${name}`);
if (mode === "create") assert.ok(process.env.PHASE2B_PASSWORD, "Missing PHASE2B_PASSWORD");

const admin = createClient(process.env.API_URL, process.env.SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});
const targetEmails = [process.env.PHASE2B_EMAIL_A, process.env.PHASE2B_EMAIL_B];

async function findTargets() {
  const { data, error } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  assert.ifError(error);
  return data.users.filter((user) => targetEmails.includes(user.email));
}

async function removeTargets() {
  for (const user of await findTargets()) {
    const { error } = await admin.auth.admin.deleteUser(user.id);
    assert.ifError(error);
  }
}

if (mode === "delete") {
  await removeTargets();
  console.log("Removed Phase 2B disposable accounts and cascade-owned workspace data.");
  process.exit(0);
}

await removeTargets();
for (const [index, email] of targetEmails.entries()) {
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password: process.env.PHASE2B_PASSWORD,
    email_confirm: true,
    user_metadata: { display_name: `Phase 2B User ${index === 0 ? "A" : "B"}` },
  });
  assert.ifError(error);
  assert.ok(data.user);
  const { error: entitlementError } = await admin.from("membership_entitlements").insert({
    user_id: data.user.id,
    enabled: true,
    source: "manual",
    source_reference: "phase-2b-local-verification",
  });
  assert.ifError(entitlementError);
}
console.log("Created two active Phase 2B disposable accounts.");
process.exit(0);
