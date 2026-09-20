create or replace function private.text_array_has_unique_values(values_to_check text[])
returns boolean
language sql
immutable
strict
security invoker
set search_path = ''
as $$
  select cardinality(values_to_check) = (
    select count(distinct value)
    from unnest(values_to_check) as value
  );
$$;

create table public.account_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  interest_categories text[] not null default '{}'::text[],
  experience_level text,
  preferred_approach text,
  onboarding_state text not null default 'unanswered',
  revision integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint account_preferences_interests_allowed check (
    cardinality(interest_categories) <= 5
    and array_position(interest_categories, null) is null
    and interest_categories <@ array[
      'custom-crm',
      'lead-generation-website',
      'automation',
      'web-tool',
      'digital-service'
    ]::text[]
    and private.text_array_has_unique_values(interest_categories)
  ),
  constraint account_preferences_experience_allowed check (
    experience_level is null or experience_level in (
      'just-starting',
      'adapting-tools',
      'comfortable-with-code'
    )
  ),
  constraint account_preferences_approach_allowed check (
    preferred_approach is null or preferred_approach in (
      'client-service',
      'reusable-product',
      'exploring'
    )
  ),
  constraint account_preferences_onboarding_state_allowed check (
    onboarding_state in ('unanswered', 'completed', 'skipped')
  ),
  constraint account_preferences_revision_nonnegative check (revision >= 0)
);

comment on table public.account_preferences is 'Optional account-owned discovery preferences. These values never grant membership or filter protected content.';
comment on column public.account_preferences.revision is 'Server-managed optimistic concurrency revision.';
comment on column public.account_preferences.onboarding_state is 'Convenience state only; never an authorization or entitlement claim.';

alter table public.account_preferences enable row level security;

revoke all on table public.account_preferences from anon, authenticated;
grant select on table public.account_preferences to authenticated;

create policy "accounts read own preferences"
on public.account_preferences
for select
to authenticated
using ((select auth.uid()) = user_id);

create trigger account_preferences_set_updated_at
before update on public.account_preferences
for each row execute function private.set_updated_at();

create or replace function public.save_account_preferences(
  p_interest_categories text[],
  p_experience_level text,
  p_preferred_approach text,
  p_expected_revision integer,
  p_mark_completed boolean
)
returns table (
  saved_interest_categories text[],
  saved_experience_level text,
  saved_preferred_approach text,
  saved_onboarding_state text,
  saved_revision integer,
  saved_updated_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  account_id uuid := auth.uid();
  current_revision integer;
begin
  if account_id is null then
    raise exception 'Verified account required' using errcode = '42501';
  end if;
  if p_interest_categories is null
    or cardinality(p_interest_categories) > 5
    or array_position(p_interest_categories, null) is not null
    or not p_interest_categories <@ array[
      'custom-crm',
      'lead-generation-website',
      'automation',
      'web-tool',
      'digital-service'
    ]::text[]
    or not private.text_array_has_unique_values(p_interest_categories)
    or (p_experience_level is not null and p_experience_level not in ('just-starting', 'adapting-tools', 'comfortable-with-code'))
    or (p_preferred_approach is not null and p_preferred_approach not in ('client-service', 'reusable-product', 'exploring'))
    or p_expected_revision is null
    or p_expected_revision < 0
    or p_mark_completed is null
  then
    raise exception 'Invalid account preferences' using errcode = '22023';
  end if;

  select revision
  into current_revision
  from public.account_preferences
  where user_id = account_id
  for update;

  if not found then
    if p_expected_revision <> 0 then
      raise exception 'Preferences changed in another session' using errcode = '40001';
    end if;

    return query
    insert into public.account_preferences as preferences (
      user_id,
      interest_categories,
      experience_level,
      preferred_approach,
      onboarding_state,
      revision
    )
    values (
      account_id,
      p_interest_categories,
      p_experience_level,
      p_preferred_approach,
      'completed',
      1
    )
    returning
      preferences.interest_categories,
      preferences.experience_level,
      preferences.preferred_approach,
      preferences.onboarding_state,
      preferences.revision,
      preferences.updated_at;
    return;
  end if;

  if current_revision <> p_expected_revision then
    raise exception 'Preferences changed in another session' using errcode = '40001';
  end if;

  return query
  update public.account_preferences as preferences
  set interest_categories = p_interest_categories,
      experience_level = p_experience_level,
      preferred_approach = p_preferred_approach,
      onboarding_state = case
        when p_mark_completed then 'completed'
        when preferences.onboarding_state = 'unanswered' then 'completed'
        else preferences.onboarding_state
      end,
      revision = preferences.revision + 1
  where preferences.user_id = account_id
  returning
    preferences.interest_categories,
    preferences.experience_level,
    preferences.preferred_approach,
    preferences.onboarding_state,
    preferences.revision,
    preferences.updated_at;
end;
$$;

create or replace function public.skip_account_onboarding(p_expected_revision integer)
returns table (
  saved_interest_categories text[],
  saved_experience_level text,
  saved_preferred_approach text,
  saved_onboarding_state text,
  saved_revision integer,
  saved_updated_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  account_id uuid := auth.uid();
  current_revision integer;
  current_state text;
begin
  if account_id is null then
    raise exception 'Verified account required' using errcode = '42501';
  end if;
  if p_expected_revision is null or p_expected_revision < 0 then
    raise exception 'Invalid preference revision' using errcode = '22023';
  end if;

  select revision, onboarding_state
  into current_revision, current_state
  from public.account_preferences
  where user_id = account_id
  for update;

  if not found then
    if p_expected_revision <> 0 then
      raise exception 'Preferences changed in another session' using errcode = '40001';
    end if;

    return query
    insert into public.account_preferences as preferences (user_id, onboarding_state, revision)
    values (account_id, 'skipped', 1)
    returning
      preferences.interest_categories,
      preferences.experience_level,
      preferences.preferred_approach,
      preferences.onboarding_state,
      preferences.revision,
      preferences.updated_at;
    return;
  end if;

  if current_revision <> p_expected_revision then
    raise exception 'Preferences changed in another session' using errcode = '40001';
  end if;

  if current_state <> 'unanswered' then
    return query
    select
      preferences.interest_categories,
      preferences.experience_level,
      preferences.preferred_approach,
      preferences.onboarding_state,
      preferences.revision,
      preferences.updated_at
    from public.account_preferences as preferences
    where preferences.user_id = account_id;
    return;
  end if;

  return query
  update public.account_preferences as preferences
  set onboarding_state = 'skipped',
      revision = preferences.revision + 1
  where preferences.user_id = account_id
  returning
    preferences.interest_categories,
    preferences.experience_level,
    preferences.preferred_approach,
    preferences.onboarding_state,
    preferences.revision,
    preferences.updated_at;
end;
$$;

revoke all on function private.text_array_has_unique_values(text[]) from public, anon, authenticated;
revoke all on function public.save_account_preferences(text[], text, text, integer, boolean) from public, anon, authenticated;
revoke all on function public.skip_account_onboarding(integer) from public, anon, authenticated;

grant execute on function public.save_account_preferences(text[], text, text, integer, boolean) to authenticated;
grant execute on function public.skip_account_onboarding(integer) to authenticated;
