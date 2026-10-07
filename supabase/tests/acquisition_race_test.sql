begin;
create extension if not exists pgtap with schema extensions;
select plan(33);

select has_table('public', 'acquisition_sources', 'acquisition sources exist');
select has_table('public', 'acquisition_visitors', 'anonymous visitors exist');
select has_table('public', 'acquisition_user_attribution', 'account attribution exists');
select has_table('public', 'acquisition_payments', 'provider-neutral payment ledger exists');
select has_function('public', 'capture_acquisition_visit', array['uuid','uuid','text','text','text','text','text'], 'visit capture RPC exists');
select has_function('public', 'get_acquisition_race', array['timestamp with time zone','timestamp with time zone','text'], 'admin aggregate RPC exists');

insert into auth.users (id, aud, role, email, encrypted_password, email_confirmed_at)
values
  ('00000000-0000-0000-0000-00000000ac01', 'authenticated', 'authenticated', 'race-a@example.test', '', now()),
  ('00000000-0000-0000-0000-00000000ac02', 'authenticated', 'authenticated', 'race-direct@example.test', '', now()),
  ('00000000-0000-0000-0000-00000000ac03', 'authenticated', 'authenticated', 'race-admin@example.test', '', now());

insert into public.acquisition_admins (user_id) values ('00000000-0000-0000-0000-00000000ac03');

set local role anon;
select lives_ok(
  $$select public.capture_acquisition_visit(
    '10000000-0000-0000-0000-00000000ac01', '20000000-0000-0000-0000-00000000ac01',
    'team_a', 'primary.example.test', '/?src=team_a', null, repeat('a', 64)
  )$$,
  'anonymous Team A first touch is accepted'
);
select lives_ok(
  $$select public.capture_acquisition_visit(
    '10000000-0000-0000-0000-00000000ac01', '20000000-0000-0000-0000-00000000ac02',
    'team_b', 'other.example.test', '/later?src=team_b', null, repeat('a', 64)
  )$$,
  'later Team B visit is accepted without replacing first touch'
);
select lives_ok(
  $$select public.capture_acquisition_visit(
    '10000000-0000-0000-0000-00000000ac02', '20000000-0000-0000-0000-00000000ac03',
    null, 'primary.example.test', '/', null, repeat('b', 64)
  )$$,
  'direct visitor remains explicitly unattributed'
);
select throws_ok($$select * from public.acquisition_visitors$$, '42501', null, 'anonymous callers cannot read visitor records');

reset role;
select is(
  (select source_key from public.acquisition_sources where id = (select first_source_id from public.acquisition_visitors where visitor_id = '10000000-0000-0000-0000-00000000ac01')),
  'team_a',
  'later sources cannot overwrite the first source'
);
select is(
  (select first_source_id from public.acquisition_visitors where visitor_id = '10000000-0000-0000-0000-00000000ac02'),
  null,
  'direct first touch stays unattributed'
);

set local role authenticated;
set local "request.jwt.claim.sub" = '00000000-0000-0000-0000-00000000ac01';
select ok(public.lock_acquisition_user_attribution('10000000-0000-0000-0000-00000000ac01'), 'anonymous attribution transfers on first authenticated lock');
select is(public.lock_acquisition_user_attribution('10000000-0000-0000-0000-00000000ac02'), false, 'a second lock attempt cannot overwrite account attribution');
select throws_ok(
  $$update public.acquisition_user_attribution set source_id = null where user_id = auth.uid()$$,
  '42501', null, 'ordinary accounts cannot edit locked attribution'
);

set local "request.jwt.claim.sub" = '00000000-0000-0000-0000-00000000ac02';
select ok(public.lock_acquisition_user_attribution('10000000-0000-0000-0000-00000000ac02'), 'direct visitor can lock safely without a fabricated source');

reset role;
select is(
  (select source_key from public.acquisition_sources where id = (select source_id from public.acquisition_user_attribution where user_id = '00000000-0000-0000-0000-00000000ac01')),
  'team_a',
  'registered attribution is permanently Team A'
);
select is(
  (select source_id from public.acquisition_user_attribution where user_id = '00000000-0000-0000-0000-00000000ac02'),
  null,
  'unattributed account remains unattributed'
);

set local role service_role;
set local "request.jwt.claim.role" = 'service_role';
select ok(public.record_acquisition_payment_event(
  'test_provider', 'event-1', 'transaction-1', '00000000-0000-0000-0000-00000000ac01',
  'starter_1', 'succeeded', true, 'USD', 100, 0, now()
), '$1 payment event is recorded');
select is(public.record_acquisition_payment_event(
  'test_provider', 'event-1', 'transaction-1', '00000000-0000-0000-0000-00000000ac01',
  'starter_1', 'succeeded', true, 'USD', 100, 0, now()
), false, 'duplicate webhook event is ignored');
select ok(public.record_acquisition_payment_event(
  'test_provider', 'event-2', 'transaction-2', '00000000-0000-0000-0000-00000000ac01',
  'membership_29', 'succeeded', true, 'USD', 2900, 0, now()
), '$29 upgrade is recorded');
select ok(public.record_acquisition_payment_event(
  'test_provider', 'event-3', 'transaction-2', '00000000-0000-0000-0000-00000000ac01',
  'membership_29', 'partially_refunded', true, 'USD', 2900, 500, now()
), 'refund event updates the existing transaction');

reset role;
select is((select count(*) from public.acquisition_payments), 2::bigint, 'duplicate webhook did not duplicate revenue');
select is((select sum(gross_amount_cents) from public.acquisition_payments), 3000::bigint, 'gross revenue uses confirmed transactions');
select is((select sum(gross_amount_cents - refunded_amount_cents) from public.acquisition_payments), 2500::bigint, 'net revenue subtracts refunds');
select is(
  (select source_key from public.acquisition_sources where id = (select source_id from public.acquisition_payments where transaction_id = 'transaction-2')),
  'team_a',
  'payment snapshots the locked Team A source server-side'
);

set local role service_role;
set local "request.jwt.claim.role" = 'service_role';
select ok(public.record_acquisition_payment_event(
  'test_provider', 'event-testmode', 'transaction-testmode', '00000000-0000-0000-0000-00000000ac01',
  'starter_1', 'succeeded', false, 'USD', 10000, 0, now()
), 'test-mode payment is retained for diagnosis but excluded from competition metrics');

reset role;
set local role authenticated;
set local "request.jwt.claim.sub" = '00000000-0000-0000-0000-00000000ac01';
select throws_ok(
  $$select public.get_acquisition_race(now() - interval '1 day', now() + interval '1 day', 'hour')$$,
  '42501', 'Admin access required', 'non-admin accounts cannot read race aggregates'
);

set local "request.jwt.claim.sub" = '00000000-0000-0000-0000-00000000ac03';
select is(
  ((public.get_acquisition_race(now() - interval '1 day', now() + interval '1 day', 'hour') -> 'teams' -> 0) ? 'net_revenue_cents'),
  true,
  'admin leaderboard returns aggregate metrics'
);
select is(
  (select (team ->> 'starter_sales')::integer from jsonb_array_elements(public.get_acquisition_race(now() - interval '1 day', now() + interval '1 day', 'hour') -> 'teams') team where team ->> 'source_key' = 'team_a'),
  1,
  'leaderboard attributes one starter sale to Team A'
);
select is(
  (select (team ->> 'membership_sales')::integer from jsonb_array_elements(public.get_acquisition_race(now() - interval '1 day', now() + interval '1 day', 'hour') -> 'teams') team where team ->> 'source_key' = 'team_a'),
  1,
  'leaderboard attributes one membership upgrade to Team A'
);
select is(
  (select (team ->> 'net_revenue_cents')::integer from jsonb_array_elements(public.get_acquisition_race(now() - interval '1 day', now() + interval '1 day', 'hour') -> 'teams') team where team ->> 'source_key' = 'team_a'),
  2500,
  'leaderboard uses net revenue after refund'
);
select is(
  (select (team ->> 'net_revenue_cents')::integer from jsonb_array_elements(public.get_acquisition_race(now() - interval '2 days', now() - interval '1 day', 'day') -> 'teams') team where team ->> 'source_key' = 'team_a'),
  0,
  'date filtering excludes events outside the requested window'
);

reset role;
select * from finish();
rollback;
