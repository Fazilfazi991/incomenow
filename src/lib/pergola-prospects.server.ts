import "server-only";

import { pergolaProspectDatasetSchema } from "./pergola-prospects";
import { readVerifiedPrivateResource } from "./private-resources.server";

export async function getPergolaProspectDataset() {
  const raw = await readVerifiedPrivateResource("pergola-prospects");
  return pergolaProspectDatasetSchema.parse(JSON.parse(raw.toString("utf8")));
}

export async function getPergolaProspects() {
  return (await getPergolaProspectDataset()).records;
}
