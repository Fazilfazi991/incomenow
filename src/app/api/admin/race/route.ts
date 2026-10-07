import { NextResponse, type NextRequest } from "next/server";
import { resolveRaceWindow, type RaceData, type RacePreset } from "@/lib/acquisition-race";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  if (!isSupabaseConfigured()) return NextResponse.json({ error: "Unavailable" }, { status: 503 });
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  const { data: isAdmin, error: adminError } = await supabase.rpc("is_acquisition_admin");
  if (adminError || !isAdmin) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const preset = (request.nextUrl.searchParams.get("range") ?? "today") as RacePreset;
  let window;
  try {
    window = resolveRaceWindow(preset, new Date(), request.nextUrl.searchParams.get("start") ?? undefined, request.nextUrl.searchParams.get("end") ?? undefined);
  } catch {
    return NextResponse.json({ error: "Invalid date range" }, { status: 400 });
  }
  const { data, error } = await supabase.rpc("get_acquisition_race", {
    p_start_at: window.startAt,
    p_end_at: window.endAt,
    p_bucket: window.bucket,
  });
  if (error) return NextResponse.json({ error: "Race data unavailable" }, { status: 503 });
  return NextResponse.json(data as RaceData, { headers: { "cache-control": "private, no-store" } });
}
