import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";

const plans = JSON.parse(await readFile(new URL("../src/content/project-plan-data.json", import.meta.url), "utf8"));
const migrationDirectory = new URL("../supabase/migrations/", import.meta.url);
const migrationFiles = (await readdir(migrationDirectory)).filter((name) => name.endsWith(".sql")).sort();
const migrations = (await Promise.all(migrationFiles.map((name) => readFile(new URL(name, migrationDirectory), "utf8")))).join("\n");

const stageTuples = new Set(
  [...migrations.matchAll(/\('(?<idea>idea-\d{3})', '(?<version>[^']+)', '(?<stage>[a-z0-9-]+)', \d+\)/g)]
    .map(({ groups }) => `${groups.idea}|${groups.version}|${groups.stage}`),
);
const taskTuples = new Set(
  [...migrations.matchAll(/\('(?<idea>idea-\d{3})', '(?<version>[^']+)', '(?<stage>[a-z0-9-]+)', '(?<task>[a-z0-9-]+)', \d+, (?:true|false)\)/g)]
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
