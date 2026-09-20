begin;
create extension if not exists pgtap with schema extensions;
select plan(44);

select has_table('public', 'account_preferences', 'account preferences table exists');
select has_function('public', 'save_account_preferences', array['text[]', 'text', 'text', 'integer', 'boolean'], 'validated preference save function exists');
select has_function('public', 'skip_account_onboarding', array['integer'], 'onboarding skip function exists');
select has_column('public', 'account_preferences', 'onboarding_state', 'onboarding state is stored');
select has_column('public', 'account_preferences', 'revision', 'revision is stored');
select ok(has_table_privilege('authenticated', 'public.account_preferences', 'select'), 'authenticated accounts receive select permission');
select ok(not has_table_privilege('authenticated', 'public.account_preferences', 'insert'), 'authenticated accounts do not receive direct insert permission');

insert into auth.users (id, aud, role, email, encrypted_password, email_confirmed_at)
values
  ('00000000-0000-0000-0000-0000000003a1', 'authenticated', 'authenticated', 'phase3b-a@example.test', '', now()),
  ('00000000-0000-0000-0000-0000000003b2', 'authenticated', 'authenticated', 'phase3b-b@example.test', '', now()),
  ('00000000-0000-0000-0000-0000000003c3', 'authenticated', 'authenticated', 'phase3b-c@example.test', '', now());

set local role authenticated;
set local "request.jwt.claim.sub" = '00000000-0000-0000-0000-0000000003a1';
select is(current_user, 'authenticated', 'preference checks run as authenticated');
select is((select auth.uid()), '00000000-0000-0000-0000-0000000003a1'::uuid, 'preference checks use account A identity');
select lives_ok(
  $$select * from public.save_account_preferences(array['custom-crm','automation'], 'adapting-tools', 'client-service', 0, true)$$,
  'an account can save valid preferences without membership'
);
select is((select interest_categories from public.account_preferences), array['custom-crm','automation']::text[], 'selected interests are stored');
select is((select experience_level from public.account_preferences), 'adapting-tools', 'experience is stored');
select is((select preferred_approach from public.account_preferences), 'client-service', 'approach is stored');
select is((select onboarding_state from public.account_preferences), 'completed', 'saving onboarding marks it complete');
select is((select revision from public.account_preferences), 1, 'the first save advances revision');

set local "request.jwt.claim.sub" = '00000000-0000-0000-0000-0000000003b2';
select lives_ok(
  $$select * from public.save_account_preferences('{}'::text[], null, null, 0, true)$$,
  'all optional answers may be empty'
);
select is((select cardinality(interest_categories) from public.account_preferences), 0, 'account B keeps an intentionally empty selection');

set local "request.jwt.claim.sub" = '00000000-0000-0000-0000-0000000003a1';
select is((select count(*) from public.account_preferences), 1::bigint, 'account A reads only its own row');
select throws_ok(
  $$select * from public.save_account_preferences(array['unknown'], null, null, 1, false)$$,
  '22023', 'Invalid account preferences', 'unknown interests are rejected'
);
select throws_ok(
  $$select * from public.save_account_preferences(array['automation','automation'], null, null, 1, false)$$,
  '22023', 'Invalid account preferences', 'duplicate interests are rejected'
);
select throws_ok(
  $$select * from public.save_account_preferences('{}'::text[], 'expert', null, 1, false)$$,
  '22023', 'Invalid account preferences', 'unknown experience is rejected'
);
select throws_ok(
  $$select * from public.save_account_preferences('{}'::text[], null, 'passive-income', 1, false)$$,
  '22023', 'Invalid account preferences', 'unknown approach is rejected'
);
select throws_ok(
  $$select * from public.save_account_preferences('{}'::text[], null, null, 0, false)$$,
  '40001', 'Preferences changed in another session', 'stale preference revisions are rejected'
);
select throws_ok(
  $$insert into public.account_preferences (user_id) values ('00000000-0000-0000-0000-0000000003a1')$$,
  '42501', null, 'direct inserts are denied'
);
select throws_ok(
  $$update public.account_preferences set onboarding_state = 'skipped' where user_id = '00000000-0000-0000-0000-0000000003a1'$$,
  '42501', null, 'direct updates are denied'
);
select throws_ok(
  $$delete from public.account_preferences where user_id = '00000000-0000-0000-0000-0000000003a1'$$,
  '42501', null, 'direct deletes are denied'
);
select lives_ok($$select * from public.skip_account_onboarding(1)$$, 'skipping an already completed onboarding is harmless');
select is((select revision from public.account_preferences), 1, 'an idempotent completed skip does not advance revision');

set local "request.jwt.claim.sub" = '00000000-0000-0000-0000-0000000003c3';
select lives_ok($$select * from public.skip_account_onboarding(0)$$, 'a new account can skip onboarding');
select is((select onboarding_state from public.account_preferences), 'skipped', 'skip state is recorded');
select is((select cardinality(interest_categories) from public.account_preferences), 0, 'skipping does not invent selections');
select is((select revision from public.account_preferences), 1, 'the initial skip advances revision');
select lives_ok(
  $$select * from public.save_account_preferences(array['web-tool'], null, 'exploring', 1, false)$$,
  'settings can save after onboarding was skipped'
);
select is((select onboarding_state from public.account_preferences), 'skipped', 'a settings save preserves skipped state');
select is((select revision from public.account_preferences), 2, 'a settings save advances revision');
select throws_ok(
  $$select * from public.skip_account_onboarding(1)$$,
  '40001', 'Preferences changed in another session', 'a stale skip is rejected'
);
select lives_ok(
  $$select * from public.save_account_preferences(array['web-tool'], null, 'exploring', 2, true)$$,
  'revisiting onboarding can explicitly complete it'
);
select is((select onboarding_state from public.account_preferences), 'completed', 'revisited onboarding becomes completed');

reset role;
set local role anon;
select throws_ok('select * from public.account_preferences', '42501', null, 'anonymous visitors cannot read preferences');
select throws_ok(
  $$select * from public.save_account_preferences('{}'::text[], null, null, 0, true)$$,
  '42501', null, 'anonymous visitors cannot invoke preference saves'
);

reset role;
set local role authenticated;
set local "request.jwt.claim.sub" = '';
select throws_ok(
  $$select * from public.save_account_preferences('{}'::text[], null, null, 0, true)$$,
  '42501', 'Verified account required', 'a verified account identity is required'
);

reset role;
select is(
  (select count(*) from public.membership_entitlements where user_id = '00000000-0000-0000-0000-0000000003a1'),
  0::bigint,
  'preference saves do not create membership entitlements'
);
select ok(
  (select updated_at >= created_at from public.account_preferences where user_id = '00000000-0000-0000-0000-0000000003c3'),
  'preference timestamps are server managed'
);
select is(
  (select user_id from public.account_preferences where user_id = '00000000-0000-0000-0000-0000000003a1'),
  '00000000-0000-0000-0000-0000000003a1'::uuid,
  'saved preferences remain owned by the authenticated account'
);

select * from finish();
rollback;
