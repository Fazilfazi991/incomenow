import "server-only";

import { createHash } from "node:crypto";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import type { ZodType } from "zod";
import type { Idea } from "@/content/idea-schema";
import {
  accountingPrivateKitContentSchema,
  clinicPrivateKitContentSchema,
  pergolaPrivateKitContentSchema,
  type AccountingPrivateKitContent,
  type ClinicPrivateKitContent,
  type PergolaPrivateKitContent,
  type PrivateKitContent,
} from "@/content/private-kit-content";
import { privateResourceManifest, type PrivateResourceId } from "./private-resource-manifest.server";

const resourceByIdeaAndKind = {
  "idea-001": { source: "pergola-source", prospects: "pergola-prospects", guide: "pergola-setup-guide" },
  "idea-002": { source: "clinic-source", prospects: "clinic-prospects", guide: "clinic-setup-guide" },
  "idea-003": { guide: "accounting-setup-guide" },
} as const;

const manifestIdByIdeaResourceId: Partial<Record<string, PrivateResourceId>> = {
  "crm-source": "pergola-source",
  "crm-discovery": "pergola-prospects",
  "crm-guide": "pergola-setup-guide",
  "clinic-source": "clinic-source",
  "clinic-prospects": "clinic-prospects",
  "clinic-setup-guide": "clinic-setup-guide",
  "accounting-setup-guide": "accounting-setup-guide",
};

function resourcePath(resourceId: PrivateResourceId) {
  return path.join(/* turbopackIgnore: true */ process.cwd(), ...privateResourceManifest[resourceId].relativePath);
}

export async function isPrivateResourceProvisioned(resourceId: PrivateResourceId) {
  const expected = privateResourceManifest[resourceId];
  try {
    const file = await stat(resourcePath(resourceId));
    return file.isFile() && file.size === expected.sizeBytes;
  } catch {
    return false;
  }
}

export async function readVerifiedPrivateResource(resourceId: PrivateResourceId) {
  const expected = privateResourceManifest[resourceId];
  const bytes = await readFile(resourcePath(resourceId));
  const sha256 = createHash("sha256").update(bytes).digest("hex").toUpperCase();
  if (bytes.byteLength !== expected.sizeBytes || sha256 !== expected.sha256) {
    throw new Error(`Private resource verification failed: ${resourceId}`);
  }
  return bytes;
}

async function readPrivateJson<T>(resourceId: PrivateResourceId, schema: ZodType<T>): Promise<T> {
  const bytes = await readVerifiedPrivateResource(resourceId);
  return schema.parse(JSON.parse(bytes.toString("utf8")));
}

export async function loadPergolaPrivateKitContent(): Promise<PergolaPrivateKitContent> {
  return readPrivateJson("pergola-setup-guide", pergolaPrivateKitContentSchema);
}

export async function loadClinicPrivateKitContent(): Promise<ClinicPrivateKitContent> {
  return readPrivateJson("clinic-setup-guide", clinicPrivateKitContentSchema);
}

export async function loadAccountingPrivateKitContent(): Promise<AccountingPrivateKitContent> {
  return readPrivateJson("accounting-setup-guide", accountingPrivateKitContentSchema);
}

export async function loadPrivateKitContent(ideaId: string): Promise<PrivateKitContent | null> {
  try {
    if (ideaId === "idea-001") return await loadPergolaPrivateKitContent();
    if (ideaId === "idea-002") return await loadClinicPrivateKitContent();
    if (ideaId === "idea-003") return await loadAccountingPrivateKitContent();
    return null;
  } catch {
    return null;
  }
}

export async function withPrivateResourceAvailability(idea: Idea): Promise<Idea> {
  let missing = false;
  const resources = await Promise.all(idea.resources.map(async (resource) => {
    const manifestId = manifestIdByIdeaResourceId[resource.id];
    if (!manifestId || await isPrivateResourceProvisioned(manifestId)) return resource;
    missing = true;
    const { downloadPath: _downloadPath, actionLabel: _actionLabel, ...safeResource } = resource;
    void _downloadPath;
    void _actionLabel;
    return {
      ...safeResource,
      availability: "not-connected" as const,
      description: `${resource.label} temporarily unavailable in this environment.`,
      notice: "Private provisioning is required before this resource can be delivered.",
    };
  }));
  return {
    ...idea,
    resources,
    cardNote: missing ? "Some private resources are temporarily unavailable in this environment" : idea.cardNote,
  };
}

export function getPrivateResourceId(ideaId: string, kind: "source" | "prospects" | "guide") {
  const resources = resourceByIdeaAndKind[ideaId as keyof typeof resourceByIdeaAndKind];
  return resources && kind in resources ? resources[kind as keyof typeof resources] as PrivateResourceId : null;
}
