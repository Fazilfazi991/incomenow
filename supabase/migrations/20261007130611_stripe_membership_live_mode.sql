-- Server and database mode boundaries agree before any billing operation.
-- No gate is opened and no existing grant or Stripe subscription is changed.
alter table private.membership_capacity_policy add column stripe_billing_mode text not null default 'test' check(stripe_billing_mode in ('test','live'));
create or replace function public.membership_billing_command(p_operation text, p_input jsonb default '{}'::jsonb)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  v_id uuid; v_user uuid; v_s private.membership_subscriptions; v_token uuid;
  v_start timestamptz; v_end timestamptz; v_active integer; v_held integer; v_slot integer;
  v_customer text; v_event text; v_processed boolean;
begin
  if coalesce(auth.jwt()->>'role','')<>'service_role' then raise exception 'Service role required' using errcode='42501'; end if;
  perform 1 from private.membership_capacity_policy where id for update;
  if coalesce((p_input->>'livemode')::boolean,false) is distinct from
    ((select stripe_billing_mode from private.membership_capacity_policy where id)='live') then
    raise exception 'Billing environment mode mismatch' using errcode='23514';
  end if;
  v_user := (p_input->>'user_id')::uuid;
  if p_operation='capacity' then
    perform private.release_ended_membership_slots();
    select count(*)::integer into v_active from public.membership_entitlements e
      where e.enabled and e.revoked_at is null and (e.starts_at is null or e.starts_at<=now()) and (e.expires_at is null or e.expires_at>now());
    select count(*)::integer into v_held from private.membership_slot_claims c
      where not exists(select 1 from public.membership_entitlements e where e.user_id=c.user_id and e.enabled and e.revoked_at is null
        and (e.starts_at is null or e.starts_at<=now()) and (e.expires_at is null or e.expires_at>now()))
      and not exists(select 1 from private.membership_subscriptions s where s.id=c.subscription_id and s.state='cancel_at_period_end'
        and s.entitlement_ends_at<=now() and (s.reconcile_until is null or s.reconcile_until<=now()));
    return jsonb_build_object('active',v_active,'reserved',v_held,'capacity',600,
      'allocatable',greatest(0,600-v_active-v_held),
      'checkout_enabled',(select checkout_enabled from private.membership_capacity_policy where id),
      'waitlist_enabled',(select waitlist_enabled from private.membership_capacity_policy where id),
      'cancelling',(select count(*) from private.membership_subscriptions where state='cancel_at_period_end' and entitlement_ends_at>now()),
      'issues',(select count(*) from private.membership_subscriptions where payment_status in ('past_due','failed')
        or (state='pending' and created_at<now()-interval '35 minutes')
        or (state='active' and entitlement_ends_at<=now())),
      'waitlist',(select count(*) from private.membership_waitlist where state in ('waiting','invited')),
      'checkout_reservations',(select count(*) from private.membership_slot_claims c join private.membership_subscriptions s on s.id=c.subscription_id where s.state='pending'),
      'renewal_holds',(select count(*) from private.membership_slot_claims c join private.membership_subscriptions s on s.id=c.subscription_id where s.state='active' and s.entitlement_ends_at<=now()),
      'paid_monthly',(select count(*) from private.membership_subscriptions s join public.membership_entitlements e
        on e.user_id=s.user_id and e.source_reference=s.id::text where s.provider_price_id is not null and s.payment_status='paid'
        and e.enabled and e.revoked_at is null and e.starts_at<=now() and e.expires_at>now()));
  elsif p_operation='account' then
    select * into v_s from private.membership_subscriptions where user_id=v_user order by created_at desc limit 1;
    return jsonb_build_object('subscription',case when v_s.id is null then null else to_jsonb(v_s) end,
      'customer_id',(select provider_customer_id from private.membership_customers where user_id=v_user),
      'waitlist_state',(select state from private.membership_waitlist where user_id=v_user),
      'invitation_active',exists(select 1 from private.membership_waitlist w join private.membership_slot_claims c on c.user_id=w.user_id
        where w.user_id=v_user and w.state='invited' and w.invitation_expires_at>now()));
  elsif p_operation='reserve' then
    v_id:=private.reserve_full_membership_slot(v_user,(p_input->>'request_id')::uuid);
    update private.membership_subscriptions set
      checkout_expires_at=case when checkout_origin is null then now()+interval '35 minutes' else coalesce(checkout_expires_at,now()+interval '35 minutes') end,
      checkout_origin=coalesce(checkout_origin,p_input->>'origin') where id=v_id;
    select * into v_s from private.membership_subscriptions where id=v_id;
    return to_jsonb(v_s);
  elsif p_operation='customer' then
    insert into private.membership_customers(user_id,provider_customer_id) values(v_user,p_input->>'customer_id') on conflict(user_id) do nothing;
    select provider_customer_id into v_customer from private.membership_customers where user_id=v_user;
    if v_customer<>p_input->>'customer_id' then raise exception 'Customer mismatch' using errcode='23514'; end if;
    return to_jsonb(v_customer);
  elsif p_operation='lookup' then
    select * into v_s from private.membership_subscriptions where
      id=(p_input->>'id')::uuid or provider_subscription_id=p_input->>'provider_subscription_id'
      or provider_checkout_session_id=p_input->>'session_id';
    return case when v_s.id is null then null else to_jsonb(v_s) end;
  elsif p_operation='start_checkout' then
    if not exists(select 1 from private.membership_customers where user_id=v_user and provider_customer_id=p_input->>'customer_id') then
      raise exception 'Customer mapping required' using errcode='23514'; end if;
    update private.membership_subscriptions set checkout_attempt_state='in_flight',provider_customer_id=p_input->>'customer_id',
      provider_price_id=p_input->>'price_id'
      where id=(p_input->>'id')::uuid and user_id=v_user and state='pending' and checkout_expires_at>now();
    if not found then raise exception 'Checkout window ended' using errcode='55000'; end if;
    return 'true'::jsonb;
  elsif p_operation='bind_checkout' then
    select * into v_s from private.membership_subscriptions where id=(p_input->>'id')::uuid for update;
    if v_s.id is null or v_s.user_id<>v_user or v_s.state<>'pending' then raise exception 'Reservation unavailable' using errcode='55000'; end if;
    if (v_s.provider_checkout_session_id is not null and v_s.provider_checkout_session_id<>p_input->>'session_id')
      or not exists(select 1 from private.membership_customers where user_id=v_user and provider_customer_id=p_input->>'customer_id') then
      raise exception 'Checkout identity mismatch' using errcode='23514'; end if;
    update private.membership_subscriptions set provider_checkout_session_id=p_input->>'session_id', provider_customer_id=p_input->>'customer_id',
      provider_price_id=p_input->>'price_id', checkout_attempt_state='attached', updated_at=now() where id=v_s.id;
    return 'true'::jsonb;
  elsif p_operation='lease' then
    select * into v_s from private.membership_subscriptions where id=(p_input->>'id')::uuid for update;
    if v_s.id is null then raise exception 'Unknown reservation' using errcode='55000'; end if;
    v_event:=p_input->>'event_id';
    select processing_state='processed' into v_processed from private.membership_billing_events where provider_event_id=v_event;
    if v_processed then return jsonb_build_object('duplicate',true); end if;
    if v_s.reconcile_until>now() then raise exception 'Reconciliation busy' using errcode='55P03'; end if;
    v_token:=gen_random_uuid();
    update private.membership_subscriptions set reconcile_token=v_token,reconcile_until=now()+interval '90 seconds',last_reconcile_attempt_at=now() where id=v_s.id;
    return jsonb_build_object('token',v_token);
  elsif p_operation='unlock' then
    update private.membership_subscriptions set reconcile_until=null,reconcile_token=null
      where id=(p_input->>'id')::uuid and reconcile_token=(p_input->>'token')::uuid;
    return 'true'::jsonb;
  elsif p_operation='sync' then
    select * into v_s from private.membership_subscriptions where id=(p_input->>'id')::uuid for update;
    if v_s.id is null or v_s.reconcile_token is distinct from (p_input->>'token')::uuid or v_s.reconcile_until<=now() then
      raise exception 'Stale reconciliation' using errcode='55P03'; end if;
    if v_s.user_id is distinct from v_user or v_s.provider_customer_id is distinct from p_input->>'customer_id'
      or v_s.provider_checkout_session_id is distinct from p_input->>'session_id'
      or v_s.provider_price_id is distinct from p_input->>'price_id'
      or (v_s.provider_subscription_id is not null and v_s.provider_subscription_id is distinct from p_input->>'provider_subscription_id') then
      raise exception 'Provider identity mismatch' using errcode='23514'; end if;
    v_event:=p_input->>'event_id';
    if exists(select 1 from private.membership_billing_events where provider_event_id=v_event and processing_state='processed') then
      return jsonb_build_object('duplicate',true);
    end if;
    v_start:=(p_input->>'paid_start')::timestamptz; v_end:=(p_input->>'paid_end')::timestamptz;
    -- An unpaid newer invoice cannot extend or shorten the last paid window.
    if v_s.entitlement_ends_at is not null and (v_end is null or v_s.entitlement_ends_at>v_end) then
      v_start:=v_s.entitlement_starts_at; v_end:=v_s.entitlement_ends_at;
    end if;
    if v_start is not null and (v_end is null or v_end<=v_start or v_start>now()) then raise exception 'Invalid paid window' using errcode='22023'; end if;
    if v_end>now() then
      if exists(select 1 from public.membership_entitlements where user_id=v_user and (source<>'billing_provider' or revoked_at is not null)) then
        raise exception 'Existing grant requires reconciliation' using errcode='55000'; end if;
      if not exists(select 1 from private.membership_slot_claims where subscription_id=v_s.id) then
        perform private.release_ended_membership_slots();
        select n into v_slot from generate_series(1,600) n where not exists(select 1 from private.membership_slot_claims where slot_number=n) order by n limit 1;
        if v_slot is null then raise exception 'Paid recovery needs operator review: capacity full' using errcode='P0001'; end if;
        insert into private.membership_slot_claims(slot_number,subscription_id,user_id,idempotency_key,claim_state)
          values(v_slot,v_s.id,v_user,v_s.checkout_idempotency_key,'allocated');
      end if;
      update private.membership_slot_claims set claim_state='allocated',reserved_until=null where subscription_id=v_s.id;
      insert into public.membership_entitlements(user_id,enabled,starts_at,expires_at,source,source_reference)
        values(v_user,true,v_start,v_end,'billing_provider',v_s.id::text)
        on conflict(user_id) do update set enabled=true,starts_at=excluded.starts_at,expires_at=excluded.expires_at,
          revoked_at=null,source='billing_provider',source_reference=excluded.source_reference;
    elsif p_input->>'checkout_status'='expired' or p_input->>'provider_status' in ('canceled','incomplete_expired','unpaid','past_due','paused') then
      delete from private.membership_slot_claims where subscription_id=v_s.id;
    end if;
    update private.membership_subscriptions set
      checkout_attempt_state=case when p_input->>'checkout_status' in ('complete','expired') then 'terminal' else checkout_attempt_state end,
      checkout_terminal_confirmed_at=case when p_input->>'checkout_status' in ('complete','expired') then coalesce(checkout_terminal_confirmed_at,now()) else checkout_terminal_confirmed_at end,
      provider_subscription_id=coalesce(provider_subscription_id,p_input->>'provider_subscription_id'),
      provider_status=p_input->>'provider_status',
      entitlement_starts_at=v_start,entitlement_ends_at=v_end,
      state=case when v_end>now() then
        case when coalesce((p_input->>'cancel_at_period_end')::boolean,false) or p_input->>'provider_status'='canceled' then 'cancel_at_period_end'::private.full_membership_state else 'active'::private.full_membership_state end
        when p_input->>'checkout_status'='expired' or p_input->>'provider_status' in ('canceled','incomplete_expired','unpaid','past_due','paused') then 'expired'::private.full_membership_state
        else state end,
      payment_status=case when p_input->>'provider_status' in ('past_due','unpaid') then 'past_due' when v_end>now() then 'paid' else payment_status end,
      cancellation_requested_at=case when coalesce((p_input->>'cancel_at_period_end')::boolean,false) or p_input->>'provider_status'='canceled' then coalesce(cancellation_requested_at,now()) else null end,
      reconcile_token=null,reconcile_until=null,last_provider_event_at=now(),updated_at=now() where id=v_s.id;
    if p_input->>'invoice_id' is not null then
      perform public.record_acquisition_payment_event('stripe',v_event,p_input->>'invoice_id',v_user,'membership_1499','succeeded',coalesce((p_input->>'livemode')::boolean,false),
        'USD',(p_input->>'invoice_amount')::integer,0,(p_input->>'invoice_paid_at')::timestamptz);
    end if;
    insert into private.membership_billing_events(provider_event_id,event_type,provider_created_at,payload,processing_state,processed_at,attempts)
      values(v_event,p_input->>'event_type',(p_input->>'event_created_at')::timestamptz,
        jsonb_build_object('subscription_id',v_s.id),'processed',now(),1)
      on conflict(provider_event_id) do nothing;
    update private.membership_waitlist set state='converted',converted_subscription_id=v_s.id,updated_at=now()
      where user_id=v_user and v_end>now() and state in ('waiting','invited');
    return jsonb_build_object('processed',true);
  elsif p_operation='waitlist' then
    if not coalesce((select waitlist_enabled from private.membership_capacity_policy where id),false) then
      raise exception 'Waitlist unavailable' using errcode='55000'; end if;
    if v_user is null or not exists(select 1 from auth.users where id=v_user and email_confirmed_at is not null
      and lower(btrim(email))=lower(btrim(p_input->>'email'))) then raise exception 'Verified account required' using errcode='42501'; end if;
    insert into private.membership_waitlist(user_id,email_normalized) values(v_user,lower(btrim(p_input->>'email')))
      on conflict(user_id) where user_id is not null do update set
        email_normalized=excluded.email_normalized,
        state=case when private.membership_waitlist.state in ('withdrawn','expired') then 'waiting'::private.membership_waitlist_state else private.membership_waitlist.state end,updated_at=now();
    return jsonb_build_object('joined',true);
  elsif p_operation='invite_next' then
    if not coalesce((select waitlist_enabled from private.membership_capacity_policy where id),false) then
      raise exception 'Waitlist unavailable' using errcode='55000'; end if;
    perform private.release_ended_membership_slots();
    select w.user_id into v_user from private.membership_waitlist w join auth.users u on u.id=w.user_id
      where w.state='waiting' and u.email_confirmed_at is not null
        and not exists(select 1 from private.membership_slot_claims where user_id=w.user_id)
        and not exists(select 1 from public.membership_entitlements where user_id=w.user_id and enabled and revoked_at is null and (expires_at is null or expires_at>now()))
      order by w.joined_at,w.id limit 1 for update of w;
    if v_user is null then return jsonb_build_object('invited',false); end if;
    v_id:=private.reserve_full_membership_slot(v_user,gen_random_uuid());
    update private.membership_subscriptions set checkout_expires_at=now()+interval '24 hours' where id=v_id;
    update private.membership_slot_claims set reserved_until=now()+interval '24 hours' where subscription_id=v_id;
    update private.membership_waitlist set state='invited',invited_at=now(),invitation_expires_at=now()+interval '24 hours',
      invitation_token_hash=md5(gen_random_uuid()::text),updated_at=now() where user_id=v_user;
    return jsonb_build_object('invited',true);
  elsif p_operation='reconcile_list' then
    perform private.release_ended_membership_slots();
    return coalesce((select jsonb_agg(to_jsonb(s)) from (select * from private.membership_subscriptions
      where state in ('pending','active','cancel_at_period_end') and (last_provider_event_at is null or last_provider_event_at<now()-interval '5 minutes')
        and (last_reconcile_attempt_at is null or last_reconcile_attempt_at<now()-interval '5 minutes')
      order by last_reconcile_attempt_at asc nulls first,created_at limit 50) s),'[]'::jsonb);
  end if;
  raise exception 'Unknown billing operation' using errcode='22023';
end;
$$;
revoke all on function public.membership_billing_command(text,jsonb) from public, anon, authenticated;
grant execute on function public.membership_billing_command(text,jsonb) to service_role;
comment on function public.membership_billing_command(text,jsonb) is 'Trusted billing worker only. Private data is never exposed to ordinary accounts; server authenticates all account-scoped requests.';
