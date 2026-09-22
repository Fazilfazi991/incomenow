import "server-only";

import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";
import {
  privateResourceManifest,
  type PrivateResourceId,
  type PrivateResourceManifestEntry,
} from "./private-resource-manifest.server";

export type StoredPrivateResourceMetadata = {
  sizeBytes: number;
  contentType: string | null;
};

export interface PrivateResourceStore {
  exists(resourceId: PrivateResourceId): Promise<boolean>;
  getMetadata(resourceId: PrivateResourceId): Promise<StoredPrivateResourceMetadata | null>;
  read(resourceId: PrivateResourceId): Promise<Uint8Array>;
}

type PrivateResourceRegistry = Record<PrivateResourceId, PrivateResourceManifestEntry>;

export class FilesystemPrivateResourceStore implements PrivateResourceStore {
  constructor(
    private readonly rootDirectory = process.env.PRIVATE_RESOURCE_LOCAL_ROOT || process.cwd(),
    private readonly registry: PrivateResourceRegistry = privateResourceManifest,
  ) {}

  private filePath(resourceId: PrivateResourceId) {
    return path.join(/* turbopackIgnore: true */ this.rootDirectory, ...this.registry[resourceId].relativePath);
  }

  async exists(resourceId: PrivateResourceId) {
    return (await this.getMetadata(resourceId)) !== null;
  }

  async getMetadata(resourceId: PrivateResourceId) {
    try {
      const file = await stat(this.filePath(resourceId));
      if (!file.isFile()) return null;
      return { sizeBytes: file.size, contentType: this.registry[resourceId].contentType };
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
      throw error;
    }
  }

  async read(resourceId: PrivateResourceId) {
    return readFile(this.filePath(resourceId));
  }
}

type SupabaseStorageFile = {
  name: string;
  metadata?: { size?: number; mimetype?: string } | null;
};

type SupabaseStorageBucket = {
  list(
    path: string,
    options: { limit: number; search: string },
  ): Promise<{ data: SupabaseStorageFile[] | null; error: { message: string } | null }>;
  download(path: string): Promise<{ data: Blob | null; error: { message: string } | null }>;
};

export type SupabaseStorageClient = {
  storage: { from(bucket: string): SupabaseStorageBucket };
};

export class SupabasePrivateResourceStore implements PrivateResourceStore {
  constructor(
    private readonly client: SupabaseStorageClient,
    private readonly bucket: string,
    private readonly registry: PrivateResourceRegistry = privateResourceManifest,
  ) {}

  private objectParts(resourceId: PrivateResourceId) {
    const objectKey = this.registry[resourceId].objectKey.replaceAll("\\", "/");
    const splitAt = objectKey.lastIndexOf("/");
    return {
      objectKey,
      directory: splitAt === -1 ? "" : objectKey.slice(0, splitAt),
      filename: splitAt === -1 ? objectKey : objectKey.slice(splitAt + 1),
    };
  }

  async exists(resourceId: PrivateResourceId) {
    return (await this.getMetadata(resourceId)) !== null;
  }

  async getMetadata(resourceId: PrivateResourceId) {
    const { directory, filename } = this.objectParts(resourceId);
    const { data, error } = await this.client.storage.from(this.bucket).list(directory, {
      limit: 100,
      search: filename,
    });
    if (error) throw new Error(`Private Storage metadata lookup failed: ${error.message}`);
    const object = data?.find((candidate) => candidate.name === filename);
    if (!object) return null;
    return {
      sizeBytes: Number(object.metadata?.size ?? -1),
      contentType: object.metadata?.mimetype ?? null,
    };
  }

  async read(resourceId: PrivateResourceId) {
    const { objectKey } = this.objectParts(resourceId);
    const { data, error } = await this.client.storage.from(this.bucket).download(objectKey);
    if (error || !data) throw new Error(`Private Storage read failed: ${error?.message ?? "object unavailable"}`);
    return new Uint8Array(await data.arrayBuffer());
  }
}

export function createPrivateResourceStore(
  environment: Readonly<Record<string, string | undefined>> = process.env,
  injectedStorageClient?: SupabaseStorageClient,
): PrivateResourceStore {
  const provider = environment.PRIVATE_RESOURCE_PROVIDER
    || (environment.NODE_ENV === "production" ? "supabase-storage" : "filesystem");

  if (provider === "filesystem") {
    return new FilesystemPrivateResourceStore(environment.PRIVATE_RESOURCE_LOCAL_ROOT || process.cwd());
  }
  if (provider !== "supabase-storage") {
    throw new Error(`Unsupported private resource provider: ${provider}`);
  }

  const url = environment.NEXT_PUBLIC_SUPABASE_URL;
  const secretKey = environment.SUPABASE_SECRET_KEY || environment.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !secretKey) throw new Error("Private Supabase Storage is not configured for this environment.");

  const client = injectedStorageClient ?? createClient(url, secretKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
  return new SupabasePrivateResourceStore(
    client as unknown as SupabaseStorageClient,
    environment.PRIVATE_RESOURCE_BUCKET || "member-resources",
  );
}
