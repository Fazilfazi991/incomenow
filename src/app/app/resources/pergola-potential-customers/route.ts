import { STARTER_IDEA_ID } from "@/content/membership-offer";
import { createPergolaProspectCsv } from "@/lib/pergola-prospects";
import { getPergolaProspects } from "@/lib/pergola-prospects.server";
import { getIdeaAccessDecision, requireVerifiedAccount } from "@/lib/membership.server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const destination = "/app/resources/pergola-potential-customers";
const downloadName = "pergola-potential-customers.csv";

export async function GET() {
  const context = await requireVerifiedAccount(destination);
  const decision = getIdeaAccessDecision(context, STARTER_IDEA_ID);

  if (decision.status !== "active") {
    return new Response("This resource is not included in your current access.", {
      status: decision.status === "unavailable" ? 503 : 403,
      headers: { "Cache-Control": "private, no-store" },
    });
  }

  try {
    const csv = createPergolaProspectCsv(await getPergolaProspects());
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
    return new Response("The potential-customer export is temporarily unavailable.", {
      status: 503,
      headers: { "Cache-Control": "private, no-store" },
    });
  }
}
