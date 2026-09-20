import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const plans = JSON.parse(await readFile(new URL("../src/content/project-plan-data.json", import.meta.url), "utf8"));
const migration = await readFile(new URL("../supabase/migrations/20260920134950_phase_2b_workspace.sql", import.meta.url), "utf8");

const stageTuples = new Set(
  [...migration.matchAll(/\('(?<idea>idea-\d{3})', '(?<version>[^']+)', '(?<stage>[a-z0-9-]+)', \d+\)/g)]
    .map(({ groups }) => `${groups.idea}|${groups.version}|${groups.stage}`),
);
const taskTuples = new Set(
  [...migration.matchAll(/\('(?<idea>idea-\d{3})', '(?<version>[^']+)', '(?<stage>[a-z0-9-]+)', '(?<task>[a-z0-9-]+)', \d+, (?:true|false)\)/g)]
    .map(({ groups }) => `${groups.idea}|${groups.version}|${groups.stage}|${groups.task}`),
);

for (const [ideaId, entry] of Object.entries(plans)) {
  for (const [version, plan] of Object.entries(entry.versions)) {
    for (const stage of plan.stages) {
      assert(stageTuples.has(`${ideaId}|${version}|${stage.id}`), `Missing DB stage definition: ${ideaId}/${version}/${stage.id}`);
      for (const task of stage.tasks) {
        assert(taskTuples.has(`${ideaId}|${version}|${stage.id}|${task.id}`), `Missing DB task definition: ${ideaId}/${version}/${stage.id}/${task.id}`);
      }
    }
  }
}

console.log(`Plan sync verified: ${stageTuples.size} stages and ${taskTuples.size} tasks.`);
