alter table private.workspace_idea_definitions
add column published boolean not null default false;

update private.workspace_idea_definitions
set published = idea_id in ('idea-001', 'idea-002');

comment on column private.workspace_idea_definitions.published is
  'Code-maintained live-catalogue gate. Historical plan definitions remain available for existing projects.';

insert into private.workspace_plan_versions (idea_id, version, is_current)
values ('idea-002', '1', true);

insert into private.workspace_stage_definitions (idea_id, plan_version, stage_id, position)
values
  ('idea-002', '1', 'clinic-opportunity', 1),
  ('idea-002', '1', 'clinic-explore', 2),
  ('idea-002', '1', 'clinic-segment', 3),
  ('idea-002', '1', 'clinic-research', 4),
  ('idea-002', '1', 'clinic-package', 5),
  ('idea-002', '1', 'clinic-prepare-demo', 6),
  ('idea-002', '1', 'clinic-conversations', 7),
  ('idea-002', '1', 'clinic-scope-project', 8),
  ('idea-002', '1', 'clinic-customise-test', 9),
  ('idea-002', '1', 'clinic-handover', 10);

insert into private.workspace_task_definitions (idea_id, plan_version, stage_id, task_id, position, required)
values
  ('idea-002', '1', 'clinic-opportunity', 'clinic-admin-workflow', 1, true),
  ('idea-002', '1', 'clinic-opportunity', 'clinic-claim-boundary', 2, true),
  ('idea-002', '1', 'clinic-explore', 'clinic-demo-status', 1, true),
  ('idea-002', '1', 'clinic-explore', 'clinic-demo-walkthrough', 2, true),
  ('idea-002', '1', 'clinic-segment', 'clinic-category', 1, true),
  ('idea-002', '1', 'clinic-segment', 'clinic-location', 2, true),
  ('idea-002', '1', 'clinic-research', 'clinic-research-list', 1, true),
  ('idea-002', '1', 'clinic-research', 'clinic-contact-check', 2, true),
  ('idea-002', '1', 'clinic-package', 'clinic-scope', 1, true),
  ('idea-002', '1', 'clinic-package', 'clinic-cost-model', 2, true),
  ('idea-002', '1', 'clinic-prepare-demo', 'clinic-fictional-data', 1, true),
  ('idea-002', '1', 'clinic-prepare-demo', 'clinic-demo-relevance', 2, true),
  ('idea-002', '1', 'clinic-conversations', 'clinic-discovery-conversations', 1, true),
  ('idea-002', '1', 'clinic-conversations', 'clinic-evidence-notes', 2, true),
  ('idea-002', '1', 'clinic-scope-project', 'clinic-data-responsibilities', 1, true),
  ('idea-002', '1', 'clinic-scope-project', 'clinic-acceptance', 2, true),
  ('idea-002', '1', 'clinic-customise-test', 'clinic-configure', 1, true),
  ('idea-002', '1', 'clinic-customise-test', 'clinic-test', 2, true),
  ('idea-002', '1', 'clinic-handover', 'clinic-deployment-ownership', 1, true),
  ('idea-002', '1', 'clinic-handover', 'clinic-staff-handover', 2, true);

create or replace function private.idea_is_published(p_idea_id text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from private.workspace_idea_definitions as idea
    where idea.idea_id = p_idea_id
      and idea.published
  );
$$;

revoke all on function private.idea_is_published(text) from public, anon, authenticated;
grant execute on function private.idea_is_published(text) to authenticated;

drop policy if exists "accounts save own bookmarks" on public.bookmarks;
create policy "accounts save published own bookmarks"
on public.bookmarks for insert to authenticated
with check (
  (select auth.uid()) = user_id
  and (select private.idea_is_published(idea_id))
);

create or replace function private.reject_unpublished_project_start()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not (select private.idea_is_published(new.idea_id)) then
    raise exception 'Project definition unavailable' using errcode = '22023';
  end if;
  return new;
end;
$$;

revoke all on function private.reject_unpublished_project_start() from public, anon, authenticated;

create trigger projects_require_published_idea
before insert on public.projects
for each row execute function private.reject_unpublished_project_start();
