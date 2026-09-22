import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const manifestPath = path.join(projectRoot, "src", "lib", "private-resource-manifest.json");
const manifest = JSON.parse(await readFile(manifestPath, "utf8"));

function usage() {
  console.log(`Usage: pnpm run resources:provision -- [--dry-run | --apply] [--resource <id>] [--root <path>]

Dry-run is the default. --apply requires an existing private bucket plus
NEXT_PUBLIC_SUPABASE_URL and a server-only SUPABASE_SECRET_KEY.`);
}

function parseArguments(argv) {
  const options = { apply: false, resourceIds: [], root: process.env.PRIVATE_RESOURCE_LOCAL_ROOT || projectRoot };
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "--") continue;
    if (argument === "--apply") options.apply = true;
    else if (argument === "--dry-run") options.apply = false;
    else if (argument === "--resource") options.resourceIds.push(argv[++index]);
    else if (argument === "--root") options.root = path.resolve(argv[++index]);
    else if (argument === "--help" || argument === "-h") options.help = true;
    else throw new Error(`Unknown argument: ${argument}`);
  }
  if (options.resourceIds.some((resourceId) => !resourceId || !(resourceId in manifest))) {
    throw new Error("Every --resource value must be a logical ID from the private resource manifest.");
  }
  return options;
}

function sha256(bytes) {
  return createHash("sha256").update(bytes).digest("hex").toUpperCase();
}

async function readAndVerifyLocalResource(root, resourceId) {
  const expected = manifest[resourceId];
  const localPath = path.join(root, ...expected.relativePath);
  const bytes = await readFile(localPath);
  const actualHash = sha256(bytes);
  if (bytes.byteLength !== expected.sizeBytes || actualHash !== expected.sha256) {
    throw new Error(`Local verification failed for ${resourceId}; refusing to continue.`);
  }
  return { bytes, expected };
}

function objectParts(objectKey) {
  const normalized = objectKey.replaceAll("\\", "/");
  const splitAt = normalized.lastIndexOf("/");
  return {
    directory: splitAt === -1 ? "" : normalized.slice(0, splitAt),
    filename: splitAt === -1 ? normalized : normalized.slice(splitAt + 1),
  };
}

async function findObject(bucket, objectKey) {
  const { directory, filename } = objectParts(objectKey);
  const { data, error } = await bucket.list(directory, { limit: 100, search: filename });
  if (error) throw new Error(`Storage lookup failed for ${objectKey}: ${error.message}`);
  return data?.find((candidate) => candidate.name === filename) ?? null;
}

async function downloadAndVerify(bucket, resourceId, expected) {
  const { data, error } = await bucket.download(expected.objectKey);
  if (error || !data) throw new Error(`Storage verification download failed for ${resourceId}: ${error?.message ?? "missing response"}`);
  const bytes = Buffer.from(await data.arrayBuffer());
  if (bytes.byteLength !== expected.sizeBytes || sha256(bytes) !== expected.sha256) {
    throw new Error(`Uploaded object verification failed for ${resourceId}.`);
  }
}

const options = parseArguments(process.argv.slice(2));
if (options.help) {
  usage();
  process.exit(0);
}

const selectedIds = options.resourceIds.length ? [...new Set(options.resourceIds)] : Object.keys(manifest);
const verified = [];
for (const resourceId of selectedIds) {
  verified.push({ resourceId, ...await readAndVerifyLocalResource(options.root, resourceId) });
}

if (!options.apply) {
  for (const { resourceId, expected } of verified) {
    console.log(`[dry-run] verified ${resourceId}: ${expected.sizeBytes} bytes -> ${expected.objectKey}`);
  }
  console.log(`[dry-run] ${verified.length} resource(s) verified; no network request or upload was made.`);
  process.exit(0);
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const secretKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
const bucketName = process.env.PRIVATE_RESOURCE_BUCKET || "member-resources";
if (!supabaseUrl || !secretKey) {
  throw new Error("--apply requires NEXT_PUBLIC_SUPABASE_URL and a server-only SUPABASE_SECRET_KEY.");
}

const supabase = createClient(supabaseUrl, secretKey, {
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
});
const { data: bucketInfo, error: bucketError } = await supabase.storage.getBucket(bucketName);
if (bucketError || !bucketInfo) throw new Error(`Private bucket ${bucketName} is unavailable; create it deliberately before applying.`);
if (bucketInfo.public) throw new Error(`Bucket ${bucketName} is public; refusing to upload protected resources.`);

const bucket = supabase.storage.from(bucketName);
for (const { resourceId, bytes, expected } of verified) {
  const existing = await findObject(bucket, expected.objectKey);
  if (existing) {
    await downloadAndVerify(bucket, resourceId, expected);
    console.log(`[unchanged] ${resourceId}: existing object already matches the manifest.`);
    continue;
  }

  const { error } = await bucket.upload(expected.objectKey, bytes, {
    upsert: false,
    contentType: expected.contentType,
    cacheControl: "0",
  });
  if (error) throw new Error(`Upload failed for ${resourceId}: ${error.message}`);
  await downloadAndVerify(bucket, resourceId, expected);
  console.log(`[uploaded] ${resourceId}: verified ${expected.sizeBytes} bytes at the fixed manifest key.`);
}
