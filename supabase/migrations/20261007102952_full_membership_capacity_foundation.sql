-- LOCAL FOUNDATION ONLY. No rows representing customers are seeded, no grants
-- are backfilled, no existing entitlement policies/functions are replaced.
create type private.full_membership_state as enum
  ('pending', 'active', 'cancel_at_period_end', 'expired', 'cancelled');
create type private.membership_waitlist_state as enum
  ('waiting', 'invited', 'converted', 'withdrawn', 'expired');

create table private.membership_capacity_policy (
  id boolean primary key default true check (id),
  capacity integer not null default 600 check (capacity = 600),
  checkout_enabled boolean not null default false,
  waitlist_enabled boolean not null default false
);
insert into private.membership_capacity_policy (id) values (true);

create table private.membership_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id),
  checkout_idempotency_key uuid not null unique,
  state private.full_membership_state not null default 'pending',
  entitlement_starts_at timestamptz,
  entitlement_ends_at timestamptz,
  cancellation_requested_at timestamptz,
  ended_at timestamptz,
  payment_status text not null default 'pending'
    check (payment_status in ('pending', 'paid', 'past_due', 'failed')),
  provider_customer_id text,
  provider_subscription_id text unique,
  provider_checkout_session_id text unique,
  checkout_attempt_state text not null default 'not_started'
    check (checkout_attempt_state in ('not_started','in_flight','attached','terminal')),
  checkout_terminal_confirmed_at timestamptz,
  last_provider_event_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, user_id),
  check (state not in ('active', 'cancel_at_period_end') or
    (entitlement_starts_at is not null and entitlement_ends_at is not null and entitlement_ends_at > entitlement_starts_at)),
  check (state <> 'cancel_at_period_end' or cancellation_requested_at is not null),
  check (checkout_attempt_state <> 'terminal' or checkout_terminal_confirmed_at is not null)
);
create unique index membership_one_live_subscription_per_user
  on private.membership_subscriptions (user_id)
  where state in ('pending', 'active', 'cancel_at_period_end');
create index membership_subscription_expiry_idx
  on private.membership_subscriptions (entitlement_ends_at)
  where state in ('active', 'cancel_at_period_end');

-- A numbered claim is a database-enforced upper bound, even if a future writer
-- bypasses the normal reservation RPC. Reservations are NOT active memberships.
create table private.membership_slot_claims (
  slot_number integer primary key check (slot_number between 1 and 600),
  subscription_id uuid not null unique,
  user_id uuid not null unique,
  idempotency_key uuid not null unique,
  claim_state text not null check (claim_state in ('reserved', 'allocated')),
  reserved_until timestamptz,
  created_at timestamptz not null default now(),
  foreign key (subscription_id, user_id)
    references private.membership_subscriptions (id, user_id),
  check ((claim_state = 'reserved' and reserved_until is not null)
    or (claim_state = 'allocated' and reserved_until is null))
);

create table private.membership_waitlist (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  email_normalized text not null unique
    check (email_normalized = lower(btrim(email_normalized)) and char_length(email_normalized) between 3 and 320),
  joined_at timestamptz not null default now(),
  state private.membership_waitlist_state not null default 'waiting',
  invited_at timestamptz,
  invitation_token_hash text unique,
  invitation_expires_at timestamptz,
  converted_subscription_id uuid references private.membership_subscriptions(id),
  updated_at timestamptz not null default now(),
  check (state <> 'invited' or (invited_at is not null and invitation_token_hash is not null and invitation_expires_at is not null and invitation_expires_at > invited_at)),
  check (state <> 'converted' or converted_subscription_id is not null)
);
create unique index membership_waitlist_user_idx on private.membership_waitlist(user_id) where user_id is not null;
create index membership_waitlist_order_idx on private.membership_waitlist(joined_at, id) where state = 'waiting';

-- Future verified-webhook inbox. No client-supplied event may reach processing.
create table private.membership_billing_events (
  provider_event_id text primary key,
  event_type text not null,
  provider_created_at timestamptz not null,
  received_at timestamptz not null default now(),
  payload jsonb not null,
  processing_state text not null default 'received'
    check (processing_state in ('received', 'processed', 'failed', 'ignored')),
  processed_at timestamptz,
  attempts integer not null default 0 check (attempts >= 0),
  error_code text
);

alter table private.membership_capacity_policy enable row level security;
alter table private.membership_subscriptions enable row level security;
alter table private.membership_slot_claims enable row level security;
alter table private.membership_waitlist enable row level security;
alter table private.membership_billing_events enable row level security;
revoke all on table private.membership_capacity_policy, private.membership_subscriptions,
  private.membership_slot_claims, private.membership_waitlist, private.membership_billing_events
  from public, anon, authenticated;
grant usage on schema private to service_role;
grant select, insert, update on table public.membership_entitlements to service_role;
grant select, insert, update, delete on table private.membership_capacity_policy,
  private.membership_subscriptions, private.membership_slot_claims,
  private.membership_waitlist, private.membership_billing_events to service_role;

-- All mutating RPCs lock this singleton first; always use the same lock order.
-- Do not hold the transaction while calling Stripe or sending email.
create function private.release_ended_membership_slots()
returns void language plpgsql security invoker set search_path = '' as $$
begin
  perform 1 from private.membership_capacity_policy where id for update;
  update private.membership_subscriptions s set state = 'expired', ended_at = now(), updated_at = now()
  from private.membership_slot_claims c
  where c.subscription_id = s.id and s.state in ('pending','active','cancel_at_period_end') and
    ((c.claim_state = 'reserved' and c.reserved_until <= now()
      and s.checkout_attempt_state in ('not_started','terminal')) or
     (c.claim_state = 'allocated' and s.entitlement_ends_at <= now()));
  update public.membership_entitlements e set enabled = false, updated_at = now()
  from private.membership_subscriptions s
  where e.user_id = s.user_id and e.source = 'billing_provider'
    and e.source_reference = s.id::text and s.state in ('expired', 'cancelled');
  delete from private.membership_slot_claims c using private.membership_subscriptions s
    where s.id = c.subscription_id and s.state in ('expired', 'cancelled');
end;
$$;

create function private.reserve_full_membership_slot(p_user_id uuid, p_idempotency_key uuid)
returns uuid language plpgsql security invoker set search_path = '' as $$
declare v_existing private.membership_subscriptions; v_slot integer; v_subscription uuid;
begin
  perform 1 from private.membership_capacity_policy where id for update;
  if not coalesce((select checkout_enabled from private.membership_capacity_policy where id), false) then
    raise exception 'Paid checkout is disabled' using errcode = '55000';
  end if;
  if p_user_id is null or p_idempotency_key is null then
    raise exception 'Account and idempotency key required' using errcode = '22023';
  end if;
  perform private.release_ended_membership_slots();
  select * into v_existing from private.membership_subscriptions where checkout_idempotency_key = p_idempotency_key;
  if found then
    if v_existing.user_id <> p_user_id then raise exception 'Reservation unavailable' using errcode = '42501'; end if;
    if not exists (select 1 from private.membership_slot_claims where subscription_id = v_existing.id) then
      raise exception 'Reservation ended; use a new checkout request' using errcode = '55000';
    end if;
    return v_existing.id;
  end if;
  -- Cutover gate: active legacy full grants must first be reconciled into slots.
  if exists (select 1 from public.membership_entitlements e where e.enabled and e.revoked_at is null
    and (e.starts_at is null or e.starts_at <= now()) and (e.expires_at is null or e.expires_at > now())
    and not exists (select 1 from private.membership_slot_claims c where c.user_id = e.user_id and c.claim_state = 'allocated')) then
    raise exception 'Existing full grants require capacity reconciliation' using errcode = '55000';
  end if;
  if exists (select 1 from private.membership_slot_claims where user_id = p_user_id) then
    raise exception 'Account already holds a slot' using errcode = '23505';
  end if;
  select n into v_slot from generate_series(1,600) n
    where not exists (select 1 from private.membership_slot_claims c where c.slot_number = n)
    order by n limit 1;
  if v_slot is null then raise exception 'Membership capacity reached' using errcode = 'P0001'; end if;
  insert into private.membership_subscriptions(user_id, checkout_idempotency_key) values (p_user_id, p_idempotency_key) returning id into v_subscription;
  insert into private.membership_slot_claims(slot_number, subscription_id, user_id, idempotency_key, claim_state, reserved_until)
    values (v_slot, v_subscription, p_user_id, p_idempotency_key, 'reserved', now() + interval '30 minutes');
  return v_subscription;
end;
$$;

create function private.activate_full_membership_slot(p_subscription_id uuid, p_starts_at timestamptz, p_ends_at timestamptz)
returns void language plpgsql security invoker set search_path = '' as $$
declare v_claim private.membership_slot_claims; v_attempt text;
begin
  perform 1 from private.membership_capacity_policy where id for update;
  if not coalesce((select checkout_enabled from private.membership_capacity_policy where id), false) then
    raise exception 'Paid checkout is disabled' using errcode = '55000';
  end if;
  select * into v_claim from private.membership_slot_claims where subscription_id = p_subscription_id for update;
  if not found then raise exception 'Reservation unavailable or expired' using errcode = '55000'; end if;
  select checkout_attempt_state into v_attempt from private.membership_subscriptions where id=p_subscription_id;
  if v_claim.claim_state = 'reserved' and v_claim.reserved_until <= now() and v_attempt not in ('in_flight','attached') then
    raise exception 'Reservation unavailable or expired' using errcode = '55000';
  end if;
  if p_starts_at is null or p_ends_at is null or p_starts_at > now() or p_ends_at <= now() or p_ends_at <= p_starts_at then
    raise exception 'Invalid paid entitlement window' using errcode = '22023';
  end if;
  if exists (select 1 from public.membership_entitlements where user_id = v_claim.user_id and source <> 'billing_provider') then
    raise exception 'Existing grant requires reconciliation' using errcode = '55000';
  end if;
  update private.membership_subscriptions set state = 'active', payment_status = 'paid',
    entitlement_starts_at = p_starts_at, entitlement_ends_at = p_ends_at,
    cancellation_requested_at = null, ended_at = null, updated_at = now() where id = p_subscription_id;
  update private.membership_slot_claims set claim_state = 'allocated', reserved_until = null where subscription_id = p_subscription_id;
  insert into public.membership_entitlements(user_id, enabled, starts_at, expires_at, source, source_reference)
    values (v_claim.user_id, true, p_starts_at, p_ends_at, 'billing_provider', p_subscription_id::text)
    on conflict(user_id) do update set enabled = true, starts_at = excluded.starts_at,
      expires_at = excluded.expires_at, revoked_at = null, source_reference = excluded.source_reference;
end;
$$;

create function private.cancel_full_membership_at_period_end(p_subscription_id uuid)
returns void language plpgsql security invoker set search_path = '' as $$
begin
  perform 1 from private.membership_capacity_policy where id for update;
  update private.membership_subscriptions set state = 'cancel_at_period_end',
    cancellation_requested_at = coalesce(cancellation_requested_at, now()), updated_at = now()
    where id = p_subscription_id and state in ('active', 'cancel_at_period_end') and entitlement_ends_at > now();
  if not found then raise exception 'Active subscription unavailable' using errcode = '55000'; end if;
  -- Intentionally leaves the allocated claim and entitlement intact.
end;
$$;

create function private.full_membership_capacity_snapshot()
returns jsonb language sql stable security invoker set search_path = '' as $$
  with counts as (select
    count(*) filter (where c.claim_state = 'allocated' and s.state in ('active','cancel_at_period_end')
      and s.entitlement_starts_at <= now() and s.entitlement_ends_at > now())::integer active,
    count(*) filter (where c.claim_state = 'reserved' and
      (c.reserved_until > now() or s.checkout_attempt_state in ('in_flight','attached')))::integer reserved,
    count(*) filter (where c.claim_state = 'allocated' and s.state = 'cancel_at_period_end'
      and s.entitlement_ends_at > now())::integer cancelling
    from private.membership_slot_claims c join private.membership_subscriptions s on s.id = c.subscription_id)
  , reconciliation as (select count(*)::integer unmapped from public.membership_entitlements e
    where e.enabled and e.revoked_at is null and (e.starts_at is null or e.starts_at <= now())
      and (e.expires_at is null or e.expires_at > now())
      and not exists (select 1 from private.membership_slot_claims claim where claim.user_id=e.user_id and claim.claim_state='allocated'))
  select jsonb_build_object('capacity', p.capacity, 'active', c.active, 'reserved', c.reserved,
    'available', p.capacity-c.active, 'allocatable', p.capacity-c.active-c.reserved,
    'full', c.active=p.capacity, 'paid_membership_open', p.checkout_enabled and r.unmapped=0 and c.active+c.reserved<p.capacity,
    'unreconciled_full_grants', r.unmapped, 'count_verified', r.unmapped=0,
    'cancelling_at_period_end', c.cancelling, 'waitlist_enabled', p.waitlist_enabled,
    'waitlist', (select count(*) from private.membership_waitlist where state in ('waiting','invited')),
    'mrr', null) from private.membership_capacity_policy p cross join counts c cross join reconciliation r where p.id;
$$;

create function private.end_full_membership(p_subscription_id uuid, p_ends_at timestamptz, p_state private.full_membership_state)
returns void language plpgsql security invoker set search_path = '' as $$
begin
  perform 1 from private.membership_capacity_policy where id for update;
  if p_ends_at is null or p_ends_at > now() or p_state not in ('expired','cancelled') or p_state is null then
    raise exception 'A verified actual entitlement end is required' using errcode = '22023';
  end if;
  update private.membership_subscriptions set state=p_state, entitlement_ends_at=p_ends_at,
    ended_at=p_ends_at, updated_at=now() where id=p_subscription_id;
  if not found then raise exception 'Subscription unavailable' using errcode = '55000'; end if;
  perform private.release_ended_membership_slots();
end;
$$;

revoke all on function private.release_ended_membership_slots(),
  private.reserve_full_membership_slot(uuid,uuid),
  private.activate_full_membership_slot(uuid,timestamptz,timestamptz),
  private.cancel_full_membership_at_period_end(uuid), private.full_membership_capacity_snapshot(),
  private.end_full_membership(uuid,timestamptz,private.full_membership_state)
  from public, anon, authenticated;
grant execute on function private.release_ended_membership_slots(),
  private.reserve_full_membership_slot(uuid,uuid),
  private.activate_full_membership_slot(uuid,timestamptz,timestamptz),
  private.cancel_full_membership_at_period_end(uuid), private.full_membership_capacity_snapshot(),
  private.end_full_membership(uuid,timestamptz,private.full_membership_state) to service_role;

comment on table private.membership_slot_claims is '600 numbered full-membership claims. Safe unsubmitted/confirmed-terminal reservation expiry and actual entitlement end free claims. Unknown provider outcomes and cancellation requests do not.';
comment on table private.membership_capacity_policy is 'Both feature flags stay false until an explicitly authorized billing/capacity cutover.';
comment on function private.activate_full_membership_slot(uuid,timestamptz,timestamptz) is 'Future verified-provider worker only. Never invoke from a success URL or ordinary user request.';
