import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { clinicDistributionDownloadEnabled, clinicDistributionState } from "@/content/clinic-distribution";
import { CLINIC_IDEA_ID } from "@/content/clinic-kit-readiness";
import { getIdeaAccessDecision, requireVerifiedAccount } from "@/lib/membership.server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const destination = "/app/resources/clinic-source";
const downloadName = "clinic-operations-crm-distribution.zip";

export async function GET() {
  const context = await requireVerifiedAccount(destination);
  const decision = getIdeaAccessDecision(context, CLINIC_IDEA_ID);

  if (decision.status !== "active" || decision.source !== "full-membership") {
    return new Response("This resource is not included in your current access.", {
      status: decision.status === "unavailable" ? 503 : 403,
      headers: { "Cache-Control": "private, no-store" },
    });
  }

  if (!clinicDistributionState.technicalPackageReady) {
    return new Response("The source package is not technically ready.", {
      status: 503,
      headers: { "Cache-Control": "private, no-store" },
    });
  }

  if (!clinicDistributionDownloadEnabled()) {
    return new Response("Source package release is not approved.", {
      status: 423,
      headers: { "Cache-Control": "private, no-store" },
    });
  }

  try {
    const archive = await readFile(path.join(process.cwd(), "private-resources", "clinic", downloadName));
    const archiveSha256 = createHash("sha256").update(archive).digest("hex").toUpperCase();
    if (archive.byteLength !== clinicDistributionState.approvedPackageSizeBytes || archiveSha256 !== clinicDistributionState.approvedPackageSha256) {
      return new Response("The approved source package is temporarily unavailable.", {
        status: 503,
        headers: { "Cache-Control": "private, no-store" },
      });
    }
    return new Response(new Uint8Array(archive), {
      headers: {
        "Cache-Control": "private, no-store",
        "Content-Disposition": `attachment; filename="${downloadName}"`,
        "Content-Length": String(archive.byteLength),
        "Content-Type": "application/zip",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new Response("The source package is temporarily unavailable.", {
      status: 503,
      headers: { "Cache-Control": "private, no-store" },
    });
  }
}
