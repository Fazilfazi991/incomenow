import { NextResponse } from "next/server";
import { getAccountAccessContext } from "@/lib/membership.server";

export const dynamic = "force-dynamic";

export async function GET() {
  const context = await getAccountAccessContext();
  const headers = { "Cache-Control": "private, no-store, max-age=0" };
  if (context.configuration === "missing" || context.authentication === "unavailable" || context.access === "unavailable") {
    return NextResponse.json({ access: "unavailable" }, { status: 503, headers });
  }
  if (context.authentication === "signed-out") return NextResponse.json({ access: "unauthenticated" }, { status: 401, headers });
  if (context.access !== "active") return NextResponse.json({ access: "inactive" }, { status: 403, headers });
  return NextResponse.json({ access: "active" }, { status: 200, headers });
}
