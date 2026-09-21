import { CLINIC_IDEA_ID } from "@/content/clinic-kit-readiness";
import { createClinicProspectCsv } from "@/lib/clinic-prospects";
import { getClinicProspects } from "@/lib/clinic-prospects.server";
import { getIdeaAccessDecision, requireVerifiedAccount } from "@/lib/membership.server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const destination = "/app/resources/clinic-uae-potential-customers";
const downloadName = "clinic-uae-potential-customers.csv";

export async function GET() {
  const context = await requireVerifiedAccount(destination);
  const decision = getIdeaAccessDecision(context, CLINIC_IDEA_ID);

  if (decision.status !== "active" || decision.source !== "full-membership") {
    return new Response("This resource requires active full membership.", {
      status: decision.status === "unavailable" ? 503 : 403,
      headers: { "Cache-Control": "private, no-store" },
    });
  }

  try {
    const csv = createClinicProspectCsv(await getClinicProspects());
    const body = new TextEncoder().encode(csv);
    return new Response(body, {
      headers: {
        "Cache-Control": "private, no-store",
        "Content-Disposition": `attachment; filename="${downloadName}"`,
        "Content-Length": String(body.byteLength),
        "Content-Type": "text/csv; charset=utf-8",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new Response("The clinic research export is temporarily unavailable.", {
      status: 503,
      headers: { "Cache-Control": "private, no-store" },
    });
  }
}
