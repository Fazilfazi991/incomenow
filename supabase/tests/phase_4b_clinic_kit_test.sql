begin;
create extension if not exists pgtap with schema extensions;
select plan(28);

select has_column('private', 'workspace_idea_definitions', 'published', 'workspace ideas have a canonical publication gate');
select has_function('private', 'idea_is_published', array['text'], 'publication helper exists');
select results_eq(
  $$select idea_id from private.workspace_idea_definitions where published order by idea_id$$,
  array['idea-001'::text, 'idea-002'::text, 'idea-003'::text, 'idea-004'::text, 'idea-005'::text],
  'Pergola, Clinic, Accounting, ZeroDebt, and Resumi are published'
);
select is((select version from private.workspace_plan_versions where idea_id = 'idea-002' and is_current), '1', 'Clinic plan version one is current');
select is((select count(*) from private.workspace_stage_definitions where idea_id = 'idea-002' and plan_version = '1'), 10::bigint, 'Clinic plan has ten immutable stages');
select is((select count(*) from private.workspace_task_definitions where idea_id = 'idea-002' and plan_version = '1'), 20::bigint, 'Clinic plan has twenty practical tasks');
select is((select count(*) from private.workspace_stage_definitions where idea_id = 'idea-001' and plan_version = '1'), 6::bigint, 'Pergola plan remains six stages');
select is((select count(*) from private.workspace_task_definitions where idea_id = 'idea-001' and plan_version = '1'), 14::bigint, 'Pergola plan remains fourteen tasks');

insert into auth.users (id, aud, role, email, encrypted_password, email_confirmed_at)
values
  ('00000000-0000-0000-0000-000000004b01', 'authenticated', 'authenticated', 'phase4b-starter@example.test', '', now()),
  ('00000000-0000-0000-0000-000000004b02', 'authenticated', 'authenticated', 'phase4b-full@example.test', '', now()),
  ('00000000-0000-0000-0000-000000004b03', 'authenticated', 'authenticated', 'phase4b-other@example.test', '', now());

insert into public.idea_access_grants (user_id, offer_code, idea_id, enabled, source)
values ('00000000-0000-0000-0000-000000004b01', 'starter-pergola-v1', 'idea-001', true, 'local_test');

insert into public.membership_entitlements (user_id, enabled, source, source_reference)
values ('00000000-0000-0000-0000-000000004b02', true, 'complimentary', 'phase4b-full');

set local role authenticated;
set local "request.jwt.claim.sub" = '00000000-0000-0000-0000-000000004b01';
select lives_ok($$insert into public.bookmarks (idea_id) values ('idea-002')$$, 'Pergola Starter can bookmark Clinic');
select throws_ok($$select public.start_member_project('idea-002')$$, '42501', 'Idea access required', 'Pergola Starter cannot create a Clinic project');
select lives_ok($$select public.start_member_project('idea-001')$$, 'Pergola Starter can still create its one starter project');
select is((select count(*) from public.projects), 1::bigint, 'starter sees only its Pergola project');

set local "request.jwt.claim.sub" = '00000000-0000-0000-0000-000000004b02';
select lives_ok($$select public.start_member_project('idea-002')$$, 'full member can create a Clinic project');
select is((select count(*) from public.projects), 1::bigint, 'full member has one visible Clinic project');
select is(public.start_member_project('idea-002'), (select id from public.projects where idea_id = 'idea-002'), 'Clinic project Start is idempotent');
select is((select count(*) from public.project_stages), 10::bigint, 'Clinic project creates ten stages');
select is((select count(*) from public.project_tasks), 20::bigint, 'Clinic project creates twenty tasks');
select is((select count(*) from public.project_stage_notes), 10::bigint, 'Clinic project creates one private note per stage');
select lives_ok($$select public.set_member_project_task_completed((select id from public.projects), 'clinic-opportunity', 'clinic-admin-workflow', true)$$, 'Clinic task progress persists');
select is((select saved_revision from public.save_member_project_stage_note((select id from public.projects), 'clinic-opportunity', 'Clinic discovery evidence', 0)), 1, 'Clinic stage notes persist with revision control');
select lives_ok($$select public.set_member_project_paused((select id from public.projects), true)$$, 'Clinic project can be paused');
select throws_ok($$select public.set_member_project_task_completed((select id from public.projects), 'clinic-opportunity', 'clinic-claim-boundary', true)$$, '55000', 'Resume the project before editing progress', 'paused Clinic project rejects progress edits');
select lives_ok($$select public.set_member_project_paused((select id from public.projects), false)$$, 'Clinic project can resume');
select throws_ok($$insert into public.bookmarks (idea_id) values ('idea-034')$$, '42501', null, 'unpublished ideas cannot be newly bookmarked');
select throws_ok($$select public.start_member_project('idea-034')$$, '22023', 'Project definition unavailable', 'even full members cannot start an unpublished idea');

reset role;
create temporary table phase4b_project_ids as select user_id, id from public.projects where idea_id = 'idea-002';
grant select on phase4b_project_ids to authenticated;

set local role authenticated;
set local "request.jwt.claim.sub" = '00000000-0000-0000-0000-000000004b03';
select is_empty($$select id from public.projects$$, 'another account cannot read the Clinic project');
select throws_ok($$select public.set_member_project_paused((select id from phase4b_project_ids), true)$$, 'P0002', 'Project unavailable', 'another account cannot mutate the Clinic project');

reset role;
select is((select count(*) from public.projects where user_id = '00000000-0000-0000-0000-000000004b02' and idea_id = 'idea-002'), 1::bigint, 'cross-user denial does not alter the stored Clinic project');

select * from finish();
rollback;
