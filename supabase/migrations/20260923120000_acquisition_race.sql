create table public.acquisition_sources (
  id uuid primary key default gen_random_uuid(),
  source_key text not null unique check (source_key ~ '^[a-z0-9][a-z0-9_-]{1,49}$'),
  display_name text not null check (char_length(display_name) between 1 and 80),
  team_member_name text not null check (char_length(team_member_name) between 1 and 100),
  domain text unique check (domain is null or (domain = lower(domain) and domain !~ '[/\\:]' and char_length(domain) <= 253)),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.acquisition_sources is 'Configurable acquisition teams and domains. Domain changes never require tracking-code changes.';
comment on column public.acquisition_sources.domain is 'Lowercase hostname only, without scheme, port, path, or www normalization.';

insert into public.acquisition_sources (source_key, display_name, team_member_name, domain)
values
  ('team_a', 'Team A', 'Team A', null),
  ('team_b', 'Team B', 'Team B', null),
  ('team_c', 'Team C', 'Team C', null)
on conflict (source_key) do nothing;

create table public.acquisition_visitors (
  visitor_id uuid primary key,
  first_source_id uuid references public.acquisition_sources(id) on delete set null,
  first_domain text check (first_domain is null or char_length(first_domain) <= 253),
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  first_landing_path text not null check (char_length(first_landing_path) between 1 and 500),
  first_referrer text check (first_referrer is null or char_length(first_referrer) <= 500),
  user_agent_hash text check (user_agent_hash is null or char_length(user_agent_hash) = 64),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.acquisition_sessions (
  id uuid primary key,
  visitor_id uuid not null references public.acquisition_visitors(visitor_id) on delete cascade,
  source_id uuid references public.acquisition_sources(id) on delete set null,
  started_at timestamptz not null default now(),
  last_activity_at timestamptz not null default now(),
  landing_path text not null check (char_length(landing_path) between 1 and 500),
  last_path text not null check (char_length(last_path) between 1 and 500),
  referrer text check (referrer is null or char_length(referrer) <= 500),
  pageview_count integer not null default 1 check (pageview_count > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.acquisition_user_attribution (
  user_id uuid primary key references auth.users(id) on delete cascade,
  visitor_id uuid references public.acquisition_visitors(visitor_id) on delete set null,
  source_id uuid references public.acquisition_sources(id) on delete set null,
  first_domain text check (first_domain is null or char_length(first_domain) <= 253),
  registered_at timestamptz not null,
  attributed_at timestamptz,
  locked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.acquisition_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table public.acquisition_payments (
  id uuid primary key default gen_random_uuid(),
  provider text not null check (provider ~ '^[a-z0-9][a-z0-9_-]{1,49}$'),
  transaction_id text not null check (char_length(transaction_id) between 1 and 200),
  user_id uuid not null references auth.users(id) on delete restrict,
  source_id uuid references public.acquisition_sources(id) on delete set null,
  offer_kind text not null check (offer_kind in ('starter_1', 'membership_29')),
  status text not null check (status in ('succeeded', 'partially_refunded', 'refunded')),
  livemode boolean not null,
  currency text not null check (currency = 'USD'),
  gross_amount_cents integer not null check (gross_amount_cents >= 0),
  refunded_amount_cents integer not null default 0 check (refunded_amount_cents >= 0 and refunded_amount_cents <= gross_amount_cents),
  refunded_at timestamptz,
  occurred_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (provider, transaction_id)
);

create table public.acquisition_webhook_events (
  provider text not null,
  event_id text not null,
  received_at timestamptz not null default now(),
  primary key (provider, event_id)
);

create index acquisition_visitors_source_seen_idx on public.acquisition_visitors (first_source_id, first_seen_at);
create index acquisition_visitors_last_seen_idx on public.acquisition_visitors (last_seen_at);
create index acquisition_sessions_visitor_started_idx on public.acquisition_sessions (visitor_id, started_at);
create index acquisition_sessions_source_started_idx on public.acquisition_sessions (source_id, started_at);
create index acquisition_user_attribution_source_registered_idx on public.acquisition_user_attribution (source_id, registered_at);
create index acquisition_user_attribution_visitor_idx on public.acquisition_user_attribution (visitor_id);
create index acquisition_payments_user_occurred_idx on public.acquisition_payments (user_id, occurred_at);
create index acquisition_payments_source_occurred_idx on public.acquisition_payments (source_id, occurred_at);
create index acquisition_payments_status_occurred_idx on public.acquisition_payments (status, occurred_at);
create index acquisition_payments_refunded_at_idx on public.acquisition_payments (source_id, refunded_at) where refunded_at is not null;

alter table public.acquisition_sources enable row level security;
alter table public.acquisition_visitors enable row level security;
alter table public.acquisition_sessions enable row level security;
alter table public.acquisition_user_attribution enable row level security;
alter table public.acquisition_admins enable row level security;
alter table public.acquisition_payments enable row level security;
alter table public.acquisition_webhook_events enable row level security;

revoke all on table public.acquisition_sources from anon, authenticated;
revoke all on table public.acquisition_visitors from anon, authenticated;
revoke all on table public.acquisition_sessions from anon, authenticated;
revoke all on table public.acquisition_user_attribution from anon, authenticated;
revoke all on table public.acquisition_admins from anon, authenticated;
revoke all on table public.acquisition_payments from anon, authenticated;
revoke all on table public.acquisition_webhook_events from anon, authenticated;

create trigger acquisition_sources_set_updated_at before update on public.acquisition_sources
for each row execute function private.set_updated_at();
create trigger acquisition_visitors_set_updated_at before update on public.acquisition_visitors
for each row execute function private.set_updated_at();
create trigger acquisition_sessions_set_updated_at before update on public.acquisition_sessions
for each row execute function private.set_updated_at();
create trigger acquisition_user_attribution_set_updated_at before update on public.acquisition_user_attribution
for each row execute function private.set_updated_at();
create trigger acquisition_payments_set_updated_at before update on public.acquisition_payments
for each row execute function private.set_updated_at();

create or replace function private.is_acquisition_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select (select auth.uid()) is not null
    and exists (
      select 1 from public.acquisition_admins
      where user_id = (select auth.uid())
    );
$$;

create or replace function public.is_acquisition_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$ select private.is_acquisition_admin(); $$;

create or replace function private.create_acquisition_attribution_for_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.acquisition_user_attribution (user_id, registered_at)
  values (new.id, new.created_at)
  on conflict (user_id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created_create_acquisition_attribution
after insert on auth.users
for each row execute function private.create_acquisition_attribution_for_new_user();

insert into public.acquisition_user_attribution (user_id, registered_at, locked_at)
select id, created_at, now()
from auth.users
on conflict (user_id) do nothing;

create or replace function public.capture_acquisition_visit(
  p_visitor_id uuid,
  p_session_id uuid,
  p_source_key text,
  p_hostname text,
  p_landing_path text,
  p_referrer text,
  p_user_agent_hash text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  detected_source_id uuid;
  detected_domain text;
  normalized_host text := lower(split_part(coalesce(p_hostname, ''), ':', 1));
  safe_path text := left(coalesce(nullif(p_landing_path, ''), '/'), 500);
  existing_source_id uuid;
  inserted_visitor boolean := false;
  counted_pageview boolean := false;
begin
  if p_visitor_id is null or p_session_id is null or safe_path !~ '^/'
    or p_user_agent_hash is null or p_user_agent_hash !~ '^[0-9a-f]{64}$' then
    raise exception 'Invalid acquisition visit' using errcode = '22023';
  end if;

  select id, domain into detected_source_id, detected_domain
  from public.acquisition_sources
  where active
    and (
      (p_source_key is not null and source_key = lower(p_source_key))
      or (domain is not null and domain = normalized_host)
    )
  order by case when p_source_key is not null and source_key = lower(p_source_key) then 0 else 1 end
  limit 1;

  if p_source_key is not null and detected_source_id is null then
    raise log 'acquisition unknown source encountered';
  end if;

  insert into public.acquisition_visitors (
    visitor_id, first_source_id, first_domain, first_landing_path, first_referrer, user_agent_hash
  ) values (
    p_visitor_id,
    detected_source_id,
    coalesce(detected_domain, nullif(normalized_host, '')),
    safe_path,
    left(nullif(p_referrer, ''), 500),
    p_user_agent_hash
  )
  on conflict (visitor_id) do nothing;
  inserted_visitor := found;

  update public.acquisition_visitors
  set last_seen_at = now()
  where visitor_id = p_visitor_id
  returning first_source_id into existing_source_id;

  insert into public.acquisition_sessions (
    id, visitor_id, source_id, landing_path, last_path, referrer
  ) values (
    p_session_id, p_visitor_id, existing_source_id, safe_path, safe_path, left(nullif(p_referrer, ''), 500)
  )
  on conflict (id) do update
  set last_activity_at = now(),
      last_path = excluded.last_path,
      pageview_count = public.acquisition_sessions.pageview_count + case
        when public.acquisition_sessions.last_path is distinct from excluded.last_path
          or public.acquisition_sessions.last_activity_at < now() - interval '10 seconds'
        then 1 else 0 end
  where public.acquisition_sessions.visitor_id = excluded.visitor_id
  returning true into counted_pageview;

  if inserted_visitor then
    raise log 'acquisition visitor created source_attributed=%', existing_source_id is not null;
  end if;

  return jsonb_build_object(
    'visitor_created', inserted_visitor,
    'source_attributed', existing_source_id is not null,
    'pageview_recorded', counted_pageview
  );
end;
$$;

create or replace function public.lock_acquisition_user_attribution(p_visitor_id uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  account_id uuid := (select auth.uid());
  visitor_record public.acquisition_visitors%rowtype;
  current_lock timestamptz;
begin
  if account_id is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;

  insert into public.acquisition_user_attribution (user_id, registered_at)
  select account_id, created_at from auth.users where id = account_id
  on conflict (user_id) do nothing;

  select locked_at into current_lock
  from public.acquisition_user_attribution
  where user_id = account_id
  for update;

  if current_lock is not null then return false; end if;

  select * into visitor_record
  from public.acquisition_visitors
  where visitor_id = p_visitor_id;

  update public.acquisition_user_attribution
  set visitor_id = case when found then visitor_record.visitor_id else null end,
      source_id = case when found then visitor_record.first_source_id else null end,
      first_domain = case when found then visitor_record.first_domain else null end,
      attributed_at = case when found then visitor_record.first_seen_at else null end,
      locked_at = now()
  where user_id = account_id and locked_at is null;

  if found then
    raise log 'acquisition user attribution locked source_attributed=%', visitor_record.first_source_id is not null;
  end if;

  return found;
end;
$$;

create or replace function public.record_acquisition_payment_event(
  p_provider text,
  p_event_id text,
  p_transaction_id text,
  p_user_id uuid,
  p_offer_kind text,
  p_status text,
  p_livemode boolean,
  p_currency text,
  p_gross_amount_cents integer,
  p_refunded_amount_cents integer,
  p_occurred_at timestamptz
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  normalized_provider text := lower(p_provider);
  locked_source_id uuid;
  inserted_event boolean := false;
begin
  if (select auth.role()) <> 'service_role' then
    raise exception 'Service role required' using errcode = '42501';
  end if;

  insert into public.acquisition_webhook_events (provider, event_id)
  values (normalized_provider, p_event_id)
  on conflict do nothing;
  inserted_event := found;
  if not inserted_event then
    raise log 'acquisition duplicate webhook ignored';
    return false;
  end if;

  select source_id into locked_source_id
  from public.acquisition_user_attribution
  where user_id = p_user_id and locked_at is not null;

  insert into public.acquisition_payments (
    provider, transaction_id, user_id, source_id, offer_kind, status, livemode, currency,
    gross_amount_cents, refunded_amount_cents, refunded_at, occurred_at
  ) values (
    normalized_provider, p_transaction_id, p_user_id, locked_source_id, p_offer_kind, p_status, p_livemode,
    upper(p_currency), p_gross_amount_cents, p_refunded_amount_cents,
    case when p_refunded_amount_cents > 0 then now() else null end, p_occurred_at
  )
  on conflict (provider, transaction_id) do update
  set status = excluded.status,
      refunded_at = case
        when excluded.refunded_amount_cents > public.acquisition_payments.refunded_amount_cents then now()
        else public.acquisition_payments.refunded_at end,
      refunded_amount_cents = greatest(public.acquisition_payments.refunded_amount_cents, excluded.refunded_amount_cents)
  where public.acquisition_payments.user_id = excluded.user_id
    and public.acquisition_payments.offer_kind = excluded.offer_kind
    and public.acquisition_payments.livemode = excluded.livemode
    and public.acquisition_payments.currency = excluded.currency
    and public.acquisition_payments.gross_amount_cents = excluded.gross_amount_cents;

  if not found then
    raise exception 'Payment identity mismatch' using errcode = '23514';
  end if;
  raise log 'acquisition payment attribution resolved source_attributed=%', locked_source_id is not null;
  return true;
end;
$$;

create or replace function public.get_acquisition_race(
  p_start_at timestamptz,
  p_end_at timestamptz,
  p_bucket text default 'day'
)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  result jsonb;
  start_at timestamptz := coalesce(p_start_at, '1970-01-01'::timestamptz);
  end_at timestamptz := coalesce(p_end_at, now());
begin
  if not private.is_acquisition_admin() then
    raise exception 'Admin access required' using errcode = '42501';
  end if;
  if start_at >= end_at or p_bucket not in ('hour', 'day') then
    raise exception 'Invalid race range' using errcode = '22023';
  end if;

  with source_rows as (
    select id, source_key, display_name, team_member_name, domain, active
    from public.acquisition_sources
  ),
  visitor_metrics as (
    select first_source_id source_id, count(*) unique_visitors
    from public.acquisition_visitors
    where first_seen_at >= start_at and first_seen_at < end_at
    group by first_source_id
  ),
  session_metrics as (
    select source_id, count(*) sessions, sum(pageview_count) pageviews
    from public.acquisition_sessions
    where started_at >= start_at and started_at < end_at
    group by source_id
  ),
  registration_metrics as (
    select source_id, count(*) registrations
    from public.acquisition_user_attribution
    where registered_at >= start_at and registered_at < end_at
    group by source_id
  ),
  payment_sales_metrics as (
    select source_id,
      count(*) filter (where offer_kind = 'starter_1') starter_sales,
      count(*) filter (where offer_kind = 'membership_29') membership_sales,
      coalesce(sum(gross_amount_cents), 0) gross_revenue_cents
    from public.acquisition_payments
    where occurred_at >= start_at and occurred_at < end_at
      and livemode
      and status in ('succeeded', 'partially_refunded', 'refunded')
    group by source_id
  ),
  refund_metrics as (
    select source_id, coalesce(sum(refunded_amount_cents), 0) refund_cents
    from public.acquisition_payments
    where refunded_at >= start_at and refunded_at < end_at and refunded_amount_cents > 0 and livemode
    group by source_id
  ),
  metrics as (
    select s.id source_id, s.source_key, s.display_name, s.team_member_name, s.domain, s.active,
      coalesce(v.unique_visitors, 0)::integer unique_visitors,
      coalesce(se.sessions, 0)::integer sessions,
      coalesce(se.pageviews, 0)::integer pageviews,
      coalesce(r.registrations, 0)::integer registrations,
      coalesce(p.starter_sales, 0)::integer starter_sales,
      coalesce(p.membership_sales, 0)::integer membership_sales,
      coalesce(p.gross_revenue_cents, 0)::integer gross_revenue_cents,
      coalesce(rf.refund_cents, 0)::integer refund_cents,
      (coalesce(p.gross_revenue_cents, 0) - coalesce(rf.refund_cents, 0))::integer net_revenue_cents
    from source_rows s
    left join visitor_metrics v on v.source_id = s.id
    left join session_metrics se on se.source_id = s.id
    left join registration_metrics r on r.source_id = s.id
    left join payment_sales_metrics p on p.source_id = s.id
    left join refund_metrics rf on rf.source_id = s.id
  ),
  unattributed as (
    select
      'unattributed'::text source_key,
      'Direct / Unattributed'::text display_name,
      coalesce((select unique_visitors from visitor_metrics where source_id is null), 0)::integer unique_visitors,
      coalesce((select sessions from session_metrics where source_id is null), 0)::integer sessions,
      coalesce((select pageviews from session_metrics where source_id is null), 0)::integer pageviews,
      coalesce((select registrations from registration_metrics where source_id is null), 0)::integer registrations,
      coalesce((select starter_sales from payment_sales_metrics where source_id is null), 0)::integer starter_sales,
      coalesce((select membership_sales from payment_sales_metrics where source_id is null), 0)::integer membership_sales,
      coalesce((select gross_revenue_cents from payment_sales_metrics where source_id is null), 0)::integer gross_revenue_cents,
      coalesce((select refund_cents from refund_metrics where source_id is null), 0)::integer refund_cents,
      (coalesce((select gross_revenue_cents from payment_sales_metrics where source_id is null), 0)
        - coalesce((select refund_cents from refund_metrics where source_id is null), 0))::integer net_revenue_cents
  ),
  event_rows as (
    select date_trunc(p_bucket, first_seen_at) bucket, first_source_id source_id,
      count(*)::integer visitors, 0::integer registrations, 0::integer starter_sales,
      0::integer membership_sales, 0::integer revenue_cents
    from public.acquisition_visitors
    where first_seen_at >= start_at and first_seen_at < end_at
    group by 1, 2
    union all
    select date_trunc(p_bucket, registered_at), source_id, 0, count(*)::integer, 0, 0, 0
    from public.acquisition_user_attribution
    where registered_at >= start_at and registered_at < end_at
    group by 1, 2
    union all
    select date_trunc(p_bucket, occurred_at), source_id, 0, 0,
      count(*) filter (where offer_kind = 'starter_1')::integer,
      count(*) filter (where offer_kind = 'membership_29')::integer,
      sum(gross_amount_cents)::integer
    from public.acquisition_payments
    where occurred_at >= start_at and occurred_at < end_at
      and livemode
      and status in ('succeeded', 'partially_refunded', 'refunded')
    group by 1, 2
    union all
    select date_trunc(p_bucket, refunded_at), source_id, 0, 0, 0, 0,
      -sum(refunded_amount_cents)::integer
    from public.acquisition_payments
    where refunded_at >= start_at and refunded_at < end_at and refunded_amount_cents > 0 and livemode
    group by 1, 2
  ),
  series_rows as (
    select bucket, source_id,
      sum(visitors)::integer visitors,
      sum(registrations)::integer registrations,
      sum(starter_sales)::integer starter_sales,
      sum(membership_sales)::integer membership_sales,
      sum(revenue_cents)::integer revenue_cents
    from event_rows group by bucket, source_id
  ),
  activity as (
    select first_seen_at occurred_at, first_source_id source_id, 'New visitor'::text label
    from public.acquisition_visitors
    where first_seen_at >= start_at and first_seen_at < end_at
    union all
    select registered_at, source_id, 'Registration'
    from public.acquisition_user_attribution
    where registered_at >= start_at and registered_at < end_at
    union all
    select occurred_at, source_id,
      case when offer_kind = 'starter_1' then '$1 purchase' else '$29 upgrade' end
    from public.acquisition_payments
    where occurred_at >= start_at and occurred_at < end_at
      and livemode
      and status in ('succeeded', 'partially_refunded', 'refunded')
    union all
    select refunded_at, source_id, 'Refund recorded'
    from public.acquisition_payments
    where refunded_at >= start_at and refunded_at < end_at and refunded_amount_cents > 0 and livemode
  )
  select jsonb_build_object(
    'generated_at', now(),
    'start_at', start_at,
    'end_at', end_at,
    'bucket', p_bucket,
    'teams', coalesce((select jsonb_agg(to_jsonb(m) order by m.display_name) from metrics m), '[]'::jsonb),
    'unattributed', (select to_jsonb(u) from unattributed u),
    'series', coalesce((select jsonb_agg(jsonb_build_object(
      'bucket', sr.bucket, 'source_id', sr.source_id, 'visitors', sr.visitors,
      'registrations', sr.registrations, 'starter_sales', sr.starter_sales,
      'membership_sales', sr.membership_sales, 'revenue_cents', sr.revenue_cents
    ) order by sr.bucket) from series_rows sr), '[]'::jsonb),
    'activity', coalesce((select jsonb_agg(jsonb_build_object(
      'occurred_at', a.occurred_at, 'source_id', a.source_id, 'label', a.label
    ) order by a.occurred_at desc) from (select * from activity order by occurred_at desc limit 20) a), '[]'::jsonb)
  ) into result;

  return result;
end;
$$;

revoke all on function private.is_acquisition_admin() from public, anon, authenticated;
revoke all on function private.create_acquisition_attribution_for_new_user() from public, anon, authenticated;
revoke all on function public.is_acquisition_admin() from public, anon, authenticated;
revoke all on function public.capture_acquisition_visit(uuid, uuid, text, text, text, text, text) from public, anon, authenticated;
revoke all on function public.lock_acquisition_user_attribution(uuid) from public, anon, authenticated;
revoke all on function public.record_acquisition_payment_event(text, text, text, uuid, text, text, boolean, text, integer, integer, timestamptz) from public, anon, authenticated, service_role;
revoke all on function public.get_acquisition_race(timestamptz, timestamptz, text) from public, anon, authenticated;

grant usage on schema private to authenticated;
grant execute on function public.is_acquisition_admin() to authenticated;
grant execute on function public.capture_acquisition_visit(uuid, uuid, text, text, text, text, text) to anon, authenticated;
grant execute on function public.lock_acquisition_user_attribution(uuid) to authenticated;
grant execute on function public.record_acquisition_payment_event(text, text, text, uuid, text, text, boolean, text, integer, integer, timestamptz) to service_role;
grant execute on function public.get_acquisition_race(timestamptz, timestamptz, text) to authenticated;
