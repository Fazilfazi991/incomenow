import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { privateResourceManifest } from "./private-resource-manifest.server";
import {
  createPrivateResourceStore,
  FilesystemPrivateResourceStore,
  SupabasePrivateResourceStore,
  type SupabaseStorageClient,
} from "./private-resource-store.server";

const temporaryDirectories: string[] = [];

afterEach(async () => {
  await Promise.all(temporaryDirectories.splice(0).map((directory) => rm(directory, { recursive: true, force: true })));
});

describe("private resource stores", () => {
  it("reads an exact logical resource from the local provider", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "incomenow-private-store-"));
    temporaryDirectories.push(root);
    const registry = structuredClone(privateResourceManifest);
    registry["pergola-source"].relativePath = ["fixtures", "source.zip"];
    registry["pergola-source"].contentType = "application/zip";
    await mkdir(path.join(root, "fixtures"), { recursive: true });
    await writeFile(path.join(root, "fixtures", "source.zip"), Buffer.from("fixture"));

    const store = new FilesystemPrivateResourceStore(root, registry);
    await expect(store.exists("pergola-source")).resolves.toBe(true);
    await expect(store.getMetadata("pergola-source")).resolves.toEqual({ sizeBytes: 7, contentType: "application/zip" });
    await expect(store.read("pergola-source")).resolves.toEqual(Buffer.from("fixture"));
    await expect(store.exists("clinic-source")).resolves.toBe(false);
  });

  it("uses fixed manifest keys for the private Supabase Storage provider", async () => {
    const list = vi.fn().mockResolvedValue({
      data: [{ name: "universalpergola-main.zip", metadata: { size: 754_291, mimetype: "application/zip" } }],
      error: null,
    });
    const download = vi.fn().mockResolvedValue({ data: new Blob(["fixture"]), error: null });
    const client = { storage: { from: vi.fn(() => ({ list, download })) } } as unknown as SupabaseStorageClient;
    const store = new SupabasePrivateResourceStore(client, "member-resources");

    await expect(store.getMetadata("pergola-source")).resolves.toEqual({ sizeBytes: 754_291, contentType: "application/zip" });
    await expect(store.read("pergola-source")).resolves.toEqual(new Uint8Array(Buffer.from("fixture")));
    expect(list).toHaveBeenCalledWith("idea-001/pergola-source", { limit: 100, search: "universalpergola-main.zip" });
    expect(download).toHaveBeenCalledWith("idea-001/pergola-source/universalpergola-main.zip");
  });

  it("defaults production to private Storage and refuses missing server credentials", () => {
    expect(() => createPrivateResourceStore({ NODE_ENV: "production" })).toThrow("Private Supabase Storage is not configured");
    expect(() => createPrivateResourceStore({ PRIVATE_RESOURCE_PROVIDER: "unknown" })).toThrow("Unsupported private resource provider");
  });
});
