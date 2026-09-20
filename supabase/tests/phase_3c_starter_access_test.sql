begin;
create extension if not exists pgtap with schema extensions;
select plan(48);

select has_table('public', 'idea_access_grants', 'per-idea grant table exists');
select has_function('private', 'account_has_active_idea_access', array['text'], 'idea access helper exists');
select has_function('private', 'account_can_access_project', array['uuid'], 'project access helper exists');
select has_function('public', 'start_member_project', array['text'], 'project creation remains a narrow RPC');

insert into auth.users (id, aud, role, email, encrypted_password, email_confirmed_at)
values
  ('00000000-0000-0000-0000-000000003c01', 'authenticated', 'authenticated', 'phase3c-free@example.test', '', now()),
  ('00000000-0000-0000-0000-000000003c02', 'authenticated', 'authenticated', 'phase3c-starter@example.test', '', now()),
  ('00000000-0000-0000-0000-000000003c03', 'authenticated', 'authenticated', 'phase3c-other@example.test', '', now()),
  ('00000000-0000-0000-0000-000000003c04', 'authenticated', 'authenticated', 'phase3c-expired@example.test', '', now());

insert into public.idea_access_grants (
  user_id, offer_code, idea_id, enabled, starts_at, expires_at, source, source_reference
)
values
  ('00000000-0000-0000-0000-000000003c02', 'starter-pergola-v1', 'idea-001', true, now() - interval '1 day', null, 'local_test', 'phase3c-starter'),
  ('00000000-0000-0000-0000-000000003c04', 'starter-pergola-v1', 'idea-001', true, now() - interval '2 days', now() - interval '1 day', 'local_test', 'phase3c-expired');

set local role authenticated;
set local "request.jwt.claim.sub" = '00000000-0000-0000-0000-000000003c01';

select is((select auth.uid()), '00000000-0000-0000-0000-000000003c01'::uuid, 'free-account checks use the expected identity');
select lives_ok($$insert into public.bookmarks (idea_id) values ('idea-001')$$, 'registered account can save a published idea');
select results_eq($$select idea_id from public.bookmarks$$, array['idea-001'::text], 'registered account reads its own bookmark');
select throws_ok(
  $$insert into public.idea_access_grants (user_id, offer_code, idea_id, enabled, source) values (auth.uid(), 'starter-pergola-v1', 'idea-001', true, 'manual')$$,
  '42501', null, 'ordinary accounts cannot create starter grants'
);
select throws_ok(
  $$update public.idea_access_grants set enabled = false where user_id = auth.uid()$$,
  '42501', null, 'ordinary accounts cannot mutate starter grants'
);
select throws_ok(
  $$select source_reference from public.idea_access_grants$$,
  '42501', null, 'privileged grant references are not selectable'
);
select throws_ok(
  $$select public.start_member_project('idea-001')$$,
  '42501', 'Idea access required', 'registered browsing does not grant project creation'
);

set local "request.jwt.claim.sub" = '00000000-0000-0000-0000-000000003c02';

select results_eq(
  $$select idea_id from public.idea_access_grants$$,
  array['idea-001'::text],
  'starter account reads its canonical idea grant'
);
select is((select count(*) from public.idea_access_grants), 1::bigint, 'starter account cannot read another account grant');
select lives_ok($$select public.start_member_project('idea-001')$$, 'starter account can start Pergola');
select is((select count(*) from public.projects), 1::bigint, 'starter account has exactly one visible project');
select is(
  public.start_member_project('idea-001'),
  (select id from public.projects where idea_id = 'idea-001'),
  'repeated starter creation returns the same project'
);
select is((select count(*) from public.projects), 1::bigint, 'repeated starter creation does not add a project');
select throws_ok(
  $$select public.start_member_project('idea-003')$$,
  '42501', 'Idea access required', 'starter cannot start a different idea'
);
select is((select count(*) from public.project_stages), 6::bigint, 'starter project creates the six immutable Pergola stages');
select is((select count(*) from public.project_tasks), 14::bigint, 'starter project creates the fourteen Pergola tasks');
select is((select count(*) from public.project_stage_notes), 6::bigint, 'starter project creates one private note per stage');
select lives_ok(
  $$select public.set_member_project_task_completed((select id from public.projects), 'crm-validate', 'region-segment', true)$$,
  'starter can persist task progress'
);
select is(
  (select saved_revision from public.save_member_project_stage_note((select id from public.projects), 'crm-validate', 'Starter evidence note', 0)),
  1,
  'starter can persist a revisioned private note'
);
select lives_ok(
  $$select public.set_member_project_paused((select id from public.projects), true)$$,
  'starter can pause its project'
);
select throws_ok(
  $$select public.set_member_project_task_completed((select id from public.projects), 'crm-validate', 'region-interviews', true)$$,
  '55000', 'Resume the project before editing progress', 'paused starter projects retain edit locks'
);
select lives_ok(
  $$select public.set_member_project_paused((select id from public.projects), false)$$,
  'starter can resume its project'
);

reset role;
create temporary table phase3c_project_ids as
select user_id, idea_id, id from public.projects;
grant select on phase3c_project_ids to authenticated;

set local role authenticated;
set local "request.jwt.claim.sub" = '00000000-0000-0000-0000-000000003c03';
select is_empty($$select id from public.projects$$, 'another account cannot read the starter project');
select throws_ok(
  $$select public.set_member_project_paused((select id from phase3c_project_ids where user_id = '00000000-0000-0000-0000-000000003c02'), true)$$,
  'P0002', 'Project unavailable', 'another account cannot mutate the starter project by ID'
);
select is_empty($$select idea_id from public.idea_access_grants$$, 'another account cannot read the starter grant');

reset role;
select throws_ok(
  $$insert into public.idea_access_grants (user_id, offer_code, idea_id, enabled, source) values ('00000000-0000-0000-0000-000000003c03', 'starter-pergola-v1', 'idea-003', true, 'local_test')$$,
  '23514', null, 'the starter offer cannot be rebound to another idea'
);
select throws_ok(
  $$insert into public.idea_access_grants (user_id, offer_code, idea_id, enabled, source) values ('00000000-0000-0000-0000-000000003c02', 'starter-pergola-v1', 'idea-001', true, 'local_test')$$,
  '23505', null, 'a duplicate starter grant cannot add another slot'
);

insert into public.membership_entitlements (user_id, enabled, source, source_reference)
values ('00000000-0000-0000-0000-000000003c02', true, 'complimentary', 'phase3c-upgrade');

set local role authenticated;
set local "request.jwt.claim.sub" = '00000000-0000-0000-0000-000000003c02';
select is(
  public.start_member_project('idea-001'),
  (select id from public.projects where idea_id = 'idea-001'),
  'full-membership upgrade reuses the starter project'
);
select lives_ok($$select public.start_member_project('idea-003')$$, 'full membership can start another included idea');
select is((select count(*) from public.projects), 2::bigint, 'full membership is not restricted to one total project');

reset role;
update public.membership_entitlements
set enabled = false
where user_id = '00000000-0000-0000-0000-000000003c02';

set local role authenticated;
set local "request.jwt.claim.sub" = '00000000-0000-0000-0000-000000003c02';
select results_eq(
  $$select idea_id from public.projects order by idea_id$$,
  array['idea-001'::text],
  'after full access removal the independent starter project remains accessible'
);
select is(
  (select content from public.project_stage_notes where stage_id = 'crm-validate'),
  'Starter evidence note',
  'starter note survives upgrade and full-access removal'
);

reset role;
update public.idea_access_grants
set revoked_at = now()
where user_id = '00000000-0000-0000-0000-000000003c02';

set local role authenticated;
set local "request.jwt.claim.sub" = '00000000-0000-0000-0000-000000003c02';
select is_empty($$select id from public.projects$$, 'revoked starter access hides protected project rows');
select throws_ok(
  $$select public.set_member_project_paused((select id from phase3c_project_ids where user_id = '00000000-0000-0000-0000-000000003c02'), true)$$,
  'P0002', 'Project unavailable', 'revoked starter access blocks project mutations'
);

reset role;
select is(
  (select count(*) from public.projects where user_id = '00000000-0000-0000-0000-000000003c02'),
  2::bigint,
  'revocation does not erase stored projects'
);
select is(
  (select content from public.project_stage_notes as note join public.projects as project on project.id = note.project_id where project.user_id = '00000000-0000-0000-0000-000000003c02' and note.stage_id = 'crm-validate'),
  'Starter evidence note',
  'revocation does not erase private notes'
);

set local role authenticated;
set local "request.jwt.claim.sub" = '00000000-0000-0000-0000-000000003c04';
select throws_ok(
  $$select public.start_member_project('idea-001')$$,
  '42501', 'Idea access required', 'expired starter grants fail closed'
);
select is_empty($$select id from public.projects$$, 'expired starter account cannot read another project');

reset role;
update public.idea_access_grants
set revoked_at = null
where user_id = '00000000-0000-0000-0000-000000003c02';

set local role authenticated;
set local "request.jwt.claim.sub" = '00000000-0000-0000-0000-000000003c02';
select is(
  (select id from public.projects where idea_id = 'idea-001'),
  (select id from phase3c_project_ids where user_id = '00000000-0000-0000-0000-000000003c02'),
  'restoring starter access reveals the same original project'
);
select is(
  (select completed_at is not null from public.project_tasks where stage_id = 'crm-validate' and task_id = 'region-segment'),
  true,
  'restoring starter access preserves task progress'
);
select is((select count(*) from public.projects), 1::bigint, 'restored starter access does not reveal the former full-only project');

reset role;
set local role anon;
select throws_ok($$select * from public.idea_access_grants$$, '42501', null, 'anonymous users cannot read idea grants');
select throws_ok($$select * from public.bookmarks$$, '42501', null, 'anonymous users cannot read account bookmarks');
select throws_ok($$select public.start_member_project('idea-001')$$, '42501', null, 'anonymous users cannot invoke project creation');

reset role;
select * from finish();
rollback;
