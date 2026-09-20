create table private.workspace_idea_definitions (
  idea_id text primary key check (idea_id ~ '^idea-[0-9]{3}$')
);

create table private.workspace_plan_versions (
  idea_id text not null references private.workspace_idea_definitions(idea_id),
  version text not null check (version ~ '^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$'),
  is_current boolean not null default false,
  created_at timestamptz not null default now(),
  primary key (idea_id, version)
);

create unique index workspace_plan_versions_one_current
on private.workspace_plan_versions (idea_id)
where is_current;

create table private.workspace_stage_definitions (
  idea_id text not null,
  plan_version text not null,
  stage_id text not null check (stage_id ~ '^[a-z0-9-]+$'),
  position integer not null check (position > 0),
  primary key (idea_id, plan_version, stage_id),
  unique (idea_id, plan_version, position),
  foreign key (idea_id, plan_version)
    references private.workspace_plan_versions(idea_id, version)
);

create table private.workspace_task_definitions (
  idea_id text not null,
  plan_version text not null,
  stage_id text not null,
  task_id text not null check (task_id ~ '^[a-z0-9-]+$'),
  position integer not null check (position > 0),
  required boolean not null default true,
  primary key (idea_id, plan_version, stage_id, task_id),
  unique (idea_id, plan_version, stage_id, position),
  foreign key (idea_id, plan_version, stage_id)
    references private.workspace_stage_definitions(idea_id, plan_version, stage_id)
);

comment on table private.workspace_idea_definitions is 'Code-maintained idea identifiers used only to constrain member workspace records.';
comment on table private.workspace_plan_versions is 'Immutable structural project-plan versions. Repository content remains the editorial source of truth.';

insert into private.workspace_idea_definitions (idea_id)
values ('idea-001'), ('idea-002'), ('idea-003'), ('idea-004'), ('idea-005'), ('idea-034');

insert into private.workspace_plan_versions (idea_id, version, is_current)
values ('idea-001', '1', true), ('idea-003', '1', true), ('idea-004', '1', true);

insert into private.workspace_stage_definitions (idea_id, plan_version, stage_id, position)
values
  ('idea-001', '1', 'crm-validate', 1),
  ('idea-001', '1', 'crm-adapt', 2),
  ('idea-001', '1', 'crm-offer', 3),
  ('idea-001', '1', 'crm-research', 4),
  ('idea-001', '1', 'crm-pilot', 5),
  ('idea-001', '1', 'crm-launch', 6),
  ('idea-003', '1', 'auto-map', 1),
  ('idea-003', '1', 'auto-rules', 2),
  ('idea-003', '1', 'auto-configure', 3),
  ('idea-003', '1', 'auto-test', 4),
  ('idea-003', '1', 'auto-pilot', 5),
  ('idea-003', '1', 'auto-handover', 6),
  ('idea-004', '1', 'lead-niche', 1),
  ('idea-004', '1', 'lead-buyers', 2),
  ('idea-004', '1', 'lead-partners', 3),
  ('idea-004', '1', 'lead-prototype', 4),
  ('idea-004', '1', 'lead-pilot', 5);

insert into private.workspace_task_definitions (idea_id, plan_version, stage_id, task_id, position, required)
values
  ('idea-001', '1', 'crm-validate', 'region-segment', 1, true),
  ('idea-001', '1', 'crm-validate', 'operator-interviews', 2, true),
  ('idea-001', '1', 'crm-validate', 'process-map', 3, true),
  ('idea-001', '1', 'crm-adapt', 'field-inventory', 1, true),
  ('idea-001', '1', 'crm-adapt', 'quotation-states', 2, true),
  ('idea-001', '1', 'crm-adapt', 'scope-trim', 3, true),
  ('idea-001', '1', 'crm-offer', 'scope-sheet', 1, true),
  ('idea-001', '1', 'crm-offer', 'ownership-support', 2, true),
  ('idea-001', '1', 'crm-research', 'prospect-list', 1, true),
  ('idea-001', '1', 'crm-research', 'bespoke-quote-priority', 2, true),
  ('idea-001', '1', 'crm-pilot', 'focused-demo', 1, true),
  ('idea-001', '1', 'crm-pilot', 'success-exit', 2, true),
  ('idea-001', '1', 'crm-launch', 'permission-tests', 1, true),
  ('idea-001', '1', 'crm-launch', 'recovery-ownership', 2, true),
  ('idea-003', '1', 'auto-map', 'source-of-truth', 1, true),
  ('idea-003', '1', 'auto-map', 'reply-recording', 2, true),
  ('idea-003', '1', 'auto-rules', 'offsets', 1, true),
  ('idea-003', '1', 'auto-rules', 'calendar-exclusions', 2, true),
  ('idea-003', '1', 'auto-configure', 'field-map', 1, true),
  ('idea-003', '1', 'auto-configure', 'task-destinations', 2, true),
  ('idea-003', '1', 'auto-test', 'duplicate-run', 1, true),
  ('idea-003', '1', 'auto-test', 'missing-data', 2, true),
  ('idea-003', '1', 'auto-test', 'expired-connection', 3, true),
  ('idea-003', '1', 'auto-pilot', 'five-day-trial', 1, true),
  ('idea-003', '1', 'auto-pilot', 'daily-audit', 2, true),
  ('idea-003', '1', 'auto-handover', 'handover-matrix', 1, true),
  ('idea-003', '1', 'auto-handover', 'maintenance-review', 2, true),
  ('idea-004', '1', 'lead-niche', 'service-category', 1, true),
  ('idea-004', '1', 'lead-niche', 'postcode-cluster', 2, true),
  ('idea-004', '1', 'lead-buyers', 'urgency-signals', 1, true),
  ('idea-004', '1', 'lead-buyers', 'trust-questions', 2, true),
  ('idea-004', '1', 'lead-partners', 'provider-interviews', 1, true),
  ('idea-004', '1', 'lead-partners', 'manual-handoff', 2, true),
  ('idea-004', '1', 'lead-prototype', 'landing-page', 1, true),
  ('idea-004', '1', 'lead-prototype', 'qualification-fields', 2, true),
  ('idea-004', '1', 'lead-pilot', 'manual-routing', 1, true),
  ('idea-004', '1', 'lead-pilot', 'response-review', 2, true);

create table public.bookmarks (
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  idea_id text not null references private.workspace_idea_definitions(idea_id),
  saved_at timestamptz not null default now(),
  primary key (user_id, idea_id)
);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  idea_id text not null,
  plan_version text not null,
  paused_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, idea_id),
  unique (id, idea_id, plan_version),
  foreign key (idea_id, plan_version)
    references private.workspace_plan_versions(idea_id, version)
);

create index projects_user_updated_at_idx on public.projects (user_id, updated_at desc);

create table public.project_stages (
  project_id uuid not null,
  idea_id text not null,
  plan_version text not null,
  stage_id text not null,
  position integer not null check (position > 0),
  created_at timestamptz not null default now(),
  primary key (project_id, stage_id),
  unique (project_id, position),
  unique (project_id, idea_id, plan_version, stage_id),
  foreign key (project_id, idea_id, plan_version)
    references public.projects(id, idea_id, plan_version) on delete cascade,
  foreign key (idea_id, plan_version, stage_id)
    references private.workspace_stage_definitions(idea_id, plan_version, stage_id)
);

create table public.project_tasks (
  project_id uuid not null,
  idea_id text not null,
  plan_version text not null,
  stage_id text not null,
  task_id text not null,
  position integer not null check (position > 0),
  required boolean not null default true,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (project_id, stage_id, task_id),
  unique (project_id, stage_id, position),
  foreign key (project_id, idea_id, plan_version, stage_id)
    references public.project_stages(project_id, idea_id, plan_version, stage_id) on delete cascade,
  foreign key (idea_id, plan_version, stage_id, task_id)
    references private.workspace_task_definitions(idea_id, plan_version, stage_id, task_id)
);

create table public.project_stage_notes (
  project_id uuid not null,
  idea_id text not null,
  plan_version text not null,
  stage_id text not null,
  content text not null default '' check (char_length(content) <= 4000),
  revision integer not null default 0 check (revision >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (project_id, stage_id),
  foreign key (project_id, idea_id, plan_version, stage_id)
    references public.project_stages(project_id, idea_id, plan_version, stage_id) on delete cascade
);

comment on table public.bookmarks is 'Account-synced idea shortlist. Saving and starting a project are independent.';
comment on table public.projects is 'Member-owned project pinned to an immutable structural plan version.';
comment on table public.project_tasks is 'Task completion is the source of truth for derived stage and project progress.';
comment on table public.project_stage_notes is 'One plain-text, revisioned note per project stage.';

alter table public.bookmarks enable row level security;
alter table public.projects enable row level security;
alter table public.project_stages enable row level security;
alter table public.project_tasks enable row level security;
alter table public.project_stage_notes enable row level security;

revoke all on table public.bookmarks from anon, authenticated;
revoke all on table public.projects from anon, authenticated;
revoke all on table public.project_stages from anon, authenticated;
revoke all on table public.project_tasks from anon, authenticated;
revoke all on table public.project_stage_notes from anon, authenticated;

grant select on table public.bookmarks to authenticated;
grant insert (idea_id) on table public.bookmarks to authenticated;
grant delete on table public.bookmarks to authenticated;
grant select on table public.projects to authenticated;
grant select on table public.project_stages to authenticated;
grant select on table public.project_tasks to authenticated;
grant select on table public.project_stage_notes to authenticated;

create or replace function private.member_has_active_access()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select (select auth.uid()) is not null
    and exists (
      select 1
      from public.membership_entitlements as entitlement
      where entitlement.user_id = (select auth.uid())
        and entitlement.enabled
        and entitlement.revoked_at is null
        and (entitlement.starts_at is null or entitlement.starts_at <= now())
        and (entitlement.expires_at is null or entitlement.expires_at > now())
    );
$$;

revoke all on function private.member_has_active_access() from public, anon, authenticated;
grant usage on schema private to authenticated;
grant execute on function private.member_has_active_access() to authenticated;

create policy "active members read own bookmarks"
on public.bookmarks for select to authenticated
using ((select auth.uid()) = user_id and (select private.member_has_active_access()));

create policy "active members save own bookmarks"
on public.bookmarks for insert to authenticated
with check ((select auth.uid()) = user_id and (select private.member_has_active_access()));

create policy "active members remove own bookmarks"
on public.bookmarks for delete to authenticated
using ((select auth.uid()) = user_id and (select private.member_has_active_access()));

create policy "active members read own projects"
on public.projects for select to authenticated
using ((select auth.uid()) = user_id and (select private.member_has_active_access()));

create policy "active members read own project stages"
on public.project_stages for select to authenticated
using (
  (select private.member_has_active_access())
  and exists (
    select 1 from public.projects as project
    where project.id = public.project_stages.project_id
      and project.user_id = (select auth.uid())
  )
);

create policy "active members read own project tasks"
on public.project_tasks for select to authenticated
using (
  (select private.member_has_active_access())
  and exists (
    select 1 from public.projects as project
    where project.id = public.project_tasks.project_id
      and project.user_id = (select auth.uid())
  )
);

create policy "active members read own stage notes"
on public.project_stage_notes for select to authenticated
using (
  (select private.member_has_active_access())
  and exists (
    select 1 from public.projects as project
    where project.id = public.project_stage_notes.project_id
      and project.user_id = (select auth.uid())
  )
);

create or replace function private.require_active_member()
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  member_id uuid := (select auth.uid());
begin
  if member_id is null or not (select private.member_has_active_access()) then
    raise exception 'Active membership required' using errcode = '42501';
  end if;
  return member_id;
end;
$$;

create or replace function private.touch_workspace_updated_at()
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

create or replace function private.touch_parent_project()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  update public.projects set updated_at = now() where id = new.project_id;
  return new;
end;
$$;

create trigger projects_set_updated_at
before update on public.projects
for each row execute function private.touch_workspace_updated_at();

create trigger project_tasks_set_updated_at
before update on public.project_tasks
for each row execute function private.touch_workspace_updated_at();

create trigger project_stage_notes_set_updated_at
before update on public.project_stage_notes
for each row execute function private.touch_workspace_updated_at();

create trigger project_tasks_touch_parent
after update on public.project_tasks
for each row execute function private.touch_parent_project();

create trigger project_stage_notes_touch_parent
after update on public.project_stage_notes
for each row execute function private.touch_parent_project();

revoke all on function private.require_active_member() from public, anon, authenticated;
revoke all on function private.touch_workspace_updated_at() from public, anon, authenticated;
revoke all on function private.touch_parent_project() from public, anon, authenticated;

create or replace function public.start_member_project(p_idea_id text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  member_id uuid := private.require_active_member();
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
      select 1 from private.workspace_stage_definitions
      where idea_id = p_idea_id and plan_version = selected_version
    )
    or exists (
      select 1
      from private.workspace_stage_definitions as stage
      where stage.idea_id = p_idea_id
        and stage.plan_version = selected_version
        and not exists (
          select 1 from private.workspace_task_definitions as task
          where task.idea_id = stage.idea_id
            and task.plan_version = stage.plan_version
            and task.stage_id = stage.stage_id
            and task.required
        )
    ) then
    raise exception 'Project definition unavailable' using errcode = '22023';
  end if;

  insert into public.projects (user_id, idea_id, plan_version)
  values (member_id, p_idea_id, selected_version)
  on conflict (user_id, idea_id) do nothing
  returning id into selected_project_id;

  created_project := selected_project_id is not null;

  if not created_project then
    select id into selected_project_id
    from public.projects
    where user_id = member_id and idea_id = p_idea_id;
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
  member_id uuid := private.require_active_member();
  current_paused_at timestamptz;
begin
  select paused_at into current_paused_at
  from public.projects
  where id = p_project_id and user_id = member_id
  for update;

  if not found then
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
  member_id uuid := private.require_active_member();
  project_paused_at timestamptz;
  result_completed_at timestamptz;
begin
  select paused_at into project_paused_at
  from public.projects
  where id = p_project_id and user_id = member_id
  for update;

  if not found then
    raise exception 'Project unavailable' using errcode = 'P0002';
  end if;
  if project_paused_at is not null then
    raise exception 'Resume the project before editing progress' using errcode = '55000';
  end if;

  update public.project_tasks
  set completed_at = case
    when p_completed then coalesce(completed_at, now())
    else null
  end
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
  member_id uuid := private.require_active_member();
  project_paused_at timestamptz;
begin
  if p_content is null or char_length(p_content) > 4000 or p_expected_revision < 0 then
    raise exception 'Invalid note' using errcode = '22023';
  end if;

  select paused_at into project_paused_at
  from public.projects
  where id = p_project_id and user_id = member_id
  for update;

  if not found then
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
