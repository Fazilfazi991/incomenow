begin;
create extension if not exists pgtap with schema extensions;
select plan(25);

select ok((select published from private.workspace_idea_definitions where idea_id = 'idea-003'), 'Accounting kit is published');
select is((select version from private.workspace_plan_versions where idea_id = 'idea-003' and is_current), '2', 'Accounting plan version two is current');
select ok((select not is_current from private.workspace_plan_versions where idea_id = 'idea-003' and version = '1'), 'previous Accounting plan remains immutable and non-current');
select is((select count(*) from private.workspace_stage_definitions where idea_id = 'idea-003' and plan_version = '1'), 6::bigint, 'previous Accounting plan keeps its six stages');
select is((select count(*) from private.workspace_stage_definitions where idea_id = 'idea-003' and plan_version = '2'), 12::bigint, 'Accounting plan version two has twelve stages');
select is((select count(*) from private.workspace_task_definitions where idea_id = 'idea-003' and plan_version = '2'), 24::bigint, 'Accounting plan version two has twenty-four tasks');

insert into auth.users (id, aud, role, email, encrypted_password, email_confirmed_at)
values
  ('00000000-0000-0000-0000-000000004c01', 'authenticated', 'authenticated', 'phase4c-registered@example.test', '', now()),
  ('00000000-0000-0000-0000-000000004c02', 'authenticated', 'authenticated', 'phase4c-starter@example.test', '', now()),
  ('00000000-0000-0000-0000-000000004c03', 'authenticated', 'authenticated', 'phase4c-full@example.test', '', now()),
  ('00000000-0000-0000-0000-000000004c04', 'authenticated', 'authenticated', 'phase4c-other@example.test', '', now());

insert into public.idea_access_grants (user_id, offer_code, idea_id, enabled, source)
values ('00000000-0000-0000-0000-000000004c02', 'starter-pergola-v1', 'idea-001', true, 'local_test');

insert into public.membership_entitlements (user_id, enabled, source, source_reference)
values ('00000000-0000-0000-0000-000000004c03', true, 'complimentary', 'phase4c-full');

set local role authenticated;
set local "request.jwt.claim.sub" = '00000000-0000-0000-0000-000000004c01';
select lives_ok($$insert into public.bookmarks (idea_id) values ('idea-003')$$, 'registered account can save the Accounting preview');
select throws_ok($$select public.start_member_project('idea-003')$$, '42501', 'Idea access required', 'registered account cannot start an Accounting project');

set local "request.jwt.claim.sub" = '00000000-0000-0000-0000-000000004c02';
select lives_ok($$insert into public.bookmarks (idea_id) values ('idea-003')$$, 'Pergola Starter can save the Accounting preview');
select throws_ok($$select public.start_member_project('idea-003')$$, '42501', 'Idea access required', 'Pergola Starter cannot start an Accounting project');

set local "request.jwt.claim.sub" = '00000000-0000-0000-0000-000000004c03';
select lives_ok($$select public.start_member_project('idea-003')$$, 'full member can create an Accounting project');
select is(public.start_member_project('idea-003'), (select id from public.projects where idea_id = 'idea-003'), 'Accounting project Start is idempotent');
select is((select plan_version from public.projects where idea_id = 'idea-003'), '2', 'new Accounting project pins plan version two');
select is((select count(*) from public.projects where idea_id = 'idea-003'), 1::bigint, 'full member has one Accounting project');
select is((select count(*) from public.project_stages where idea_id = 'idea-003'), 12::bigint, 'Accounting project creates twelve stages');
select is((select count(*) from public.project_tasks where idea_id = 'idea-003'), 24::bigint, 'Accounting project creates twenty-four tasks');
select is((select count(*) from public.project_stage_notes where idea_id = 'idea-003'), 12::bigint, 'Accounting project creates one private note per stage');
select lives_ok($$select public.set_member_project_task_completed((select id from public.projects where idea_id = 'idea-003'), 'accounting-opportunity', 'accounting-map-current-workflow', true)$$, 'Accounting task progress persists');
select is((select saved_revision from public.save_member_project_stage_note((select id from public.projects where idea_id = 'idea-003'), 'accounting-opportunity', 'Synthetic workflow evidence only', 0)), 1, 'Accounting stage notes persist with revision control');
select lives_ok($$select public.set_member_project_paused((select id from public.projects where idea_id = 'idea-003'), true)$$, 'Accounting project can pause');
select throws_ok($$select public.set_member_project_task_completed((select id from public.projects where idea_id = 'idea-003'), 'accounting-opportunity', 'accounting-confirm-boundaries', true)$$, '55000', 'Resume the project before editing progress', 'paused Accounting project rejects progress edits');
select lives_ok($$select public.set_member_project_paused((select id from public.projects where idea_id = 'idea-003'), false)$$, 'Accounting project can resume');

reset role;
create temporary table phase4c_project_ids as select id from public.projects where idea_id = 'idea-003';
grant select on phase4c_project_ids to authenticated;

set local role authenticated;
set local "request.jwt.claim.sub" = '00000000-0000-0000-0000-000000004c04';
select is_empty($$select id from public.projects$$, 'another account cannot read the Accounting project');
select throws_ok($$select public.set_member_project_paused((select id from phase4c_project_ids), true)$$, 'P0002', 'Project unavailable', 'another account cannot mutate the Accounting project');

reset role;
select is((select count(*) from public.projects where user_id = '00000000-0000-0000-0000-000000004c03' and idea_id = 'idea-003'), 1::bigint, 'cross-user denial does not alter the stored Accounting project');

select * from finish();
rollback;
