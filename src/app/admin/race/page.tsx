import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { RaceDashboard } from "@/components/race-dashboard";
import { resolveRaceWindow, type RaceData } from "@/lib/acquisition-race";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Team Race" };

export default async function RacePage() {
  if (!isSupabaseConfigured()) redirect("/account/access");
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) redirect("/login?next=/admin/race");
  const { data: isAdmin, error: adminError } = await supabase.rpc("is_acquisition_admin");
  if (adminError || !isAdmin) notFound();
  const window = resolveRaceWindow("today");
  const { data, error } = await supabase.rpc("get_acquisition_race", {
    p_start_at: window.startAt,
    p_end_at: window.endAt,
    p_bucket: window.bucket,
  });
  if (error || !data) throw new Error("The team race data is temporarily unavailable.");
  return <RaceDashboard initialData={data as RaceData} />;
}
