update private.workspace_idea_definitions
set published = true
where idea_id = 'idea-005';

insert into private.workspace_plan_versions (idea_id, version, is_current)
values ('idea-005', '1', true);

insert into private.workspace_stage_definitions (idea_id, plan_version, stage_id, position)
values
  ('idea-005', '1', 'resumi-understand', 1),
  ('idea-005', '1', 'resumi-explore', 2),
  ('idea-005', '1', 'resumi-audience', 3),
  ('idea-005', '1', 'resumi-model', 4),
  ('idea-005', '1', 'resumi-rebrand-plan', 5),
  ('idea-005', '1', 'resumi-template-plan', 6),
  ('idea-005', '1', 'resumi-backend', 7),
  ('idea-005', '1', 'resumi-career-tools', 8),
  ('idea-005', '1', 'resumi-premium-boundary', 9),
  ('idea-005', '1', 'resumi-content', 10),
  ('idea-005', '1', 'resumi-production-test', 11),
  ('idea-005', '1', 'resumi-launch-plan', 12),
  ('idea-005', '1', 'resumi-acquire', 13),
  ('idea-005', '1', 'resumi-improve-plan', 14);

insert into private.workspace_task_definitions (idea_id, plan_version, stage_id, task_id, position, required)
values
  ('idea-005', '1', 'resumi-understand', 'resumi-need', 1, true),
  ('idea-005', '1', 'resumi-understand', 'resumi-claims', 2, true),
  ('idea-005', '1', 'resumi-explore', 'resumi-live-walkthrough', 1, true),
  ('idea-005', '1', 'resumi-explore', 'resumi-evidence-notes', 2, true),
  ('idea-005', '1', 'resumi-audience', 'resumi-audience-segment', 1, true),
  ('idea-005', '1', 'resumi-audience', 'resumi-audience-task', 2, true),
  ('idea-005', '1', 'resumi-model', 'resumi-model-choice', 1, true),
  ('idea-005', '1', 'resumi-model', 'resumi-model-costs', 2, true),
  ('idea-005', '1', 'resumi-rebrand-plan', 'resumi-brand-map', 1, true),
  ('idea-005', '1', 'resumi-rebrand-plan', 'resumi-brand-accept', 2, true),
  ('idea-005', '1', 'resumi-template-plan', 'resumi-template-scope', 1, true),
  ('idea-005', '1', 'resumi-template-plan', 'resumi-template-test', 2, true),
  ('idea-005', '1', 'resumi-backend', 'resumi-backend-access', 1, true),
  ('idea-005', '1', 'resumi-backend', 'resumi-backend-lifecycle', 2, true),
  ('idea-005', '1', 'resumi-career-tools', 'resumi-career-scope', 1, true),
  ('idea-005', '1', 'resumi-career-tools', 'resumi-career-safeguards', 2, true),
  ('idea-005', '1', 'resumi-premium-boundary', 'resumi-premium-value', 1, true),
  ('idea-005', '1', 'resumi-premium-boundary', 'resumi-premium-readiness', 2, true),
  ('idea-005', '1', 'resumi-content', 'resumi-content-cluster', 1, true),
  ('idea-005', '1', 'resumi-content', 'resumi-content-quality', 2, true),
  ('idea-005', '1', 'resumi-production-test', 'resumi-production-user-flow', 1, true),
  ('idea-005', '1', 'resumi-production-test', 'resumi-production-ops', 2, true),
  ('idea-005', '1', 'resumi-launch-plan', 'resumi-launch-decision', 1, true),
  ('idea-005', '1', 'resumi-launch-plan', 'resumi-launch-monitor', 2, true),
  ('idea-005', '1', 'resumi-acquire', 'resumi-acquire-channel', 1, true),
  ('idea-005', '1', 'resumi-acquire', 'resumi-acquire-quality', 2, true),
  ('idea-005', '1', 'resumi-improve-plan', 'resumi-improve-funnel', 1, true),
  ('idea-005', '1', 'resumi-improve-plan', 'resumi-improve-next', 2, true);
