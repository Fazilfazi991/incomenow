-- Legacy grants consume numbered capacity without fabricated provider subscriptions.
-- Entitlements themselves, their windows and sources are preserved verbatim.
alter table public.membership_entitlements add constraint membership_entitlement_id_user_unique unique(id,user_id);
alter table private.membership_slot_claims alter column subscription_id drop not null;
alter table private.membership_slot_claims add column legacy_entitlement_id uuid unique;
alter table private.membership_slot_claims add constraint membership_claim_legacy_owner
  foreign key(legacy_entitlement_id,user_id) references public.membership_entitlements(id,user_id);
alter table private.membership_slot_claims add constraint membership_claim_one_source
  check((subscription_id is not null)::integer+(legacy_entitlement_id is not null)::integer=1);
alter table private.membership_slot_claims add constraint membership_claim_legacy_allocated
  check(legacy_entitlement_id is null or claim_state='allocated');

create or replace function private.release_ended_membership_slots()
returns void language plpgsql security invoker set search_path='' as $$
begin
  perform 1 from private.membership_capacity_policy where id for update;
  update private.membership_subscriptions s set state='expired',ended_at=now(),updated_at=now()
    where ((s.state='cancel_at_period_end' and s.entitlement_ends_at<=now())
      or (s.state='pending' and s.checkout_attempt_state='not_started' and s.checkout_expires_at<=now()))
      and (s.reconcile_until is null or s.reconcile_until<=now());
  delete from private.membership_slot_claims c using private.membership_subscriptions s
    where s.id=c.subscription_id and s.state in ('expired','cancelled');
  delete from private.membership_slot_claims c using public.membership_entitlements e
    where e.id=c.legacy_entitlement_id and (not e.enabled or e.revoked_at is not null or e.expires_at<=now());
  update private.membership_waitlist set state='expired',updated_at=now()
    where state='invited' and invitation_expires_at<=now();
end;
$$;

create function private.adopt_existing_full_membership_grants()
returns integer language plpgsql security invoker set search_path='' as $$
declare v_grant public.membership_entitlements;v_slot integer;v_count integer:=0;
begin
  perform 1 from private.membership_capacity_policy where id for update;
  perform private.release_ended_membership_slots();
  if (select count(*) from private.membership_slot_claims)+
    (select count(*) from public.membership_entitlements e where e.enabled and e.revoked_at is null
      and (e.expires_at is null or e.expires_at>now())
      and not exists(select 1 from private.membership_slot_claims c where c.user_id=e.user_id))>600 then
    raise exception 'Legacy grants exceed capacity; retain access and keep checkout closed' using errcode='23514';
  end if;
  for v_grant in select * from public.membership_entitlements e where e.enabled and e.revoked_at is null
    and (e.expires_at is null or e.expires_at>now())
    and not exists(select 1 from private.membership_slot_claims c where c.user_id=e.user_id)
    order by e.created_at,e.id for update loop
    if v_grant.source='billing_provider' then
      raise exception 'Provider grant requires a verified subscription binding' using errcode='55000';
    end if;
    select n into v_slot from generate_series(1,600)n where not exists(select 1 from private.membership_slot_claims c where c.slot_number=n) order by n limit 1;
    insert into private.membership_slot_claims(slot_number,user_id,idempotency_key,claim_state,legacy_entitlement_id)
      values(v_slot,v_grant.user_id,gen_random_uuid(),'allocated',v_grant.id);
    v_count:=v_count+1;
  end loop;
  return v_count;
end;
$$;
revoke all on function private.adopt_existing_full_membership_grants() from public,anon,authenticated;
grant execute on function private.adopt_existing_full_membership_grants() to service_role;
select private.adopt_existing_full_membership_grants();
