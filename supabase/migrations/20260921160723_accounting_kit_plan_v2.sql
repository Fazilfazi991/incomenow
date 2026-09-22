update private.workspace_idea_definitions
set published = true
where idea_id = 'idea-003';

update private.workspace_plan_versions
set is_current = false
where idea_id = 'idea-003' and is_current;

insert into private.workspace_plan_versions (idea_id, version, is_current)
values ('idea-003', '2', true);

insert into private.workspace_stage_definitions (idea_id, plan_version, stage_id, position)
values
  ('idea-003', '2', 'accounting-opportunity', 1),
  ('idea-003', '2', 'accounting-demo', 2),
  ('idea-003', '2', 'accounting-software', 3),
  ('idea-003', '2', 'accounting-setup', 4),
  ('idea-003', '2', 'accounting-workflow', 5),
  ('idea-003', '2', 'accounting-ai', 6),
  ('idea-003', '2', 'accounting-prospects', 7),
  ('idea-003', '2', 'accounting-conversation', 8),
  ('idea-003', '2', 'accounting-pricing', 9),
  ('idea-003', '2', 'accounting-package', 10),
  ('idea-003', '2', 'accounting-delivery', 11),
  ('idea-003', '2', 'accounting-handover', 12);

insert into private.workspace_task_definitions (idea_id, plan_version, stage_id, task_id, position, required)
values
  ('idea-003', '2', 'accounting-opportunity', 'accounting-map-current-workflow', 1, true),
  ('idea-003', '2', 'accounting-opportunity', 'accounting-confirm-boundaries', 2, true),
  ('idea-003', '2', 'accounting-demo', 'accounting-demo-scope', 1, true),
  ('idea-003', '2', 'accounting-demo', 'accounting-demo-boundary', 2, true),
  ('idea-003', '2', 'accounting-software', 'accounting-select-modules', 1, true),
  ('idea-003', '2', 'accounting-software', 'accounting-record-unverified', 2, true),
  ('idea-003', '2', 'accounting-setup', 'accounting-private-source', 1, true),
  ('idea-003', '2', 'accounting-setup', 'accounting-isolated-environment', 2, true),
  ('idea-003', '2', 'accounting-workflow', 'accounting-roles-controls', 1, true),
  ('idea-003', '2', 'accounting-workflow', 'accounting-business-config', 2, true),
  ('idea-003', '2', 'accounting-ai', 'accounting-ai-decision', 1, true),
  ('idea-003', '2', 'accounting-ai', 'accounting-ai-controls', 2, true),
  ('idea-003', '2', 'accounting-prospects', 'accounting-research-list', 1, true),
  ('idea-003', '2', 'accounting-prospects', 'accounting-verify-relevance', 2, true),
  ('idea-003', '2', 'accounting-conversation', 'accounting-discovery-call', 1, true),
  ('idea-003', '2', 'accounting-conversation', 'accounting-confirm-notes', 2, true),
  ('idea-003', '2', 'accounting-pricing', 'accounting-cost-model', 1, true),
  ('idea-003', '2', 'accounting-pricing', 'accounting-review-margin', 2, true),
  ('idea-003', '2', 'accounting-package', 'accounting-package-scope', 1, true),
  ('idea-003', '2', 'accounting-package', 'accounting-acceptance', 2, true),
  ('idea-003', '2', 'accounting-delivery', 'accounting-configure-test', 1, true),
  ('idea-003', '2', 'accounting-delivery', 'accounting-migrate-reconcile', 2, true),
  ('idea-003', '2', 'accounting-handover', 'accounting-deploy-recover', 1, true),
  ('idea-003', '2', 'accounting-handover', 'accounting-train-handover', 2, true);
