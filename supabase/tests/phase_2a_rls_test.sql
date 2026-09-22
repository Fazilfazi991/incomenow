begin;
create extension if not exists pgtap with schema extensions;
select plan(18);

select has_table('public', 'profiles', 'profiles table exists');
select has_table('public', 'membership_entitlements', 'membership_entitlements table exists');

insert into auth.users (id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data)
values
  ('00000000-0000-0000-0000-0000000000a1', 'authenticated', 'authenticated', 'a@example.test', '', now(), '{"display_name":"User A"}'::jsonb),
  ('00000000-0000-0000-0000-0000000000b2', 'authenticated', 'authenticated', 'b@example.test', '', now(), '{}'::jsonb);

insert into public.membership_entitlements (user_id, enabled, source, source_reference)
values
  ('00000000-0000-0000-0000-0000000000a1', true, 'complimentary', 'operator-secret-a'),
  ('00000000-0000-0000-0000-0000000000b2', false, 'manual', 'operator-secret-b');

select is(
  (select count(*) from public.profiles where user_id = '00000000-0000-0000-0000-0000000000a1'),
  1::bigint,
  'auth user creation produces exactly one profile'
);
select is(
  (select display_name from public.profiles where user_id = '00000000-0000-0000-0000-0000000000a1'),
  'User A',
  'safe display metadata is copied into the profile'
);
select is(
  (select count(*) from auth.users as users left join public.profiles as profiles on profiles.user_id = users.id where profiles.user_id is null),
  0::bigint,
  'every existing auth user has a profile after the integration backfill'
);

set local role authenticated;
set local "request.jwt.claim.sub" = '00000000-0000-0000-0000-0000000000a1';

select is(
  current_user,
  'authenticated',
  'permission checks execute as the authenticated database role'
);
select is(
  (select auth.uid()),
  '00000000-0000-0000-0000-0000000000a1'::uuid,
  'permission checks execute with user A JWT identity'
);

select results_eq(
  'select user_id from public.profiles order by user_id',
  array['00000000-0000-0000-0000-0000000000a1'::uuid],
  'a member reads only their own profile'
);

update public.profiles set display_name = 'Updated A'
where user_id = '00000000-0000-0000-0000-0000000000a1';
select is(
  (select display_name from public.profiles where user_id = '00000000-0000-0000-0000-0000000000a1'),
  'Updated A',
  'a member can update their own display name'
);

select is_empty(
  $$update public.profiles set display_name = 'Hacked' where user_id = '00000000-0000-0000-0000-0000000000b2' returning user_id$$,
  'a member cannot update another profile'
);

select results_eq(
  'select user_id from public.membership_entitlements order by user_id',
  array['00000000-0000-0000-0000-0000000000a1'::uuid],
  'a member reads only their own entitlement'
);

select throws_ok(
  'select source_reference from public.membership_entitlements',
  '42501',
  null,
  'operator references are not selectable by members'
);
select throws_ok(
  $$insert into public.membership_entitlements (user_id, enabled, source) values ('00000000-0000-0000-0000-0000000000a1', true, 'manual')$$,
  '42501',
  null,
  'members cannot create entitlements'
);
select throws_ok(
  $$update public.membership_entitlements set enabled = false where user_id = '00000000-0000-0000-0000-0000000000a1'$$,
  '42501',
  null,
  'members cannot mutate entitlements'
);
select throws_ok(
  $$update public.profiles set user_id = '00000000-0000-0000-0000-0000000000b2' where user_id = '00000000-0000-0000-0000-0000000000a1'$$,
  '42501',
  null,
  'members cannot change profile ownership'
);

reset role;
set local role anon;
select throws_ok('select * from public.profiles', '42501', null, 'anonymous users cannot read profiles');
select throws_ok('select * from public.membership_entitlements', '42501', null, 'anonymous users cannot read entitlements');

reset role;
select is(
  (select display_name from public.profiles where user_id = '00000000-0000-0000-0000-0000000000b2'),
  null,
  'cross-user update did not change user B'
);

select * from finish();
rollback;
