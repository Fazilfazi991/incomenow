import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { evaluateEntitlement, type AccessStatus, type EntitlementRecord } from "./access-policy";
import { isSupabaseConfigured } from "./supabase/config";
import { createClient } from "./supabase/server";

export type AccountAccessContext = {
  configuration: "ready" | "missing";
  authentication: "verified" | "signed-out" | "unavailable";
  user: User | null;
  displayName: string | null;
  access: AccessStatus;
};

async function loadAccountAccessContext(): Promise<AccountAccessContext> {
  if (!isSupabaseConfigured()) {
    return { configuration: "missing", authentication: "unavailable", user: null, displayName: null, access: "unavailable" };
  }

  const supabase = await createClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) {
    return { configuration: "ready", authentication: "unavailable", user: null, displayName: null, access: "unavailable" };
  }
  if (!userData.user) {
    return { configuration: "ready", authentication: "signed-out", user: null, displayName: null, access: "inactive" };
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
      authentication: "verified",
      user: userData.user,
      displayName: profileResult.data?.display_name ?? null,
      access: "unavailable",
    };
  }

  return {
    configuration: "ready",
    authentication: "verified",
    user: userData.user,
    displayName: profileResult.data?.display_name ?? null,
    access: evaluateEntitlement(entitlementResult.data as EntitlementRecord | null),
  };
}

export const getAccountAccessContext = cache(loadAccountAccessContext);

export async function requireActiveMembership(destination: string) {
  const context = await getAccountAccessContext();
  if (context.authentication === "signed-out") redirect(`/login?next=${encodeURIComponent(destination)}`);
  if (context.authentication === "unavailable" || !context.user) redirect("/account/access");
  if (context.access !== "active") redirect("/account/access");
  return context;
}
