import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { resumiDistributionDownloadEnabled, resumiDistributionState } from "@/content/resumi-distribution";
import { RESUMI_IDEA_ID } from "@/content/resumi-kit-readiness";
import { getIdeaAccessDecision, requireVerifiedAccount } from "@/lib/membership.server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const destination = "/app/resources/resumi-source";

export async function GET() {
  const context = await requireVerifiedAccount(destination);
  const decision = getIdeaAccessDecision(context, RESUMI_IDEA_ID);

  if (decision.status !== "active" || decision.source !== "full-membership") {
    return new Response("This resource is not included in your current access.", {
      status: decision.status === "unavailable" ? 503 : 403,
      headers: { "Cache-Control": "private, no-store" },
    });
  }

  if (!resumiDistributionState.technicalPackageReady) {
    return new Response("The source package is not technically ready.", {
      status: 503,
      headers: { "Cache-Control": "private, no-store" },
    });
  }

  if (!resumiDistributionDownloadEnabled()) {
    return new Response("Source package release is not approved.", {
      status: 423,
      headers: { "Cache-Control": "private, no-store" },
    });
  }

  try {
    const archive = await readFile(path.join(process.cwd(), "private-resources", "resumi", resumiDistributionState.packageName));
    const sha256 = createHash("sha256").update(archive).digest("hex").toUpperCase();
    if (archive.byteLength !== resumiDistributionState.packageSizeBytes || sha256 !== resumiDistributionState.packageSha256) {
      return new Response("The approved source package is temporarily unavailable.", {
        status: 503,
        headers: { "Cache-Control": "private, no-store" },
      });
    }
    return new Response(new Uint8Array(archive), {
      headers: {
        "Cache-Control": "private, no-store",
        "Content-Disposition": `attachment; filename="${resumiDistributionState.packageName}"`,
        "Content-Length": String(archive.byteLength),
        "Content-Type": "application/zip",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new Response("The approved source package is temporarily unavailable.", {
      status: 503,
      headers: { "Cache-Control": "private, no-store" },
    });
  }
}
