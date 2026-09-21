import "server-only";

import { readFile } from "node:fs/promises";
import path from "node:path";
import { clinicProspectDatasetSchema } from "./clinic-prospects";

const datasetPath = path.join(process.cwd(), "private-resources", "clinic", "uae-clinic-prospects-v1.json");

export async function getClinicProspectDataset() {
  const raw = await readFile(datasetPath, "utf8");
  return clinicProspectDatasetSchema.parse(JSON.parse(raw));
}

export async function getClinicProspects() {
  return (await getClinicProspectDataset()).records;
}
