create schema if not exists private;

revoke all on schema private from public, anon, authenticated;

create table public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text check (display_name is null or char_length(display_name) between 1 and 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is 'Minimal member profile data. Authentication identity remains in auth.users.';

create table public.membership_entitlements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  enabled boolean not null default false,
  starts_at timestamptz,
  expires_at timestamptz,
  revoked_at timestamptz,
  source text not null check (source in ('manual', 'complimentary', 'billing_provider', 'migration')),
  source_reference text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint membership_entitlement_window check (
    expires_at is null or starts_at is null or expires_at > starts_at
  )
);

comment on table public.membership_entitlements is 'Provider-independent membership grants. Users can read only their own grant and cannot mutate grants.';
comment on column public.membership_entitlements.source_reference is 'Optional provider or operator reference; never a payment credential.';

alter table public.profiles enable row level security;
alter table public.membership_entitlements enable row level security;

revoke all on table public.profiles from anon, authenticated;
revoke all on table public.membership_entitlements from anon, authenticated;

grant select on table public.profiles to authenticated;
grant update (display_name) on table public.profiles to authenticated;
grant select (
  user_id,
  enabled,
  starts_at,
  expires_at,
  revoked_at,
  source,
  created_at,
  updated_at
) on table public.membership_entitlements to authenticated;

create policy "members read own profile"
on public.profiles
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "members update own display name"
on public.profiles
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "members read own entitlement"
on public.membership_entitlements
for select
to authenticated
using ((select auth.uid()) = user_id);

create or replace function private.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function private.set_updated_at();

create trigger membership_entitlements_set_updated_at
before update on public.membership_entitlements
for each row execute function private.set_updated_at();

create or replace function private.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (user_id, display_name)
  values (
    new.id,
    nullif(left(trim(coalesce(new.raw_user_meta_data ->> 'display_name', '')), 100), '')
  )
  on conflict (user_id) do nothing;

  return new;
end;
$$;

revoke all on function private.set_updated_at() from public, anon, authenticated;
revoke all on function private.handle_new_auth_user() from public, anon, authenticated;

create trigger on_auth_user_created_create_profile
after insert on auth.users
for each row execute function private.handle_new_auth_user();
