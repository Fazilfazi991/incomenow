import { renderPergolaSetupGuideMarkdown } from "@/content/pergola-kit-readiness";
import { STARTER_IDEA_ID } from "@/content/membership-offer";
import { getIdeaAccessDecision, requireVerifiedAccount } from "@/lib/membership.server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const destination = "/app/resources/pergola-setup-guide";
const downloadName = "universal-pergola-local-setup-guide.md";

export async function GET() {
  const context = await requireVerifiedAccount(destination);
  const decision = getIdeaAccessDecision(context, STARTER_IDEA_ID);

  if (decision.status !== "active") {
    return new Response("This resource is not included in your current access.", {
      status: decision.status === "unavailable" ? 503 : 403,
      headers: { "Cache-Control": "private, no-store" },
    });
  }

  const guide = renderPergolaSetupGuideMarkdown();
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
