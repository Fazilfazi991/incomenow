// Real-provider integration checks. Restricted to the explicitly isolated local
// Supabase stack; secrets and browser sessions stay in ignored runtime files.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {execFile} from 'node:child_process';
import {randomBytes} from 'node:crypto';
import Stripe from 'stripe';
import {createClient} from '@supabase/supabase-js';
import {createServerClient} from '@supabase/ssr';
const root=new URL('../.sites-runtime/stripe-e2e/',import.meta.url);
const env=Object.fromEntries(fs.readFileSync(new URL('.env.app.local',root),'utf8').split('\n').filter(Boolean).map(l=>l.split(/=(.*)/s).slice(0,2)));
assert.equal(env.STRIPE_BILLING_MODE,'test');
assert.equal(env.NEXT_PUBLIC_SUPABASE_URL,'http://127.0.0.1:59321');
assert.equal(env.APP_ORIGIN,'http://localhost:3220');
assert.match(env.STRIPE_SECRET_KEY,/^sk_test_/);
const stripe=new Stripe(env.STRIPE_SECRET_KEY);
assert.equal((await stripe.accounts.retrieve()).id,'acct_1Tt7qJPDKvZxI4vz');
const admin=createClient(env.NEXT_PUBLIC_SUPABASE_URL,env.SUPABASE_SERVICE_ROLE_KEY,{auth:{persistSession:false}});
const fixture=JSON.parse(fs.readFileSync(new URL('fixture.private.json',root),'utf8'));
const evidenceFile=new URL('checks.json',root);
const evidence=fs.existsSync(evidenceFile)?JSON.parse(fs.readFileSync(evidenceFile,'utf8')):[];
let checks=0;
function pass(name,details={}){checks++;evidence.push({name,at:new Date().toISOString(),...details});fs.writeFileSync(evidenceFile,JSON.stringify(evidence,null,2));console.log('PASS: '+name);}
function sql(query){return new Promise((resolve,reject)=>{const p=execFile('docker',['exec','-i','supabase_db_incomenow-stripe-e2e-20261007','psql','-U','postgres','-v','ON_ERROR_STOP=1','-At'],{maxBuffer:2*1024*1024},(error,stdout,stderr)=>error?reject(new Error(stderr)):resolve(stdout.trim()));p.stdin.end(query);});}
async function command(operation,input={}){const {data,error}=await admin.rpc('membership_billing_command',{p_operation:operation,p_input:input});assert.ifError(error);return data;}
async function account(user){const jar=new Map();const client=createServerClient(env.NEXT_PUBLIC_SUPABASE_URL,env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,{cookies:{getAll:()=>[...jar].map(([name,value])=>({name,value})),setAll:values=>values.forEach(({name,value})=>value?jar.set(name,value):jar.delete(name))}});const {error}=await client.auth.signInWithPassword(user);assert.ifError(error);return {client,headers:()=>({cookie:[...jar].map(([k,v])=>`${k}=${v}`).join('; '),origin:env.APP_ORIGIN})};}
async function action(context,path,label,actionId){
 if(!actionId){const html=await (await fetch(env.APP_ORIGIN+path,{headers:context.headers()})).text();const form=[...html.matchAll(/<form\b[^>]*>([\s\S]*?)<\/form>/g)].map(m=>m[1]).find(f=>f.includes(label));assert.ok(form,`Missing action ${label}`);actionId=form.match(/name="\$ACTION_ID_([^"]+)"/)?.[1];assert.ok(actionId,'Missing server action identifier');}
 const body=new FormData();body.set('$ACTION_ID_'+actionId,'');const response=await fetch(env.APP_ORIGIN+path,{method:'POST',body,headers:context.headers(),redirect:'manual'});return {status:response.status,location:response.headers.get('location'),actionId};
}
const stage=process.argv[2];
if(stage==='paid'){
 const a=await command('account',{user_id:fixture.userId});assert.ok(a.subscription?.provider_subscription_id);assert.ok(['active','cancel_at_period_end'].includes(a.subscription.state));
 const s=await stripe.subscriptions.retrieve(a.subscription.provider_subscription_id,{expand:['latest_invoice']});assert.equal(s.livemode,false);assert.equal(s.latest_invoice.status,'paid');assert.equal(s.latest_invoice.amount_paid,1499);
 assert.equal(await sql(`select count(*) from public.membership_entitlements where user_id='${fixture.userId}' and enabled and starts_at<=now() and expires_at>now()`),'1');pass('Real TEST invoice activated full entitlement',{subscriptionId:s.id,invoiceId:s.latest_invoice.id});
 assert.equal(await sql(`select count(*) from private.membership_slot_claims where user_id='${fixture.userId}'`),'1');pass('Exactly one allocated claim');
 assert.equal(await sql(`select count(*) from public.acquisition_payments where user_id='${fixture.userId}' and not livemode and gross_amount_cents=1499`),'1');pass('Exactly one TEST acquisition payment');
 const context=await account({email:fixture.email,password:fixture.password});
 const resource=await fetch(env.APP_ORIGIN+'/api/member/access',{headers:context.headers(),redirect:'manual'});assert.equal(resource.status,200);pass('Authenticated full-member access API responds');
 const memberHtml=await(await fetch(env.APP_ORIGIN+'/membership',{headers:context.headers()})).text();assert.ok(!memberHtml.includes('>Join membership</button>'));pass('Existing full member has no duplicate-purchase action');
 const manifest=JSON.parse(fs.readFileSync(new URL('../.next/dev/server/server-reference-manifest.json',import.meta.url),'utf8'));
 const joinId=Object.entries(manifest.node).find(([,entry])=>entry.exportedName==='joinMembership')?.[0];assert.ok(joinId);
 fixture.joinActionId=joinId;fs.writeFileSync(new URL('fixture.private.json',root),JSON.stringify(fixture));
 const duplicate=await action(context,'/membership','Join membership',joinId);assert.equal(duplicate.location,'/account/access');pass('Direct duplicate checkout request rejected');
 assert.equal((await command('capacity')).active,1);assert.equal((await command('capacity')).reserved,0);pass('Capacity converts reservation to one active member');
 assert.equal(a.subscription.state,'cancel_at_period_end');assert.equal((await command('capacity')).cancelling,1);pass('Portal cancel_at retains paid entitlement and slot');
 const portal=await stripe.billingPortal.configurations.retrieve(fixture.portalId);assert.equal(portal.livemode,false);assert.equal(portal.features.subscription_cancel.mode,'at_period_end');assert.equal(portal.features.payment_method_update.enabled,true);assert.equal(portal.features.subscription_update.enabled,false);pass('Real TEST Portal has approved features');
 const events=await stripe.events.list({type:'customer.subscription.created',limit:20});const original=events.data.find(e=>e.data.object.id===s.id);assert.ok(original);
 for(let n=0;n<2;n++){const payload=JSON.stringify(original);const header=stripe.webhooks.generateTestHeaderString({payload,secret:env.STRIPE_WEBHOOK_SECRET});const r=await fetch(env.APP_ORIGIN+'/api/stripe/webhook',{method:'POST',headers:{'stripe-signature':header,'content-type':'application/json'},body:payload});assert.equal(r.status,200);}
 assert.equal(await sql(`select count(*) from public.acquisition_payments where user_id='${fixture.userId}'`),'1');pass('Signed local replay of real provider event remains idempotent');
}else if(stage==='race'){
 const users=[];for(const suffix of ['a','b']){const password=randomBytes(24).toString('base64url'),email=`stripe-race-${suffix}-${randomBytes(4).toString('hex')}@example.test`;const {data,error}=await admin.auth.admin.createUser({email,password,email_confirm:true});assert.ifError(error);users.push({id:data.user.id,email,password});}
 fixture.raceUsers=users;fs.writeFileSync(new URL('fixture.private.json',root),JSON.stringify(fixture));
 await sql(`insert into auth.users(id,email,email_confirmed_at,created_at,raw_user_meta_data) select md5('stripe-e2e-hold:'||n)::uuid,'hold-'||n||'@example.test',now(),now(),'{}'::jsonb from generate_series(1,598)n;
 set role service_role;set "request.jwt.claims"='{"role":"service_role"}';do $$declare n integer;begin for n in 1..598 loop perform public.membership_billing_command('reserve',jsonb_build_object('user_id',md5('stripe-e2e-hold:'||n)::uuid,'request_id',gen_random_uuid(),'origin','http://localhost:3220'));end loop;end$$;`);
 const capacity=await command('capacity');assert.equal(capacity.active+capacity.reserved,599);
 const contexts=await Promise.all(users.map(u=>account({email:u.email,password:u.password})));
 // Resolve both eligible forms before the competing requests, so neither page
 // rendering observes a full state and masks the actual allocation race.
 const ids=await Promise.all(contexts.map(async c=>{const html=await(await fetch(env.APP_ORIGIN+'/membership',{headers:c.headers()})).text();const form=[...html.matchAll(/<form\b[^>]*>([\s\S]*?)<\/form>/g)].map(m=>m[1]).find(f=>f.includes('Join membership'));assert.ok(form);return form.match(/name="\$ACTION_ID_([^"]+)"/)[1];}));
 const results=await Promise.all(contexts.map((c,i)=>action(c,'/membership','Join membership',ids[i])));
 const winner=results.findIndex(r=>r.location?.startsWith('https://checkout.stripe.com/'));assert.ok(winner>=0);const loser=1-winner;assert.equal(results[loser].location,'/membership?billing=full');
 assert.equal((await command('capacity')).active+(await command('capacity')).reserved,600);assert.equal(await sql('select max(slot_number) from private.membership_slot_claims'),'600');pass('Two real application checkout requests at 599 yield exactly one TEST Checkout and no slot 601');
 fixture.joinActionId=ids[0];fixture.raceUsers=users;fixture.raceWinner=winner;fixture.raceLoser=loser;fs.writeFileSync(new URL('fixture.private.json',root),JSON.stringify(fixture));
 for(let n=0;n<2;n++)assert.equal((await action(contexts[loser],'/membership','Join Waitlist')).location,'/membership?billing=waitlisted');
 assert.equal(await sql(`select count(*) from private.membership_waitlist where user_id='${users[loser].id}'`),'1');pass('Full-capacity application waitlist entry deduplicates');
 const winnerAccount=await command('account',{user_id:users[winner].id});await stripe.checkout.sessions.expire(winnerAccount.subscription.provider_checkout_session_id);pass('Real abandoned TEST Checkout explicitly expired');
 await sql(`insert into public.acquisition_admins(user_id) values('${fixture.userId}') on conflict do nothing;`);
}else if(stage==='expired'){
 await command('capacity'); // Public capacity reads perform due-slot cleanup.
 const a=await command('account',{user_id:fixture.userId});assert.equal(a.subscription.state,'expired');assert.ok(Date.parse(a.subscription.entitlement_ends_at)<=Date.now());
 assert.equal(await sql(`select count(*) from private.membership_slot_claims where user_id='${fixture.userId}'`),'0');pass('Provider-confirmed period end releases paid slot');
 const c=await account({email:fixture.email,password:fixture.password});const resource=await fetch(env.APP_ORIGIN+'/app/resources/pergola-setup-guide',{headers:c.headers(),redirect:'manual'});assert.ok(resource.status===403||resource.status===307);pass('Expired member loses protected resource access');
}else if(stage==='invite'){
 const adminContext=await account({email:fixture.email,password:fixture.password});const result=await action(adminContext,'/admin/membership','Reserve next waitlist invitation');assert.equal(result.location,'/admin/membership?notice=invited');
 const u=fixture.raceUsers[fixture.raceLoser],a=await command('account',{user_id:u.id});assert.equal(a.waitlist_state,'invited');assert.equal(a.invitation_active,true);pass('Admin application action reserves account-bound invitation');
 const c=await account({email:u.email,password:u.password});const resultCheckout=await action(c,'/membership','Join membership');assert.ok(resultCheckout.location?.startsWith('https://checkout.stripe.com/'));pass('Invited account can start real TEST Checkout');
 fs.writeFileSync(new URL('invited-checkout.private.json',root),JSON.stringify({url:resultCheckout.location,user:u}));
}else if(stage==='conversion'){
 const u=fixture.raceUsers[fixture.raceLoser],a=await command('account',{user_id:u.id});
 assert.equal(a.waitlist_state,'converted');assert.equal(a.subscription.state,'active');
 assert.equal(await sql(`select count(*) from public.acquisition_payments where user_id='${u.id}' and not livemode`),'1');
 pass('Real invited TEST payment activates membership and converts waitlist');
 fixture.invitedSubscriptionId=a.subscription.provider_subscription_id;fs.writeFileSync(new URL('fixture.private.json',root),JSON.stringify(fixture));
}else if(stage==='renew'){
 const s=await stripe.subscriptions.retrieve(fixture.invitedSubscriptionId,{expand:['latest_invoice']});
 fixture.beforeRenewalInvoice=s.latest_invoice.id;fixture.beforeRenewalEnd=s.items.data[0].current_period_end;
 fs.writeFileSync(new URL('fixture.private.json',root),JSON.stringify(fixture));
 await stripe.subscriptions.update(s.id,{billing_cycle_anchor:{type:'now'},proration_behavior:'none',payment_behavior:'allow_incomplete'});
 pass('Real TEST renewal requested using a reset billing anchor without proration');
}else if(stage==='clock-checkout'){
 const u=fixture.raceUsers[fixture.raceWinner],date=new Date();date.setUTCMonth(date.getUTCMonth()-1);date.setUTCMinutes(date.getUTCMinutes()-5);
 const clock=await stripe.testHelpers.testClocks.create({frozen_time:Math.floor(+date/1000),name:'IncomeNow renewal verification'});
 const old=await command('account',{user_id:u.id});
 assert.equal(old.subscription.state,'expired');
 const customer=await stripe.customers.retrieve(old.customer_id);assert.equal(customer.livemode,false);
 // Clock association is immutable: this disposable account receives a new
 // provider customer before a new reservation, never a paid production user.
 const mapped=await stripe.customers.create({test_clock:clock.id,metadata:{incomenow_user_id:u.id}});
 await sql(`update private.membership_customers set provider_customer_id='${mapped.id}' where user_id='${u.id}'`);
 fixture.renewClockId=clock.id;fixture.renewUser=u;fs.writeFileSync(new URL('fixture.private.json',root),JSON.stringify(fixture));
 const c=await account({email:u.email,password:u.password}),r=await action(c,'/membership','Join membership');assert.ok(r.location?.startsWith('https://checkout.stripe.com/'));
 fs.writeFileSync(new URL('renewal-checkout.private.json',root),JSON.stringify({url:r.location,user:u}));pass('Real application Checkout created for isolated renewal clock');
}else if(stage==='clock-renew'){
 const a=await command('account',{user_id:fixture.renewUser.id});const s=await stripe.subscriptions.retrieve(a.subscription.provider_subscription_id,{expand:['latest_invoice']});assert.equal(s.latest_invoice.status,'paid');
 fixture.renewSubscriptionId=s.id;fixture.beforeRenewalInvoice=s.latest_invoice.id;fs.writeFileSync(new URL('fixture.private.json',root),JSON.stringify(fixture));
 await stripe.testHelpers.testClocks.advance(fixture.renewClockId,{frozen_time:s.items.data[0].current_period_end+3700});pass('Real Stripe TEST clock advanced through renewal and invoice finalization');
}else if(stage==='renewed'){
 const s=await stripe.subscriptions.retrieve(fixture.renewSubscriptionId,{expand:['latest_invoice']});
 assert.notEqual(s.latest_invoice.id,fixture.beforeRenewalInvoice);assert.equal(s.latest_invoice.status,'paid');assert.equal(s.latest_invoice.amount_paid,1499);
 const a=await command('account',{user_id:fixture.renewUser.id});assert.equal(Date.parse(a.subscription.entitlement_ends_at),s.items.data[0].current_period_end*1000);
 assert.equal(await sql(`select count(*) from public.acquisition_payments where user_id='${a.subscription.user_id}'`),'2');pass('Real TEST renewed invoice extends entitlement and records exactly once');
 fixture.paidEnd=a.subscription.entitlement_ends_at;fs.writeFileSync(new URL('fixture.private.json',root),JSON.stringify(fixture));
}else if(stage==='fail-invoice'){
 const s=await stripe.subscriptions.retrieve(fixture.renewSubscriptionId);
 const pm=await stripe.paymentMethods.attach('pm_card_chargeCustomerFail',{customer:typeof s.customer==='string'?s.customer:s.customer.id});
 await stripe.subscriptions.update(s.id,{default_payment_method:pm.id});
 await stripe.testHelpers.testClocks.advance(fixture.renewClockId,{frozen_time:s.items.data[0].current_period_end+3700});
 pass('Real TEST failed renewal requested with official declining payment method');
}else if(stage==='provider-status'){
 const s=await stripe.subscriptions.retrieve(fixture.invitedSubscriptionId,{expand:['latest_invoice']});
 const invoices=await stripe.invoices.list({subscription:s.id,limit:5});
 console.log(JSON.stringify({status:s.status,anchor:s.billing_cycle_anchor,billingMode:s.billing_mode,period:s.items.data.map(i=>({start:i.current_period_start,end:i.current_period_end})),latestInvoice:s.latest_invoice.id,invoices:invoices.data.map(i=>({id:i.id,status:i.status,billingReason:i.billing_reason,amountPaid:i.amount_paid,amountDue:i.amount_due,lines:i.lines.data.map(l=>({period:l.period,proration:l.parent?.subscription_item_details?.proration}))}))}));
}else if(stage==='failed-invoice'){
 const s=await stripe.subscriptions.retrieve(fixture.renewSubscriptionId,{expand:['latest_invoice']});assert.equal(s.status,'past_due');assert.notEqual(s.latest_invoice.status,'paid');
 const a=await command('account',{user_id:fixture.renewUser.id});assert.equal(a.subscription.payment_status,'past_due');assert.equal(a.subscription.entitlement_ends_at,fixture.paidEnd);
 assert.equal(await sql(`select count(*) from public.acquisition_payments where user_id='${a.subscription.user_id}'`),'2');pass('Real failed invoice preserves only previous paid window and creates no payment');
}else if(stage==='reconcile'){
 // Remove unused synthetic race holds through their normal time-expiry path.
 await sql("update private.membership_subscriptions set checkout_expires_at=now()-interval '1 minute' where checkout_attempt_state='not_started' and provider_customer_id is null");await command('capacity');
 // Make real provider-backed fixtures due for the scheduled worker.
 await sql("update private.membership_subscriptions set last_provider_event_at=now()-interval '10 minutes',last_reconcile_attempt_at=null where provider_subscription_id is not null and state in ('active','cancel_at_period_end')");
 assert.equal((await fetch(env.APP_ORIGIN+'/api/billing/reconcile')).status,401);
 const r=await fetch(env.APP_ORIGIN+'/api/billing/reconcile',{headers:{authorization:'Bearer '+env.BILLING_RECONCILIATION_SECRET}});assert.equal(r.status,200);pass('Real provider reconciliation succeeds with authentication; anonymous request denied');
 const bad=await fetch(env.APP_ORIGIN+'/api/stripe/webhook',{method:'POST',body:'{}',headers:{'stripe-signature':'invalid'}});assert.equal(bad.status,400);pass('Invalid webhook signature rejected');
}else if(stage==='invitation-expiry'){
 await command('capacity');
 const password=randomBytes(24).toString('base64url'),email=`stripe-invite-expiry-${randomBytes(4).toString('hex')}@example.test`;
 const {data,error}=await admin.auth.admin.createUser({email,password,email_confirm:true});assert.ifError(error);
 await command('waitlist',{user_id:data.user.id,email});
 const c=await account({email:fixture.email,password:fixture.password});assert.equal((await action(c,'/admin/membership','Reserve next waitlist invitation')).location,'/admin/membership?notice=invited');
 const invitedId=await sql("select user_id from private.membership_waitlist where state='invited' order by invited_at desc limit 1");assert.match(invitedId,/^[0-9a-f-]{36}$/);
 const a=await command('account',{user_id:invitedId});assert.equal(a.invitation_active,true);
 await sql(`update private.membership_waitlist set invited_at=now()-interval '2 days',invitation_expires_at=now()-interval '1 day' where user_id='${invitedId}';update private.membership_subscriptions set checkout_expires_at=now()-interval '1 day' where user_id='${invitedId}'`);
 await command('capacity');const ended=await command('account',{user_id:invitedId});assert.equal(ended.waitlist_state,'expired');assert.equal(ended.invitation_active,false);assert.equal(await sql(`select count(*) from private.membership_slot_claims where user_id='${invitedId}'`),'0');pass('Unused account-bound invitation expires and releases its capacity');
}
console.log(`Completed ${checks} real-provider/application assertions for ${stage}.`);
