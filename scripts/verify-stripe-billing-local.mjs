// Actual PostgreSQL transactions in an isolated disposable container. No Stripe
// calls, application credentials, hosted database or existing container writes.
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { readFile } from "node:fs/promises";
const exec=promisify(execFile);
const container=`incomenow-billing-qa-${process.pid}`;
let created=false;
const docker=args=>exec("docker",args,{maxBuffer:2*1024*1024});
function sql(query){return new Promise((resolve,reject)=>{const child=execFile("docker",["exec","-i",container,"psql","-U","postgres","-v","ON_ERROR_STOP=1","-At"],{maxBuffer:2*1024*1024},(error,stdout,stderr)=>error?reject(Object.assign(error,{stderr})):resolve(stdout.trim()));child.stdin.end(query);});}
const user=n=>`md5('billing-qa:${n}')::uuid`;
const command=(op,input)=>`select public.membership_billing_command('${op}',${input});`;
const service=query=>sql(`set role service_role; set "request.jwt.claims"='{"role":"service_role"}'; ${query}`);
let checks=0;
async function equal(query,value){assert.equal(await sql(query),String(value));checks++;}
async function rejects(query,pattern){await assert.rejects(sql(query),error=>pattern.test(error.stderr));checks++;}
try {
  await docker(["run","--detach","--name",container,"--label","incomenow.billing-test=true","--network","none","--env","POSTGRES_PASSWORD=disposable-test-only","postgres:17.11"]);created=true;
  for(let attempt=0;attempt<40;attempt++){try{await docker(["exec",container,"pg_isready","-U","postgres"]);break;}catch{await new Promise(resolve=>setTimeout(resolve,200));}}
  await sql(`create role anon;create role authenticated;create role service_role bypassrls;
    create schema auth; create table auth.users(id uuid primary key,email text,email_confirmed_at timestamptz,created_at timestamptz default now(),raw_user_meta_data jsonb default '{}');
    create function auth.uid() returns uuid language sql as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
    create function auth.jwt() returns jsonb language sql as $$select coalesce(nullif(current_setting('request.jwt.claims',true),''),'{}')::jsonb$$;
    create function auth.role() returns text language sql as $$select auth.jwt()->>'role'$$;
    grant usage on schema auth to anon,authenticated,service_role;grant execute on all functions in schema auth to anon,authenticated,service_role;`);
  for(const migration of ["20260920112114_phase_2a_auth_membership.sql","20260923120000_acquisition_race.sql","20261007102952_full_membership_capacity_foundation.sql","20261007103932_stripe_membership_billing.sql","20261007130611_stripe_membership_live_mode.sql","20261007131444_adopt_legacy_full_membership_claims.sql"]){await sql(await readFile(new URL(`../supabase/migrations/${migration}`,import.meta.url),"utf8"));}
  await sql(`insert into auth.users(id,email,email_confirmed_at) select md5('billing-qa:'||n)::uuid,'billing-'||n||'@example.test',now() from generate_series(1,605)n;`);
  await rejects(`set role authenticated;${command("capacity","'{}'::jsonb")}`,/permission denied/);
  await rejects(`set role anon;select * from private.membership_customers;`,/permission denied/);
  await rejects(`set role service_role;set "request.jwt.claims"='{"role":"authenticated"}';${command("capacity","'{}'::jsonb")}`,/Service role required/);
  await assert.rejects(service(command("reserve",`jsonb_build_object('user_id',${user(1)},'request_id',gen_random_uuid(),'origin','http://localhost:3210')`)),error=>/disabled/.test(error.stderr));checks++;
  await sql("update private.membership_capacity_policy set checkout_enabled=true,waitlist_enabled=true;");
  const reservation=JSON.parse((await service(command("reserve",`jsonb_build_object('user_id',${user(1)},'request_id',gen_random_uuid(),'origin','http://localhost:3210')`))).split('\n').at(-1));
  const rid=reservation.id;
  const replay=JSON.parse((await service(command("reserve",`jsonb_build_object('user_id',${user(1)},'request_id',gen_random_uuid(),'origin','http://localhost:9999')`))).split('\n').at(-1));assert.equal(replay.id,rid);checks++;
  await service(command("customer",`jsonb_build_object('user_id',${user(1)},'customer_id','cus_fixture')`));
  await service(command("start_checkout",`jsonb_build_object('id','${rid}','user_id',${user(1)},'customer_id','cus_fixture','price_id','price_fixture')`));
  await service(command("bind_checkout",`jsonb_build_object('id','${rid}','user_id',${user(1)},'customer_id','cus_fixture','session_id','cs_test_fixture','price_id','price_fixture')`));
  await sql(`update private.membership_subscriptions set checkout_expires_at=now()-interval '1 minute' where id='${rid}';update private.membership_slot_claims set reserved_until=now()-interval '1 minute';select private.release_ended_membership_slots();`);
  await equal("select count(*) from private.membership_slot_claims;",1);
  const lease=JSON.parse((await service(command("lease",`jsonb_build_object('id','${rid}','event_id','evt_paid')`))).split('\n').at(-1));
  await assert.rejects(service(command("lease",`jsonb_build_object('id','${rid}','event_id','evt_other')`)),error=>/busy/.test(error.stderr));checks++;
  const sync=(token,event,extra="")=>command("sync",`jsonb_build_object('id','${rid}','token','${token}','user_id',${user(1)},'customer_id','cus_fixture','session_id','cs_test_fixture','price_id','price_fixture',
    'provider_subscription_id','sub_fixture','provider_status','active','checkout_status','complete','paid_start',now()-interval '1 day','paid_end',now()+interval '29 days',
    'event_id','${event}','event_type','invoice.paid','event_created_at',now(),'invoice_id','in_fixture','invoice_amount',1499,'invoice_paid_at',now()) ${extra}`);
  await service(sync(lease.token,"evt_paid"));
  await equal("select count(*) from public.membership_entitlements where enabled and source='billing_provider';",1);
  await equal("select count(*) from private.membership_slot_claims where claim_state='allocated';",1);
  await equal("select count(*) from public.acquisition_payments where offer_kind='membership_1499' and gross_amount_cents=1499 and not livemode;",1);
  const duplicate=JSON.parse((await service(command("lease",`jsonb_build_object('id','${rid}','event_id','evt_paid')`))).split('\n').at(-1));assert.equal(duplicate.duplicate,true);checks++;
  await assert.rejects(service(command("reserve",`jsonb_build_object('user_id',${user(1)},'request_id',gen_random_uuid(),'origin','http://localhost:3210')`)),error=>/Already a full member/.test(error.stderr));checks++;
  const pastDueLease=JSON.parse((await service(command("lease",`jsonb_build_object('id','${rid}','event_id','evt_failed')`))).split('\n').at(-1));
  await service(sync(pastDueLease.token,"evt_failed","||jsonb_build_object('provider_status','past_due','paid_start',null,'paid_end',null,'invoice_id',null)"));
  await equal(`select payment_status from private.membership_subscriptions where id='${rid}';`,"past_due");
  await equal("select count(*) from public.membership_entitlements where enabled and expires_at>now();",1);
  const l2=JSON.parse((await service(command("lease",`jsonb_build_object('id','${rid}','event_id','evt_cancel')`))).split('\n').at(-1));
  await service(sync(l2.token,"evt_cancel","||jsonb_build_object('cancel_at_period_end',true,'paid_start',null,'paid_end',null,'invoice_id',null)"));
  await equal(`select state from private.membership_subscriptions where id='${rid}';`,"cancel_at_period_end");
  await equal("select count(*) from public.membership_entitlements where enabled and expires_at>now();",1);
  await equal("select count(*) from private.membership_slot_claims;",1);
  await rejects(`set role service_role;set "request.jwt.claims"='{"role":"service_role"}';${sync(lease.token,"evt_stale")}`,/Stale reconciliation/);
  await service(command("waitlist",`jsonb_build_object('user_id',${user(2)},'email','billing-2@example.test')`));
  await service(command("waitlist",`jsonb_build_object('user_id',${user(2)},'email','BILLING-2@example.test')`));
  await equal("select count(*) from private.membership_waitlist;",1);
  await assert.rejects(service(command("waitlist",`jsonb_build_object('user_id',${user(2)},'email','wrong@example.test')`)),error=>/Verified account/.test(error.stderr));checks++;
  // End window while preserving the source identity; expiry alone closes access.
  await sql(`update private.membership_subscriptions set entitlement_starts_at=now()-interval '2 days',entitlement_ends_at=now()-interval '1 day' where id='${rid}';
    update public.membership_entitlements set starts_at=now()-interval '2 days',expires_at=now()-interval '1 day';select private.release_ended_membership_slots();`);
  await equal("select count(*) from private.membership_slot_claims;",0);
  const invitation=JSON.parse((await service(command("invite_next","'{}'::jsonb"))).split('\n').at(-1));assert.equal(invitation.invited,true);checks++;
  await equal("select state from private.membership_waitlist;","invited");
  await equal("select count(*) from private.membership_slot_claims;",1);
  await sql("update private.membership_subscriptions set checkout_expires_at=now()-interval '1 minute' where state='pending';update private.membership_waitlist set invited_at=now()-interval '2 days',invitation_expires_at=now()-interval '1 day';select private.release_ended_membership_slots();");
  await equal("select state from private.membership_waitlist;","expired");
  await equal("select count(*) from private.membership_slot_claims;",0);
  // 599 real DB reservations, then two independent connections compete for #600.
  await service(`do $$declare n integer;begin for n in 3..601 loop perform public.membership_billing_command('reserve',jsonb_build_object('user_id',md5('billing-qa:'||n)::uuid,'request_id',gen_random_uuid(),'origin','http://localhost:3210'));end loop;end$$;`);
  const race=await Promise.allSettled([602,603].map(n=>service(`begin;${command("reserve",`jsonb_build_object('user_id',${user(n)},'request_id',gen_random_uuid(),'origin','http://localhost:3210')`)}select pg_sleep(0.1);commit;`)));
  assert.equal(race.filter(v=>v.status==="fulfilled").length,1);assert.ok(race.some(v=>v.status==="rejected"&&/Membership capacity reached/.test(v.reason.stderr)));checks++;
  await equal("select count(*) from private.membership_slot_claims;",600);
  await service(command("waitlist",`jsonb_build_object('user_id',${user(2)},'email','billing-2@example.test')`));
  await assert.rejects(service(command("invite_next","'{}'::jsonb")),error=>/Membership capacity reached/.test(error.stderr));checks++;
  await equal("select state from private.membership_waitlist;","waiting");
  await rejects(`insert into public.membership_entitlements(user_id,enabled,source) values(${user(604)},true,'complimentary');`,/exceeds membership capacity/);
  await rejects(`insert into private.membership_slot_claims(slot_number,subscription_id,user_id,idempotency_key,claim_state) values(601,gen_random_uuid(),${user(605)},gen_random_uuid(),'allocated');`,/check constraint/);
  await assert.rejects(service(command("capacity","'{\"livemode\":true}'::jsonb")),error=>/mode mismatch/.test(error.stderr));checks++;
  await sql("update private.membership_capacity_policy set stripe_billing_mode='live',checkout_enabled=false;");
  await assert.rejects(service(command("capacity","'{}'::jsonb")),error=>/mode mismatch/.test(error.stderr));checks++;
  const liveCapacity=JSON.parse((await service(command("capacity","'{\"livemode\":true}'::jsonb"))).split('\n').at(-1));assert.equal(liveCapacity.capacity,600);checks++;
  await sql("update private.membership_capacity_policy set stripe_billing_mode='test';");
  await sql("update private.membership_subscriptions set checkout_expires_at=now()-interval '1 minute' where state='pending';select private.release_ended_membership_slots();");
  await sql(`insert into public.membership_entitlements(user_id,enabled,source) values(${user(604)},true,'complimentary');select private.adopt_existing_full_membership_grants();select private.adopt_existing_full_membership_grants();`);
  await equal(`select count(*) from private.membership_slot_claims where legacy_entitlement_id is not null;`,1);
  await equal(`select count(*) from private.membership_subscriptions where user_id=${user(604)};`,0);
  await equal(`select enabled and source='complimentary' and expires_at is null from public.membership_entitlements where user_id=${user(604)};`,'t');
  await rejects(`set role authenticated;select private.adopt_existing_full_membership_grants();`,/permission denied/);
  await sql(`update public.membership_entitlements set revoked_at=now() where user_id=${user(604)};select private.release_ended_membership_slots();`);
  await sql(`update private.membership_subscriptions set checkout_expires_at=now()-interval '1 minute' where state='pending';select private.release_ended_membership_slots();`);
  await equal("select count(*) from private.membership_slot_claims;",0);
  console.log(`PASS: ${checks} PostgreSQL assertions; migration syntax, role/RLS boundaries, idempotency, delayed confirmation, paid activation, cancellation retention, expiry, waitlist deduplication, fencing and actual final-slot concurrency.`);
  console.log("No Stripe API calls, hosted mutations, existing database changes or real customer data.");
}finally{if(created)await docker(["rm","--force",container]);}
