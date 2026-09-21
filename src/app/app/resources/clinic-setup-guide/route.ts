import { CLINIC_IDEA_ID, renderClinicSetupGuideMarkdown } from "@/content/clinic-kit-readiness";
import { getIdeaAccessDecision, requireVerifiedAccount } from "@/lib/membership.server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const destination = "/app/resources/clinic-setup-guide";
const downloadName = "bsmile-clinic-crm-setup-guide.md";

export async function GET() {
  const context = await requireVerifiedAccount(destination);
  const decision = getIdeaAccessDecision(context, CLINIC_IDEA_ID);

  if (decision.status !== "active") {
    return new Response("This resource is not included in your current access.", {
      status: decision.status === "unavailable" ? 503 : 403,
      headers: { "Cache-Control": "private, no-store" },
    });
  }

  const guide = renderClinicSetupGuideMarkdown();
  const body = new TextEncoder().encode(guide);
  return new Response(body, {
    headers: {
      "Cache-Control": "private, no-store",
      "Content-Disposition": `attachment; filename="${downloadName}"`,
      "Content-Length": String(body.byteLength),
      "Content-Type": "text/markdown; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
