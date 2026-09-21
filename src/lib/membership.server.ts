import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import { isAuthSessionMissingError, type User } from "@supabase/supabase-js";
import {
  evaluateEntitlement,
  evaluateIdeaAccess,
  type AccessStatus,
  type EntitlementRecord,
  type IdeaAccessDecision,
  type IdeaGrantRecord,
} from "./access-policy";
import { isSupabaseConfigured } from "./supabase/config";
import { createClient } from "./supabase/server";

export type AccountAccessContext = {
  configuration: "ready" | "missing";
  authentication: "verified" | "signed-out" | "unavailable";
  user: User | null;
  displayName: string | null;
  /** Full monthly membership only. Kept as `access` for account/settings compatibility. */
  access: AccessStatus;
  fullMembership: AccessStatus;
  ideaGrantLookup: "ready" | "unavailable";
  ideaGrants: IdeaGrantRecord[];
};

const unavailableContext: AccountAccessContext = {
  configuration: "missing",
  authentication: "unavailable",
  user: null,
  displayName: null,
  access: "unavailable",
  fullMembership: "unavailable",
  ideaGrantLookup: "unavailable",
  ideaGrants: [],
};

async function loadAccountAccessContext(): Promise<AccountAccessContext> {
  if (!isSupabaseConfigured()) return unavailableContext;

  const supabase = await createClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError && !isAuthSessionMissingError(userError)) {
    return { ...unavailableContext, configuration: "ready" };
  }
  if (!userData.user) {
    return {
      configuration: "ready",
      authentication: "signed-out",
      user: null,
      displayName: null,
      access: "inactive",
      fullMembership: "inactive",
      ideaGrantLookup: "ready",
      ideaGrants: [],
    };
  }

  const [profileResult, entitlementResult, grantResult] = await Promise.all([
    supabase.from("profiles").select("display_name").eq("user_id", userData.user.id).maybeSingle(),
    supabase
      .from("membership_entitlements")
      .select("enabled, starts_at, expires_at, revoked_at")
      .eq("user_id", userData.user.id)
      .maybeSingle(),
    supabase
      .from("idea_access_grants")
      .select("idea_id, offer_code, enabled, starts_at, expires_at, revoked_at")
      .eq("user_id", userData.user.id),
  ]);

  const fullMembership = entitlementResult.error
    ? "unavailable"
    : evaluateEntitlement(entitlementResult.data as EntitlementRecord | null);

  return {
    configuration: "ready",
    authentication: "verified",
    user: userData.user,
    displayName: profileResult.data?.display_name ?? null,
    access: fullMembership,
    fullMembership,
    ideaGrantLookup: grantResult.error ? "unavailable" : "ready",
    ideaGrants: grantResult.error ? [] : (grantResult.data as IdeaGrantRecord[]),
  };
}

export const getAccountAccessContext = cache(loadAccountAccessContext);

export function getIdeaAccessDecision(context: AccountAccessContext, ideaId: string): IdeaAccessDecision {
  return evaluateIdeaAccess({
    ideaId,
    fullMembership: context.fullMembership,
    grants: context.ideaGrants,
    grantLookup: context.ideaGrantLookup,
  });
}

export async function requireVerifiedAccount(destination: string) {
  const context = await getAccountAccessContext();
  if (context.authentication === "signed-out") redirect(`/login?next=${encodeURIComponent(destination)}`);
  if (context.authentication === "unavailable" || !context.user) redirect("/account/access");
  return context;
}

export async function requireActiveMembership(destination: string) {
  const context = await requireVerifiedAccount(destination);
  if (context.fullMembership !== "active") redirect("/account/access");
  return context;
}
