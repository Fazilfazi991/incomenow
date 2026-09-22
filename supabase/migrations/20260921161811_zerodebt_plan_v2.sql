update private.workspace_idea_definitions
set published = true
where idea_id = 'idea-004';

update private.workspace_plan_versions
set is_current = false
where idea_id = 'idea-004'
  and is_current;

insert into private.workspace_plan_versions (idea_id, version, is_current)
values ('idea-004', '2', true);

insert into private.workspace_stage_definitions (idea_id, plan_version, stage_id, position)
values
  ('idea-004', '2', 'zerodebt-opportunity', 1),
  ('idea-004', '2', 'zerodebt-explore', 2),
  ('idea-004', '2', 'zerodebt-product', 3),
  ('idea-004', '2', 'zerodebt-source', 4),
  ('idea-004', '2', 'zerodebt-rebrand', 5),
  ('idea-004', '2', 'zerodebt-telegram', 6),
  ('idea-004', '2', 'zerodebt-ai', 7),
  ('idea-004', '2', 'zerodebt-business-model', 8),
  ('idea-004', '2', 'zerodebt-subscriptions', 9),
  ('idea-004', '2', 'zerodebt-advertising', 10),
  ('idea-004', '2', 'zerodebt-launch', 11),
  ('idea-004', '2', 'zerodebt-growth', 12),
  ('idea-004', '2', 'zerodebt-operate', 13);

insert into private.workspace_task_definitions (idea_id, plan_version, stage_id, task_id, position, required)
values
  ('idea-004', '2', 'zerodebt-opportunity', 'zerodebt-user-segment', 1, true),
  ('idea-004', '2', 'zerodebt-opportunity', 'zerodebt-safety-boundary', 2, true),
  ('idea-004', '2', 'zerodebt-explore', 'zerodebt-demo-walkthrough', 1, true),
  ('idea-004', '2', 'zerodebt-explore', 'zerodebt-demo-notes', 2, true),
  ('idea-004', '2', 'zerodebt-product', 'zerodebt-core-features', 1, true),
  ('idea-004', '2', 'zerodebt-product', 'zerodebt-data-rules', 2, true),
  ('idea-004', '2', 'zerodebt-source', 'zerodebt-source-review', 1, true),
  ('idea-004', '2', 'zerodebt-source', 'zerodebt-license-approval', 2, true),
  ('idea-004', '2', 'zerodebt-rebrand', 'zerodebt-brand-inventory', 1, true),
  ('idea-004', '2', 'zerodebt-rebrand', 'zerodebt-rebrand-acceptance', 2, true),
  ('idea-004', '2', 'zerodebt-telegram', 'zerodebt-telegram-architecture', 1, true),
  ('idea-004', '2', 'zerodebt-telegram', 'zerodebt-telegram-isolation', 2, true),
  ('idea-004', '2', 'zerodebt-ai', 'zerodebt-ai-data-review', 1, true),
  ('idea-004', '2', 'zerodebt-ai', 'zerodebt-ai-cost-cap', 2, true),
  ('idea-004', '2', 'zerodebt-business-model', 'zerodebt-model-choice', 1, true),
  ('idea-004', '2', 'zerodebt-business-model', 'zerodebt-scenario', 2, true),
  ('idea-004', '2', 'zerodebt-subscriptions', 'zerodebt-tier-design', 1, true),
  ('idea-004', '2', 'zerodebt-subscriptions', 'zerodebt-billing-architecture', 2, true),
  ('idea-004', '2', 'zerodebt-advertising', 'zerodebt-ad-policy', 1, true),
  ('idea-004', '2', 'zerodebt-advertising', 'zerodebt-ad-experiment', 2, true),
  ('idea-004', '2', 'zerodebt-launch', 'zerodebt-launch-evidence', 1, true),
  ('idea-004', '2', 'zerodebt-launch', 'zerodebt-launch-operations', 2, true),
  ('idea-004', '2', 'zerodebt-growth', 'zerodebt-growth-channel', 1, true),
  ('idea-004', '2', 'zerodebt-growth', 'zerodebt-growth-measure', 2, true),
  ('idea-004', '2', 'zerodebt-operate', 'zerodebt-operating-dashboard', 1, true),
  ('idea-004', '2', 'zerodebt-operate', 'zerodebt-review-rhythm', 2, true);
