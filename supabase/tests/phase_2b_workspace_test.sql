begin;
create extension if not exists pgtap with schema extensions;
select plan(55);

select has_table('public', 'bookmarks', 'bookmarks table exists');
select has_table('public', 'projects', 'projects table exists');
select has_table('public', 'project_stages', 'project stages table exists');
select has_table('public', 'project_tasks', 'project tasks table exists');
select has_table('public', 'project_stage_notes', 'project stage notes table exists');
select has_function('public', 'start_member_project', array['text'], 'atomic project-start function exists');
select has_function('public', 'set_member_project_paused', array['uuid', 'boolean'], 'pause function exists');
select has_function('public', 'set_member_project_task_completed', array['uuid', 'text', 'text', 'boolean'], 'task function exists');
select has_function('public', 'save_member_project_stage_note', array['uuid', 'text', 'text', 'integer'], 'revisioned note function exists');

insert into auth.users (id, aud, role, email, encrypted_password, email_confirmed_at)
values
  ('00000000-0000-0000-0000-0000000002a1', 'authenticated', 'authenticated', 'phase2b-a@example.test', '', now()),
  ('00000000-0000-0000-0000-0000000002b2', 'authenticated', 'authenticated', 'phase2b-b@example.test', '', now());

insert into public.membership_entitlements (user_id, enabled, source, source_reference)
values
  ('00000000-0000-0000-0000-0000000002a1', true, 'complimentary', 'phase-2b-test-a'),
  ('00000000-0000-0000-0000-0000000002b2', true, 'complimentary', 'phase-2b-test-b');

set local role authenticated;
set local "request.jwt.claim.sub" = '00000000-0000-0000-0000-0000000002a1';

select is(current_user, 'authenticated', 'workspace permission checks run as authenticated');
select is((select auth.uid()), '00000000-0000-0000-0000-0000000002a1'::uuid, 'workspace permission checks use user A JWT');
select lives_ok($$insert into public.bookmarks (idea_id) values ('idea-001')$$, 'A can save a valid idea');
select results_eq(
  $$select idea_id from public.bookmarks order by idea_id$$,
  array['idea-001'::text],
  'A reads only its own saved idea'
);
select throws_ok(
  $$insert into public.bookmarks (idea_id) values ('idea-001')$$,
  '23505',
  null,
  'database uniqueness prevents duplicate bookmarks'
);
select throws_ok(
  $$insert into public.bookmarks (user_id, idea_id) values ('00000000-0000-0000-0000-0000000002b2', 'idea-003')$$,
  '42501',
  null,
  'members cannot forge bookmark ownership'
);
select throws_ok(
  $$update private.workspace_plan_versions set is_current = false where idea_id = 'idea-001'$$,
  '42501',
  null,
  'members cannot edit trusted plan definitions'
);
select lives_ok($$select public.start_member_project('idea-001')$$, 'A can start a project from an approved plan');
select is((select count(*) from public.projects where idea_id = 'idea-001'), 1::bigint, 'one project is created');
select is((select count(*) from public.project_stages), 6::bigint, 'all six project stages are created');
select is((select count(*) from public.project_tasks), 14::bigint, 'all fourteen project tasks are created');
select is((select count(*) from public.project_stage_notes), 6::bigint, 'one empty note row is created per stage');
select is(
  public.start_member_project('idea-001'),
  (select id from public.projects where idea_id = 'idea-001'),
  'starting the same idea returns the existing project'
);
select is((select count(*) from public.projects where idea_id = 'idea-001'), 1::bigint, 'idempotent start still leaves one project');

set local "request.jwt.claim.sub" = '00000000-0000-0000-0000-0000000002b2';
select lives_ok($$select public.start_member_project('idea-003')$$, 'B can start its own project');

reset role;
create temporary table phase2b_project_ids as
select user_id, idea_id, id from public.projects;
grant select on phase2b_project_ids to authenticated;

set local role authenticated;
set local "request.jwt.claim.sub" = '00000000-0000-0000-0000-0000000002a1';
select is((select count(*) from public.projects), 1::bigint, 'A cannot read B projects');
select throws_ok(
  $$select public.set_member_project_paused((select id from phase2b_project_ids where user_id = '00000000-0000-0000-0000-0000000002b2'), true)$$,
  'P0002',
  'Project unavailable',
  'A cannot mutate B project by identifier'
);
select lives_ok(
  $$select public.set_member_project_paused((select id from public.projects where idea_id = 'idea-001'), true)$$,
  'A can pause its incomplete project'
);
select throws_ok(
  $$select public.set_member_project_task_completed((select id from public.projects where idea_id = 'idea-001'), 'crm-validate', 'region-segment', true)$$,
  '55000',
  'Resume the project before editing progress',
  'paused projects reject task edits'
);
select throws_ok(
  $$select * from public.save_member_project_stage_note((select id from public.projects where idea_id = 'idea-001'), 'crm-validate', repeat('n', 12), 0)$$,
  '55000',
  'Resume the project before editing notes',
  'paused projects reject note edits'
);
select lives_ok(
  $$select public.set_member_project_paused((select id from public.projects where idea_id = 'idea-001'), false)$$,
  'A can resume its project'
);
select lives_ok(
  $$select public.set_member_project_task_completed((select id from public.projects where idea_id = 'idea-001'), 'crm-validate', 'region-segment', true)$$,
  'A can complete a task after resuming'
);
select ok(
  (select completed_at is not null from public.project_tasks where stage_id = 'crm-validate' and task_id = 'region-segment'),
  'task completion stores a server timestamp'
);
select is(
  (select saved_revision from public.save_member_project_stage_note(
    (select id from public.projects where idea_id = 'idea-001'),
    'crm-validate',
    repeat('n', 12),
    0
  )),
  1,
  'a note save advances its revision after database confirmation'
);
select throws_ok(
  $$select * from public.save_member_project_stage_note((select id from public.projects where idea_id = 'idea-001'), 'crm-validate', repeat('s', 8), 0)$$,
  '40001',
  'The saved note changed in another session',
  'stale note revisions are rejected'
);
select throws_ok(
  $$select public.set_member_project_task_completed((select id from public.projects where idea_id = 'idea-001'), 'crm-validate', 'not-a-task', true)$$,
  'P0002',
  'Task unavailable',
  'invalid task identifiers fail closed'
);
select throws_ok(
  $$update public.projects set paused_at = now() where idea_id = 'idea-001'$$,
  '42501',
  null,
  'members cannot directly update project state'
);
select throws_ok(
  $$insert into public.project_tasks (project_id, idea_id, plan_version, stage_id, task_id, position) values ((select id from public.projects where idea_id = 'idea-001'), 'idea-001', '1', 'crm-validate', 'forged', 99)$$,
  '42501',
  null,
  'members cannot attach arbitrary tasks'
);

reset role;
select throws_ok(
  $$insert into public.project_tasks (project_id, idea_id, plan_version, stage_id, task_id, position) values ((select id from public.projects where user_id = '00000000-0000-0000-0000-0000000002a1' and idea_id = 'idea-001'), 'idea-001', '1', 'crm-validate', 'scope-sheet', 99)$$,
  '23503',
  null,
  'foreign keys reject a task attached to the wrong stage'
);

update public.membership_entitlements
set enabled = false
where user_id = '00000000-0000-0000-0000-0000000002a1';

set local role authenticated;
set local "request.jwt.claim.sub" = '00000000-0000-0000-0000-0000000002a1';
select is_empty('select idea_id from public.bookmarks', 'inactive membership hides saved records without deleting them');
select is_empty('select id from public.projects', 'inactive membership hides projects without deleting them');
select throws_ok(
  $$insert into public.bookmarks (idea_id) values ('idea-003')$$,
  '42501',
  null,
  'inactive membership blocks new bookmark operations'
);
select throws_ok(
  $$select public.start_member_project('idea-004')$$,
  '42501',
  'Active membership required',
  'inactive membership blocks project operations'
);

reset role;
update public.membership_entitlements
set enabled = true
where user_id = '00000000-0000-0000-0000-0000000002a1';

set local role authenticated;
set local "request.jwt.claim.sub" = '00000000-0000-0000-0000-0000000002a1';
select results_eq('select idea_id from public.bookmarks', array['idea-001'::text], 'restored membership reveals the same bookmark');
select is((select count(*) from public.projects), 1::bigint, 'restored membership reveals the same project');
select is(
  (select content from public.project_stage_notes where stage_id = 'crm-validate'),
  repeat('n', 12),
  'restored membership preserves the saved stage note'
);

reset role;
update private.workspace_plan_versions set is_current = false where idea_id = 'idea-001';
insert into private.workspace_plan_versions (idea_id, version, is_current) values ('idea-001', '2', true);
insert into private.workspace_stage_definitions (idea_id, plan_version, stage_id, position)
values ('idea-001', '2', 'crm-v2-stage', 1);
insert into private.workspace_task_definitions (idea_id, plan_version, stage_id, task_id, position, required)
values ('idea-001', '2', 'crm-v2-stage', 'crm-v2-task', 1, true);

set local role authenticated;
set local "request.jwt.claim.sub" = '00000000-0000-0000-0000-0000000002b2';
select lives_ok($$select public.start_member_project('idea-001')$$, 'a controlled version-two project can be started');

set local "request.jwt.claim.sub" = '00000000-0000-0000-0000-0000000002a1';
select is((select plan_version from public.projects where idea_id = 'idea-001'), '1', 'existing projects retain plan version one');

set local "request.jwt.claim.sub" = '00000000-0000-0000-0000-0000000002b2';
select is((select plan_version from public.projects where idea_id = 'idea-001'), '2', 'new projects use controlled plan version two');

reset role;
insert into private.workspace_plan_versions (idea_id, version, is_current) values ('idea-005', '1', true);
insert into private.workspace_stage_definitions (idea_id, plan_version, stage_id, position)
values ('idea-005', '1', 'broken-stage', 1);
insert into private.workspace_task_definitions (idea_id, plan_version, stage_id, task_id, position, required)
values ('idea-005', '1', 'broken-stage', 'optional-task', 1, false);

set local role authenticated;
set local "request.jwt.claim.sub" = '00000000-0000-0000-0000-0000000002a1';
select throws_ok(
  $$select public.start_member_project('idea-005')$$,
  '22023',
  'Project definition unavailable',
  'a plan without required tasks is rejected'
);

reset role;
select is(
  (select count(*) from public.projects where user_id = '00000000-0000-0000-0000-0000000002a1' and idea_id = 'idea-005'),
  0::bigint,
  'failed project creation leaves no partial project'
);

set local role anon;
select throws_ok('select * from public.bookmarks', '42501', null, 'anonymous users cannot read bookmarks');
select throws_ok('select * from public.projects', '42501', null, 'anonymous users cannot read projects');
select throws_ok($$select public.start_member_project('idea-001')$$, '42501', null, 'anonymous users cannot invoke project creation');

reset role;
set local role authenticated;
set local "request.jwt.claim.sub" = '00000000-0000-0000-0000-0000000002a1';
select lives_ok($$delete from public.bookmarks where idea_id = 'idea-001'$$, 'A can remove its own bookmark');
select is_empty('select idea_id from public.bookmarks', 'removed bookmark is no longer returned');

reset role;
select * from finish();
rollback;
