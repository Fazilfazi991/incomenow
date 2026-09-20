import { NextResponse } from "next/server";
import { getTrustedAppOrigin, safeInternalDestination } from "@/lib/safe-redirect";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const origin = getTrustedAppOrigin();
  if (!origin || !isSupabaseConfigured()) {
    return NextResponse.json({ error: "Authentication is not configured." }, { status: 503 });
  }

  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const destination = safeInternalDestination(url.searchParams.get("next"));
  if (!code || url.searchParams.has("error")) {
    return NextResponse.redirect(new URL("/login?error=oauth", origin));
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) return NextResponse.redirect(new URL("/login?error=oauth", origin));
  return NextResponse.redirect(new URL(destination, origin));
}
