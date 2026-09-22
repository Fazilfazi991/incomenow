import "server-only";

import manifest from "./private-resource-manifest.json";

export type PrivateResourceId = keyof typeof manifest;

export type PrivateResourceManifestEntry = {
  ideaId: string;
  filename: string;
  relativePath: string[];
  objectKey: string;
  sha256: string;
  sizeBytes: number;
  contentType: string;
  approvalState: "owner-approved" | "member-delivery-approved";
};

export const privateResourceManifest = manifest as Record<PrivateResourceId, PrivateResourceManifestEntry>;
