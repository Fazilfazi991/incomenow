import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { evaluateEntitlement, type AccessStatus, type EntitlementRecord } from "./access-policy";
import { isSupabaseConfigured } from "./supabase/config";
import { createClient } from "./supabase/server";

export type AccountAccessContext = {
  configuration: "ready" | "missing";
  user: User | null;
  displayName: string | null;
  access: AccessStatus;
};

async function loadAccountAccessContext(): Promise<AccountAccessContext> {
  if (!isSupabaseConfigured()) {
    return { configuration: "missing", user: null, displayName: null, access: "unavailable" };
  }

  const supabase = await createClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    return { configuration: "ready", user: null, displayName: null, access: "inactive" };
  }

  const [profileResult, entitlementResult] = await Promise.all([
    supabase.from("profiles").select("display_name").eq("user_id", userData.user.id).maybeSingle(),
    supabase
      .from("membership_entitlements")
      .select("enabled, starts_at, expires_at, revoked_at")
      .eq("user_id", userData.user.id)
      .maybeSingle(),
  ]);

  if (entitlementResult.error) {
    return {
      configuration: "ready",
      user: userData.user,
      displayName: profileResult.data?.display_name ?? null,
      access: "unavailable",
    };
  }

  return {
    configuration: "ready",
    user: userData.user,
    displayName: profileResult.data?.display_name ?? null,
    access: evaluateEntitlement(entitlementResult.data as EntitlementRecord | null),
  };
}

export const getAccountAccessContext = cache(loadAccountAccessContext);

export async function requireActiveMembership(destination: string) {
  const context = await getAccountAccessContext();
  if (!context.user) redirect(`/login?next=${encodeURIComponent(destination)}`);
  if (context.access !== "active") redirect("/account/access");
  return context;
}
