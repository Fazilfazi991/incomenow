import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import { getClinicProspectDataset } from "./clinic-prospects.server";
import { getPergolaProspectDataset } from "./pergola-prospects.server";
import { privateResourceManifest, type PrivateResourceId } from "./private-resource-manifest.server";
import {
  loadAccountingPrivateKitContent,
  loadClinicPrivateKitContent,
  loadPergolaPrivateKitContent,
  readVerifiedPrivateResource,
} from "./private-resources.server";

const runStorageIntegration = process.env.RUN_PRIVATE_STORAGE_INTEGRATION === "1";

describe.skipIf(!runStorageIntegration)("private Storage provider integration", () => {
  it("reads every fixed resource and verifies it against the metadata-only manifest", async () => {
    for (const resourceId of Object.keys(privateResourceManifest) as PrivateResourceId[]) {
      const bytes = await readVerifiedPrivateResource(resourceId);
      const expected = privateResourceManifest[resourceId];
      expect(bytes.byteLength, resourceId).toBe(expected.sizeBytes);
      expect(createHash("sha256").update(bytes).digest("hex").toUpperCase(), resourceId).toBe(expected.sha256);
    }
  });

  it("parses protected datasets and guides through the same server-only loaders", async () => {
    const [pergola, clinic, pergolaGuide, clinicGuide, accountingGuide] = await Promise.all([
      getPergolaProspectDataset(),
      getClinicProspectDataset(),
      loadPergolaPrivateKitContent(),
      loadClinicPrivateKitContent(),
      loadAccountingPrivateKitContent(),
    ]);

    expect(pergola.records).toHaveLength(77);
    expect(clinic.records).toHaveLength(100);
    expect(pergolaGuide).toBeTruthy();
    expect(clinicGuide).toBeTruthy();
    expect(accountingGuide).toBeTruthy();
  });
});
