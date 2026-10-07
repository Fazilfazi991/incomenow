import { createHash, randomUUID } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import {
  ACQUISITION_COOKIE_MAX_AGE,
  ACQUISITION_SESSION_COOKIE,
  ACQUISITION_SESSION_MAX_AGE,
  ACQUISITION_VISITOR_COOKIE,
  isTrackableAcquisitionRequest,
  normalizeSourceKey,
  sanitizeLandingPath,
  sanitizeReferrer,
} from "@/lib/acquisition";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  if (process.env.NEXT_PUBLIC_ACQUISITION_TRACKING_ENABLED !== "true" || !isSupabaseConfigured()) {
    return NextResponse.json({ tracked: false }, { status: 202 });
  }

  const userAgent = request.headers.get("user-agent") ?? "";
  const body = await request.json().catch(() => ({})) as Record<string, unknown>;
  const landingPath = sanitizeLandingPath(body.landingPath);
  if (!isTrackableAcquisitionRequest(new URL(landingPath, request.url).pathname, userAgent)) {
    return NextResponse.json({ tracked: false }, { status: 202 });
  }

  const existingVisitorId = request.cookies.get(ACQUISITION_VISITOR_COOKIE)?.value;
  const existingSessionId = request.cookies.get(ACQUISITION_SESSION_COOKIE)?.value;
  const visitorId = existingVisitorId ?? randomUUID();
  const sessionId = existingSessionId ?? randomUUID();
  const hostname = (request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? "").split(",")[0].trim();
  const userAgentHash = createHash("sha256").update(userAgent).digest("hex");
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("capture_acquisition_visit", {
    p_visitor_id: visitorId,
    p_session_id: sessionId,
    p_source_key: normalizeSourceKey(body.sourceKey),
    p_hostname: hostname,
    p_landing_path: landingPath,
    p_referrer: sanitizeReferrer(body.referrer),
    p_user_agent_hash: userAgentHash,
  });

  if (error) {
    console.warn("[acquisition] visit capture failed", { code: error.code });
    return NextResponse.json({ tracked: false }, { status: 202 });
  }

  const capture = data as { source_attributed?: boolean } | null;
  const response = NextResponse.json({ tracked: true, sourceAttributed: Boolean(capture?.source_attributed) });
  const secure = request.nextUrl.protocol === "https:";
  response.cookies.set(ACQUISITION_VISITOR_COOKIE, visitorId, {
    httpOnly: true, sameSite: "lax", secure, path: "/", maxAge: ACQUISITION_COOKIE_MAX_AGE, priority: "medium",
  });
  response.cookies.set(ACQUISITION_SESSION_COOKIE, sessionId, {
    httpOnly: true, sameSite: "lax", secure, path: "/", maxAge: ACQUISITION_SESSION_MAX_AGE, priority: "medium",
  });
  response.headers.set("cache-control", "no-store");
  return response;
}
