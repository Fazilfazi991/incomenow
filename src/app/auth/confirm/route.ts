import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { getAccountEntryDestination } from "@/lib/account.server";
import { lockCurrentUserAttribution } from "@/lib/acquisition.server";
import { getTrustedAppOrigin, safeInternalDestination } from "@/lib/safe-redirect";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

const confirmationTypes = new Set<EmailOtpType>(["email", "signup"]);

export async function GET(request: Request) {
  const origin = getTrustedAppOrigin();
  if (!origin || !isSupabaseConfigured()) {
    return NextResponse.json({ error: "Authentication is not configured." }, { status: 503 });
  }

  const url = new URL(request.url);
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type") as EmailOtpType | null;
  const destination = safeInternalDestination(url.searchParams.get("next"));

  if (!tokenHash || !type || !confirmationTypes.has(type)) {
    return NextResponse.redirect(new URL("/verify-email?state=invalid", origin));
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
  if (error) return NextResponse.redirect(new URL("/verify-email?state=invalid", origin));
  await lockCurrentUserAttribution(supabase);
  const confirmedDestination = new URL(await getAccountEntryDestination(destination, supabase), origin);
  confirmedDestination.searchParams.set("confirmed", "true");
  return NextResponse.redirect(confirmedDestination);
}
