-- Standalone fixture SQL for scripts/verify-membership-capacity-local.mjs.
-- This file belongs to a disposable isolated database, not live member data.
insert into auth.users(id) select md5('capacity-qa:'||n)::uuid from generate_series(1,602) n;
do $$
begin
  if (select checkout_enabled from private.membership_capacity_policy) then raise exception 'Checkout must default disabled'; end if;
  begin
    perform private.reserve_full_membership_slot(md5('capacity-qa:1')::uuid, md5('request:1')::uuid);
    raise exception 'Disabled checkout was accepted';
  exception when sqlstate '55000' then null; end;
  if has_table_privilege('authenticated','private.membership_subscriptions','SELECT') or
    has_function_privilege('authenticated','private.reserve_full_membership_slot(uuid,uuid)','EXECUTE') or
    has_function_privilege('anon','private.activate_full_membership_slot(uuid,timestamptz,timestamptz)','EXECUTE') then
    raise exception 'Ordinary account can access private billing records or RPCs';
  end if;
end $$;

-- Test-only policy switch inside the disposable database.
update private.membership_capacity_policy set checkout_enabled=true;
set role service_role;
do $$
declare subscription uuid;
begin
  subscription := private.reserve_full_membership_slot(md5('capacity-qa:1')::uuid,md5('request:1')::uuid);
  if subscription <> private.reserve_full_membership_slot(md5('capacity-qa:1')::uuid,md5('request:1')::uuid) then raise exception 'Replay created duplicate subscription'; end if;
  begin
    perform private.reserve_full_membership_slot(md5('capacity-qa:2')::uuid,md5('request:1')::uuid);
    raise exception 'Cross-account replay accepted';
  exception when insufficient_privilege then null; end;
  perform private.activate_full_membership_slot(subscription,now()-interval '1 day',now()+interval '1 day');
  perform private.cancel_full_membership_at_period_end(subscription);
  if not exists(select 1 from private.membership_slot_claims where subscription_id=subscription and claim_state='allocated') or
    not exists(select 1 from public.membership_entitlements where user_id=md5('capacity-qa:1')::uuid and enabled) then
    raise exception 'Period-end cancellation released slot or access early';
  end if;
  if private.full_membership_capacity_snapshot()->>'cancelling_at_period_end' <> '1' then raise exception 'Cancelling member missing from admin aggregate'; end if;
  update private.membership_subscriptions set entitlement_ends_at=now()-interval '1 second' where id=subscription;
  perform private.release_ended_membership_slots();
  if exists(select 1 from private.membership_slot_claims where subscription_id=subscription) or
    exists(select 1 from public.membership_entitlements where user_id=md5('capacity-qa:1')::uuid and enabled) then
    raise exception 'Expired entitlement retained its slot or access';
  end if;
  begin
    perform private.reserve_full_membership_slot(md5('capacity-qa:1')::uuid,md5('request:1')::uuid);
    raise exception 'Expired idempotency key started a new checkout';
  exception when sqlstate '55000' then null; end;
  subscription := private.reserve_full_membership_slot(md5('capacity-qa:2')::uuid,md5('request:2')::uuid);
  update private.membership_slot_claims set reserved_until=now()-interval '1 second' where subscription_id=subscription;
  begin
    perform private.activate_full_membership_slot(subscription,now()-interval '1 day',now()+interval '1 day');
    raise exception 'Expired reservation activated';
  exception when sqlstate '55000' then null; end;
  perform private.release_ended_membership_slots();
  if exists(select 1 from private.membership_slot_claims) then raise exception 'Expired reservations not released'; end if;
  subscription := private.reserve_full_membership_slot(md5('capacity-qa:4')::uuid,md5('request:unknown')::uuid);
  update private.membership_subscriptions set checkout_attempt_state='in_flight' where id=subscription;
  update private.membership_slot_claims set reserved_until=now()-interval '1 second' where subscription_id=subscription;
  perform private.release_ended_membership_slots();
  if not exists(select 1 from private.membership_slot_claims where subscription_id=subscription) then raise exception 'Unknown provider outcome released a potentially paid claim'; end if;
  if private.full_membership_capacity_snapshot()->>'reserved' <> '1' then raise exception 'Unknown checkout stopped consuming allocatable capacity'; end if;
  update private.membership_subscriptions set checkout_attempt_state='terminal',checkout_terminal_confirmed_at=now() where id=subscription;
  perform private.release_ended_membership_slots();
  subscription := private.reserve_full_membership_slot(md5('capacity-qa:3')::uuid,md5('request:immediate')::uuid);
  perform private.activate_full_membership_slot(subscription,now()-interval '1 day',now()+interval '1 day');
  perform private.end_full_membership(subscription,now(),'cancelled');
  if (select state from private.membership_subscriptions where id=subscription) <> 'cancelled' or
    exists(select 1 from private.membership_slot_claims where subscription_id=subscription) then
    raise exception 'Actual immediate end did not preserve terminal state/release its slot';
  end if;
end $$;
reset role;

insert into public.membership_entitlements(user_id,enabled,source)
  values(md5('capacity-qa:600')::uuid,true,'manual');
do $$
begin
  if private.full_membership_capacity_snapshot()->>'count_verified' <> 'false' then raise exception 'Unmapped grant was presented as verified occupancy'; end if;
  begin
    perform private.reserve_full_membership_slot(md5('capacity-qa:3')::uuid,md5('request:3')::uuid);
    raise exception 'Capacity cutover ignored existing full grant';
  exception when sqlstate '55000' then null; end;
end $$;
delete from public.membership_entitlements where user_id=md5('capacity-qa:600')::uuid;
do $$
begin
  begin
    insert into private.membership_waitlist(email_normalized,state,invited_at,invitation_token_hash)
      values('invitation@example.test','invited',now(),'test-hash');
    raise exception 'Invitation without expiry accepted';
  exception when check_violation then null; end;
  begin
    insert into private.membership_subscriptions(user_id,checkout_idempotency_key,state,entitlement_starts_at)
      values(md5('capacity-qa:600')::uuid,gen_random_uuid(),'active',now());
    raise exception 'Active subscription without expiry accepted';
  exception when check_violation then null; end;
end $$;

-- Exactly 599 synthetic paid members for a real two-connection final-slot race.
insert into private.membership_subscriptions(id,user_id,checkout_idempotency_key,state,entitlement_starts_at,entitlement_ends_at,payment_status)
  select md5('fixture-sub:'||n)::uuid,md5('capacity-qa:'||n)::uuid,md5('fixture-request:'||n)::uuid,
    'active',now()-interval '1 day',now()+interval '1 day','paid' from generate_series(1,599)n;
insert into private.membership_slot_claims(slot_number,subscription_id,user_id,idempotency_key,claim_state)
  select n,md5('fixture-sub:'||n)::uuid,md5('capacity-qa:'||n)::uuid,md5('fixture-request:'||n)::uuid,'allocated' from generate_series(1,599)n;
do $$
begin
  begin
    insert into private.membership_slot_claims(slot_number,subscription_id,user_id,idempotency_key,claim_state)
      values(601,md5('fixture-sub:1')::uuid,md5('capacity-qa:1')::uuid,gen_random_uuid(),'allocated');
    raise exception 'Slot 601 accepted';
  exception when check_violation then null; end;
  if private.full_membership_capacity_snapshot()->>'active' <> '599' then raise exception 'Incorrect authoritative active count'; end if;
end $$;
