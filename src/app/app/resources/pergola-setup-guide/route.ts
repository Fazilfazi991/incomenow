import { STARTER_IDEA_ID } from "@/content/membership-offer";
import { getIdeaAccessDecision, requireVerifiedAccount } from "@/lib/membership.server";
import { renderPrivateSetupGuideMarkdown } from "@/lib/private-guide-renderer";
import { loadPergolaPrivateKitContent } from "@/lib/private-resources.server";

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

  let guide: string;
  try {
    const content = await loadPergolaPrivateKitContent();
    guide = renderPrivateSetupGuideMarkdown({
      title: content.markdown.title,
      introduction: content.markdown.introduction,
      steps: content.setupGuide,
      promptHeading: content.markdown.promptHeading,
      prompts: content.codexPrompts,
      warning: content.markdown.warning,
    });
  } catch {
    return new Response("The setup guide is temporarily unavailable.", { status: 503, headers: { "Cache-Control": "private, no-store" } });
  }
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
