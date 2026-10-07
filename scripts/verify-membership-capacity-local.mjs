// Disposable, network-isolated PostgreSQL test. Never connects to hosted/local
// Supabase projects and never reads application credentials.
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { readFile } from "node:fs/promises";

const exec = promisify(execFile);
const container = `incomenow-capacity-qa-${process.pid}`;
const migration = "supabase/migrations/20261007102952_full_membership_capacity_foundation.sql";
let created = false;
async function docker(args) { return exec("docker", args, { maxBuffer: 1024 * 1024 }); }
function sql(query) {
  return new Promise((resolve, reject) => {
    const child = execFile("docker", ["exec", "-i", container, "psql", "-U", "postgres", "-d", "postgres", "-v", "ON_ERROR_STOP=1", "-At"], { maxBuffer: 1024 * 1024 }, (error, stdout, stderr) => error ? reject(Object.assign(error, { stdout, stderr })) : resolve(stdout.trim()));
    child.stdin.end(query);
  });
}
try {
  await docker(["run", "--detach", "--name", container, "--label", "incomenow.capacity-test=true", "--network", "none", "--env", "POSTGRES_PASSWORD=disposable-test-only", "postgres:17.11"]);
  created = true;
  let ready = false;
  for (let attempt = 0; attempt < 30; attempt++) {
    try { await docker(["exec", container, "pg_isready", "-U", "postgres"]); ready = true; break; } catch { await new Promise(resolve => setTimeout(resolve, 200)); }
  }
  if (!ready) throw new Error("Disposable test database did not start");
  await sql(`create role anon; create role authenticated; create role service_role bypassrls;
    create schema auth; create table auth.users(id uuid primary key, raw_user_meta_data jsonb default '{}');
    create function auth.uid() returns uuid language sql as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
    grant usage on schema auth to authenticated;
    grant execute on function auth.uid() to authenticated;`);
  await sql(await readFile(new URL("../supabase/migrations/20260920112114_phase_2a_auth_membership.sql", import.meta.url), "utf8"));
  await sql(await readFile(new URL(`../${migration}`, import.meta.url), "utf8"));
  await sql(await readFile(new URL("./fixtures/membership-capacity-foundation.sql", import.meta.url), "utf8"));
  const race = await Promise.allSettled([601,602].map(number => sql(`begin; set local role service_role;
    select private.reserve_full_membership_slot(md5('capacity-qa:'||${number})::uuid,md5('race:'||${number})::uuid);
    select pg_sleep(0.25); commit;`)));
  if (race.filter(result => result.status === "fulfilled").length !== 1 || !race.some(result => result.status === "rejected" && result.reason.stderr.includes("Membership capacity reached"))) throw new Error("Final-slot race did not produce exactly one successful reservation");
  const count = await sql("select count(*) from private.membership_slot_claims;");
  if (count !== "600") throw new Error(`Unexpected claim count after race: ${count}`);
  const rls = await sql("select count(*) from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='private' and c.relname in ('membership_capacity_policy','membership_subscriptions','membership_slot_claims','membership_waitlist','membership_billing_events') and c.relrowsecurity;");
  if (rls !== "5") throw new Error("New private tables must all enable RLS");
  console.log("PASS: disabled checkout, lifecycle/expiry, entitlement projection, reservation idempotency, private privileges, 600-slot bound, and two-connection final-slot race.");
  console.log(`Tested ${migration}; no hosted Supabase or application database was modified.`);
} finally {
  if (created) await docker(["rm", "--force", container]);
}
