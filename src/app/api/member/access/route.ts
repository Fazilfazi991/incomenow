import { NextResponse } from "next/server";
import { STARTER_IDEA_ID } from "@/content/membership-offer";
import { getAccountAccessContext, getIdeaAccessDecision } from "@/lib/membership.server";

export const dynamic = "force-dynamic";

export async function GET() {
  const context = await getAccountAccessContext();
  const headers = { "Cache-Control": "private, no-store, max-age=0" };
  if (context.configuration === "missing" || context.authentication === "unavailable") {
    return NextResponse.json({ authentication: "unavailable", browseCatalogue: false }, { status: 503, headers });
  }
  if (context.authentication === "signed-out") return NextResponse.json({ authentication: "unauthenticated", browseCatalogue: false }, { status: 401, headers });

  const starter = getIdeaAccessDecision(context, STARTER_IDEA_ID);
  const tier = context.fullMembership === "active"
    ? "full"
    : starter.status === "active" && starter.source === "starter"
      ? "starter"
      : context.fullMembership === "unavailable" || context.ideaGrantLookup === "unavailable"
        ? "unavailable"
        : "registered";

  return NextResponse.json({
    authentication: "verified",
    browseCatalogue: true,
    tier,
    fullMembership: context.fullMembership,
    starterIdea: starter.status,
  }, { status: 200, headers });
}
