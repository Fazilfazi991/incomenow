begin;
create extension if not exists pgtap with schema extensions;
select plan(24);

select ok((select published from private.workspace_idea_definitions where idea_id = 'idea-004'), 'ZeroDebt is published by the canonical database gate');
select is((select version from private.workspace_plan_versions where idea_id = 'idea-004' and is_current), '2', 'ZeroDebt plan version two is current');
select is((select count(*) from private.workspace_stage_definitions where idea_id = 'idea-004' and plan_version = '2'), 13::bigint, 'ZeroDebt plan has thirteen immutable stages');
select is((select count(*) from private.workspace_task_definitions where idea_id = 'idea-004' and plan_version = '2'), 26::bigint, 'ZeroDebt plan has twenty-six practical tasks');

insert into auth.users (id, aud, role, email, encrypted_password, email_confirmed_at)
values
  ('00000000-0000-0000-0000-000000005001', 'authenticated', 'authenticated', 'phase5-free@example.test', '', now()),
  ('00000000-0000-0000-0000-000000005002', 'authenticated', 'authenticated', 'phase5-starter@example.test', '', now()),
  ('00000000-0000-0000-0000-000000005003', 'authenticated', 'authenticated', 'phase5-full@example.test', '', now()),
  ('00000000-0000-0000-0000-000000005004', 'authenticated', 'authenticated', 'phase5-other@example.test', '', now());

insert into public.idea_access_grants (user_id, offer_code, idea_id, enabled, source)
values ('00000000-0000-0000-0000-000000005002', 'starter-pergola-v1', 'idea-001', true, 'local_test');

insert into public.membership_entitlements (user_id, enabled, source, source_reference)
values ('00000000-0000-0000-0000-000000005003', true, 'complimentary', 'phase5-full');

set local role authenticated;
set local "request.jwt.claim.sub" = '00000000-0000-0000-0000-000000005001';
select lives_ok($$insert into public.bookmarks (idea_id) values ('idea-004')$$, 'verified free account can bookmark ZeroDebt');
select throws_ok($$select public.start_member_project('idea-004')$$, '42501', 'Idea access required', 'free account cannot start a ZeroDebt project');

set local "request.jwt.claim.sub" = '00000000-0000-0000-0000-000000005002';
select lives_ok($$insert into public.bookmarks (idea_id) values ('idea-004')$$, 'Pergola Starter can bookmark ZeroDebt');
select throws_ok($$select public.start_member_project('idea-004')$$, '42501', 'Idea access required', 'Pergola Starter cannot start a ZeroDebt project');

set local "request.jwt.claim.sub" = '00000000-0000-0000-0000-000000005003';
select lives_ok($$select public.start_member_project('idea-004')$$, 'full member can create a ZeroDebt project');
select is((select count(*) from public.projects), 1::bigint, 'full member sees one ZeroDebt project');
select is(public.start_member_project('idea-004'), (select id from public.projects where idea_id = 'idea-004'), 'ZeroDebt project Start is idempotent');
select is((select plan_version from public.projects where idea_id = 'idea-004'), '2', 'ZeroDebt project preserves its plan version');
select is((select count(*) from public.project_stages), 13::bigint, 'ZeroDebt project creates thirteen stages');
select is((select count(*) from public.project_tasks), 26::bigint, 'ZeroDebt project creates twenty-six tasks');
select is((select count(*) from public.project_stage_notes), 13::bigint, 'ZeroDebt project creates one private note per stage');
select lives_ok($$select public.set_member_project_task_completed((select id from public.projects), 'zerodebt-opportunity', 'zerodebt-user-segment', true)$$, 'ZeroDebt task progress persists');
select is((select saved_revision from public.save_member_project_stage_note((select id from public.projects), 'zerodebt-opportunity', 'Initial user research evidence', 0)), 1, 'ZeroDebt stage notes persist with revision control');
select lives_ok($$select public.set_member_project_paused((select id from public.projects), true)$$, 'ZeroDebt project can be paused');
select throws_ok($$select public.set_member_project_task_completed((select id from public.projects), 'zerodebt-opportunity', 'zerodebt-safety-boundary', true)$$, '55000', 'Resume the project before editing progress', 'paused ZeroDebt project rejects progress edits');
select lives_ok($$select public.set_member_project_paused((select id from public.projects), false)$$, 'ZeroDebt project can resume');
select lives_ok($$select public.set_member_project_task_completed((select id from public.projects), 'zerodebt-opportunity', 'zerodebt-safety-boundary', true)$$, 'resumed ZeroDebt project accepts progress edits');

reset role;
create temporary table phase5_project_ids as select user_id, id from public.projects where idea_id = 'idea-004';
grant select on phase5_project_ids to authenticated;

set local role authenticated;
set local "request.jwt.claim.sub" = '00000000-0000-0000-0000-000000005004';
select is_empty($$select id from public.projects$$, 'another account cannot read the ZeroDebt project');
select throws_ok($$select public.set_member_project_paused((select id from phase5_project_ids), true)$$, 'P0002', 'Project unavailable', 'another account cannot mutate the ZeroDebt project');

reset role;
select is((select count(*) from public.projects where user_id = '00000000-0000-0000-0000-000000005003' and idea_id = 'idea-004'), 1::bigint, 'cross-user denial does not alter the stored ZeroDebt project');

select * from finish();
rollback;
