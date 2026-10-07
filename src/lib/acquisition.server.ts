import "server-only";

import { cookies } from "next/headers";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { ACQUISITION_VISITOR_COOKIE } from "./acquisition";
import { createClient } from "./supabase/server";

export async function lockCurrentUserAttribution(client?: SupabaseClient<Database>) {
  if (process.env.NEXT_PUBLIC_ACQUISITION_TRACKING_ENABLED !== "true") return;
  const visitorId = (await cookies()).get(ACQUISITION_VISITOR_COOKIE)?.value;
  const supabase = client ?? await createClient();
  const { error } = await supabase.rpc("lock_acquisition_user_attribution", { p_visitor_id: visitorId ?? null });
  if (error) console.warn("[acquisition] user attribution lock failed", { code: error.code });
}
