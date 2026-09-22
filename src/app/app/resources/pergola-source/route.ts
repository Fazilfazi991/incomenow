import { STARTER_IDEA_ID } from "@/content/membership-offer";
import { getIdeaAccessDecision, requireVerifiedAccount } from "@/lib/membership.server";
import { readVerifiedPrivateResource } from "@/lib/private-resources.server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const downloadName = "universalpergola-main.zip";

export async function GET() {
  const destination = "/app/resources/pergola-source";
  const context = await requireVerifiedAccount(destination);
  const decision = getIdeaAccessDecision(context, STARTER_IDEA_ID);

  if (decision.status !== "active") {
    return new Response("This resource is not included in your current access.", {
      status: decision.status === "unavailable" ? 503 : 403,
      headers: { "Cache-Control": "private, no-store" },
    });
  }

  try {
    const archive = await readVerifiedPrivateResource("pergola-source");
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
    return new Response("The source archive is temporarily unavailable.", {
      status: 503,
      headers: { "Cache-Control": "private, no-store" },
    });
  }
}
