create table public.idea_access_grants (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  offer_code text not null,
  idea_id text not null references private.workspace_idea_definitions(idea_id),
  enabled boolean not null default false,
  starts_at timestamptz,
  expires_at timestamptz,
  revoked_at timestamptz,
  source text not null,
  source_reference text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint idea_access_grants_supported_offer check (
    offer_code = 'starter-pergola-v1' and idea_id = 'idea-001'
  ),
  constraint idea_access_grants_source_allowed check (
    source in ('manual', 'complimentary', 'billing_provider', 'migration', 'local_test')
  ),
  constraint idea_access_grants_window_valid check (
    expires_at is null or starts_at is null or expires_at > starts_at
  ),
  unique (user_id, offer_code),
  unique (user_id, idea_id, offer_code)
);

comment on table public.idea_access_grants is 'Trusted per-idea grants. The first supported offer is fixed to the canonical Pergola idea and ordinary accounts cannot mutate it.';
comment on column public.idea_access_grants.source_reference is 'Optional privileged operator or future idempotent payment reference; never a payment credential.';
comment on column public.idea_access_grants.expires_at is 'Null means no configured expiry boundary; it is not a commercial lifetime-access promise.';

create index idea_access_grants_user_idea_idx
on public.idea_access_grants (user_id, idea_id);

alter table public.idea_access_grants enable row level security;
revoke all on table public.idea_access_grants from anon, authenticated;
grant select (
  id,
  user_id,
  offer_code,
  idea_id,
  enabled,
  starts_at,
  expires_at,
  revoked_at,
  source,
  created_at,
  updated_at
) on table public.idea_access_grants to authenticated;

create policy "accounts read own idea grants"
on public.idea_access_grants
for select
to authenticated
using ((select auth.uid()) = user_id);

create trigger idea_access_grants_set_updated_at
before update on public.idea_access_grants
for each row execute function private.set_updated_at();

create or replace function private.account_has_active_idea_access(p_idea_id text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select (select auth.uid()) is not null
    and (
      exists (
        select 1
        from public.membership_entitlements as entitlement
        where entitlement.user_id = (select auth.uid())
          and entitlement.enabled
          and entitlement.revoked_at is null
          and (entitlement.starts_at is null or entitlement.starts_at <= now())
          and (entitlement.expires_at is null or entitlement.expires_at > now())
      )
      or exists (
        select 1
        from public.idea_access_grants as idea_grant
        where idea_grant.user_id = (select auth.uid())
          and idea_grant.idea_id = p_idea_id
          and idea_grant.enabled
          and idea_grant.revoked_at is null
          and (idea_grant.starts_at is null or idea_grant.starts_at <= now())
          and (idea_grant.expires_at is null or idea_grant.expires_at > now())
      )
    );
$$;

create or replace function private.account_can_access_project(p_project_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.projects as project
    where project.id = p_project_id
      and project.user_id = (select auth.uid())
      and private.account_has_active_idea_access(project.idea_id)
  );
$$;

create or replace function private.require_idea_access(p_idea_id text)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  account_id uuid := (select auth.uid());
begin
  if account_id is null or not (select private.account_has_active_idea_access(p_idea_id)) then
    raise exception 'Idea access required' using errcode = '42501';
  end if;
  return account_id;
end;
$$;

revoke all on function private.account_has_active_idea_access(text) from public, anon, authenticated;
revoke all on function private.account_can_access_project(uuid) from public, anon, authenticated;
revoke all on function private.require_idea_access(text) from public, anon, authenticated;
grant usage on schema private to authenticated;
grant execute on function private.account_has_active_idea_access(text) to authenticated;
grant execute on function private.account_can_access_project(uuid) to authenticated;

drop policy if exists "active members read own bookmarks" on public.bookmarks;
drop policy if exists "active members save own bookmarks" on public.bookmarks;
drop policy if exists "active members remove own bookmarks" on public.bookmarks;

create policy "accounts read own bookmarks"
on public.bookmarks for select to authenticated
using ((select auth.uid()) = user_id);

create policy "accounts save own bookmarks"
on public.bookmarks for insert to authenticated
with check ((select auth.uid()) = user_id);

create policy "accounts remove own bookmarks"
on public.bookmarks for delete to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "active members read own projects" on public.projects;
drop policy if exists "active members read own project stages" on public.project_stages;
drop policy if exists "active members read own project tasks" on public.project_tasks;
drop policy if exists "active members read own stage notes" on public.project_stage_notes;

create policy "accounts read authorised own projects"
on public.projects for select to authenticated
using (
  (select auth.uid()) = user_id
  and (select private.account_has_active_idea_access(idea_id))
);

create policy "accounts read authorised own project stages"
on public.project_stages for select to authenticated
using ((select private.account_can_access_project(project_id)));

create policy "accounts read authorised own project tasks"
on public.project_tasks for select to authenticated
using ((select private.account_can_access_project(project_id)));

create policy "accounts read authorised own stage notes"
on public.project_stage_notes for select to authenticated
using ((select private.account_can_access_project(project_id)));

create or replace function public.start_member_project(p_idea_id text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  account_id uuid := private.require_idea_access(p_idea_id);
  selected_version text;
  selected_project_id uuid;
  created_project boolean := false;
begin
  if p_idea_id is null or p_idea_id !~ '^idea-[0-9]{3}$' then
    raise exception 'Project definition unavailable' using errcode = '22023';
  end if;

  select version into selected_version
  from private.workspace_plan_versions
  where idea_id = p_idea_id and is_current;

  if selected_version is null
    or not exists (
      select 1
      from private.workspace_stage_definitions
      where idea_id = p_idea_id and plan_version = selected_version
    )
    or exists (
      select 1
      from private.workspace_stage_definitions as stage
      where stage.idea_id = p_idea_id
        and stage.plan_version = selected_version
        and not exists (
          select 1
          from private.workspace_task_definitions as task
          where task.idea_id = stage.idea_id
            and task.plan_version = stage.plan_version
            and task.stage_id = stage.stage_id
            and task.required
        )
    ) then
    raise exception 'Project definition unavailable' using errcode = '22023';
  end if;

  insert into public.projects (user_id, idea_id, plan_version)
  values (account_id, p_idea_id, selected_version)
  on conflict (user_id, idea_id) do nothing
  returning id into selected_project_id;

  created_project := selected_project_id is not null;

  if not created_project then
    select id into selected_project_id
    from public.projects
    where user_id = account_id and idea_id = p_idea_id;
    return selected_project_id;
  end if;

  insert into public.project_stages (project_id, idea_id, plan_version, stage_id, position)
  select selected_project_id, stage.idea_id, stage.plan_version, stage.stage_id, stage.position
  from private.workspace_stage_definitions as stage
  where stage.idea_id = p_idea_id and stage.plan_version = selected_version
  order by stage.position;

  insert into public.project_tasks (
    project_id, idea_id, plan_version, stage_id, task_id, position, required
  )
  select selected_project_id, task.idea_id, task.plan_version, task.stage_id, task.task_id, task.position, task.required
  from private.workspace_task_definitions as task
  where task.idea_id = p_idea_id and task.plan_version = selected_version
  order by task.stage_id, task.position;

  insert into public.project_stage_notes (project_id, idea_id, plan_version, stage_id)
  select selected_project_id, stage.idea_id, stage.plan_version, stage.stage_id
  from private.workspace_stage_definitions as stage
  where stage.idea_id = p_idea_id and stage.plan_version = selected_version
  order by stage.position;

  return selected_project_id;
end;
$$;

create or replace function public.set_member_project_paused(p_project_id uuid, p_paused boolean)
returns timestamptz
language plpgsql
security definer
set search_path = ''
as $$
declare
  account_id uuid := (select auth.uid());
  current_paused_at timestamptz;
begin
  select paused_at into current_paused_at
  from public.projects
  where id = p_project_id
    and user_id = account_id
    and private.account_has_active_idea_access(idea_id)
  for update;

  if account_id is null or not found then
    raise exception 'Project unavailable' using errcode = 'P0002';
  end if;

  if p_paused
    and exists (select 1 from public.project_tasks where project_id = p_project_id and required)
    and not exists (
      select 1 from public.project_tasks
      where project_id = p_project_id and required and completed_at is null
    ) then
    raise exception 'Completed projects cannot be paused' using errcode = '22023';
  end if;

  update public.projects
  set paused_at = case when p_paused then coalesce(current_paused_at, now()) else null end
  where id = p_project_id
  returning paused_at into current_paused_at;

  return current_paused_at;
end;
$$;

create or replace function public.set_member_project_task_completed(
  p_project_id uuid,
  p_stage_id text,
  p_task_id text,
  p_completed boolean
)
returns timestamptz
language plpgsql
security definer
set search_path = ''
as $$
declare
  account_id uuid := (select auth.uid());
  project_paused_at timestamptz;
  result_completed_at timestamptz;
begin
  select paused_at into project_paused_at
  from public.projects
  where id = p_project_id
    and user_id = account_id
    and private.account_has_active_idea_access(idea_id)
  for update;

  if account_id is null or not found then
    raise exception 'Project unavailable' using errcode = 'P0002';
  end if;
  if project_paused_at is not null then
    raise exception 'Resume the project before editing progress' using errcode = '55000';
  end if;

  update public.project_tasks
  set completed_at = case when p_completed then coalesce(completed_at, now()) else null end
  where project_id = p_project_id and stage_id = p_stage_id and task_id = p_task_id
  returning completed_at into result_completed_at;

  if not found then
    raise exception 'Task unavailable' using errcode = 'P0002';
  end if;

  return result_completed_at;
end;
$$;

create or replace function public.save_member_project_stage_note(
  p_project_id uuid,
  p_stage_id text,
  p_content text,
  p_expected_revision integer
)
returns table (saved_content text, saved_revision integer, saved_updated_at timestamptz)
language plpgsql
security definer
set search_path = ''
as $$
declare
  account_id uuid := (select auth.uid());
  project_paused_at timestamptz;
begin
  if p_content is null or char_length(p_content) > 4000 or p_expected_revision < 0 then
    raise exception 'Invalid note' using errcode = '22023';
  end if;

  select paused_at into project_paused_at
  from public.projects
  where id = p_project_id
    and user_id = account_id
    and private.account_has_active_idea_access(idea_id)
  for update;

  if account_id is null or not found then
    raise exception 'Project unavailable' using errcode = 'P0002';
  end if;
  if project_paused_at is not null then
    raise exception 'Resume the project before editing notes' using errcode = '55000';
  end if;

  return query
  update public.project_stage_notes
  set content = p_content,
      revision = revision + 1
  where project_id = p_project_id
    and stage_id = p_stage_id
    and revision = p_expected_revision
  returning content, revision, updated_at;

  if not found then
    if exists (
      select 1 from public.project_stage_notes
      where project_id = p_project_id and stage_id = p_stage_id
    ) then
      raise exception 'The saved note changed in another session' using errcode = '40001';
    end if;
    raise exception 'Stage note unavailable' using errcode = 'P0002';
  end if;
end;
$$;

revoke all on function public.start_member_project(text) from public, anon, authenticated;
revoke all on function public.set_member_project_paused(uuid, boolean) from public, anon, authenticated;
revoke all on function public.set_member_project_task_completed(uuid, text, text, boolean) from public, anon, authenticated;
revoke all on function public.save_member_project_stage_note(uuid, text, text, integer) from public, anon, authenticated;

grant execute on function public.start_member_project(text) to authenticated;
grant execute on function public.set_member_project_paused(uuid, boolean) to authenticated;
grant execute on function public.set_member_project_task_completed(uuid, text, text, boolean) to authenticated;
grant execute on function public.save_member_project_stage_note(uuid, text, text, integer) to authenticated;
