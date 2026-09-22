import "server-only";

import { clinicProspectDatasetSchema } from "./clinic-prospects";
import { readVerifiedPrivateResource } from "./private-resources.server";

export async function getClinicProspectDataset() {
  const raw = await readVerifiedPrivateResource("clinic-prospects");
  return clinicProspectDatasetSchema.parse(JSON.parse(raw.toString("utf8")));
}

export async function getClinicProspects() {
  return (await getClinicProspectDataset()).records;
}
