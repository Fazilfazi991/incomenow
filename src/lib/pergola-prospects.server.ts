import "server-only";

import { readFile } from "node:fs/promises";
import path from "node:path";
import { pergolaProspectDatasetSchema } from "./pergola-prospects";

const datasetPath = path.join(process.cwd(), "private-resources", "pergola", "potential-customers.json");

export async function getPergolaProspectDataset() {
  const raw = await readFile(datasetPath, "utf8");
  return pergolaProspectDatasetSchema.parse(JSON.parse(raw));
}

export async function getPergolaProspects() {
  return (await getPergolaProspectDataset()).records;
}
