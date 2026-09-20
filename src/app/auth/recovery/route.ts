import { timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { RECOVERY_STATE_COOKIE, RECOVERY_VERIFIED_COOKIE } from "@/lib/auth-cookies";
import { getTrustedAppOrigin } from "@/lib/safe-redirect";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

function matches(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

export async function GET(request: Request) {
  const origin = getTrustedAppOrigin();
  if (!origin || !isSupabaseConfigured()) {
    return NextResponse.json({ error: "Authentication is not configured." }, { status: 503 });
  }

  const url = new URL(request.url);
  const state = url.searchParams.get("state");
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type");
  const cookieStore = await cookies();
  const storedState = cookieStore.get(RECOVERY_STATE_COOKIE)?.value;

  if (!state || !storedState || !matches(state, storedState) || !tokenHash || type !== "recovery") {
    return NextResponse.redirect(new URL("/forgot-password?state=invalid", origin));
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({ type: "recovery", token_hash: tokenHash });
  if (error) return NextResponse.redirect(new URL("/forgot-password?state=invalid", origin));

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) return NextResponse.redirect(new URL("/forgot-password?state=invalid", origin));

  const response = NextResponse.redirect(new URL("/reset-password", origin));
  response.cookies.set(RECOVERY_STATE_COOKIE, "", { path: "/auth/recovery", maxAge: 0 });
  response.cookies.set(RECOVERY_VERIFIED_COOKIE, userData.user.id, {
    httpOnly: true,
    sameSite: "lax",
    secure: origin.startsWith("https://"),
    maxAge: 10 * 60,
    path: "/",
  });
  return response;
}
