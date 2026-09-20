import "server-only";

import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { emptyAccountPreferences, type AccountPreferences } from "./account-preferences";
import { getAuthenticationMethods } from "./account-identity";
import { getAccountAccessContext, type AccountAccessContext } from "./membership.server";
import { createClient } from "./supabase/server";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

export type Loadable<T> = { status: "ready"; data: T } | { status: "unavailable" };

export type VerifiedAccountData = {
  context: AccountAccessContext;
  user: User;
  profile: Loadable<{ displayName: string | null }>;
  preferences: Loadable<AccountPreferences>;
  authenticationMethods: ReturnType<typeof getAuthenticationMethods>;
};

function mapPreferenceRow(row: {
  interest_categories: string[];
  experience_level: string | null;
  preferred_approach: string | null;
  onboarding_state: "unanswered" | "completed" | "skipped";
  revision: number;
  updated_at: string;
}): AccountPreferences {
  return {
    interestCategories: row.interest_categories as AccountPreferences["interestCategories"],
    experienceLevel: row.experience_level as AccountPreferences["experienceLevel"],
    preferredApproach: row.preferred_approach as AccountPreferences["preferredApproach"],
    onboardingState: row.onboarding_state,
    revision: row.revision,
    updatedAt: row.updated_at,
  };
}

export async function loadOwnPreferences(client: SupabaseServerClient): Promise<Loadable<AccountPreferences>> {
  const { data, error } = await client.from("account_preferences")
    .select("interest_categories, experience_level, preferred_approach, onboarding_state, revision, updated_at")
    .maybeSingle();
  if (error) return { status: "unavailable" };
  return { status: "ready", data: data ? mapPreferenceRow(data) : emptyAccountPreferences };
}

export async function getVerifiedAccountData(destination = "/account/settings"): Promise<VerifiedAccountData | { context: AccountAccessContext; user: null }> {
  const context = await getAccountAccessContext();
  if (context.authentication === "signed-out") redirect(`/login?next=${encodeURIComponent(destination)}`);
  if (context.authentication !== "verified" || !context.user) return { context, user: null };

  const client = await createClient();
  const [profileResult, preferences] = await Promise.all([
    client.from("profiles").select("display_name").eq("user_id", context.user.id).maybeSingle(),
    loadOwnPreferences(client),
  ]);

  return {
    context,
    user: context.user,
    profile: profileResult.error
      ? { status: "unavailable" }
      : { status: "ready", data: { displayName: profileResult.data?.display_name ?? null } },
    preferences,
    authenticationMethods: getAuthenticationMethods(context.user),
  };
}

export async function getAccountEntryDestination(destination: string, client?: SupabaseServerClient) {
  const pathname = new URL(destination, "https://incomenow.invalid").pathname;
  if (pathname !== "/account/access") return destination;
  const supabase = client ?? await createClient();
  const preferences = await loadOwnPreferences(supabase);
  if (preferences.status === "ready" && preferences.data.onboardingState === "unanswered") {
    return `/account/getting-started?next=${encodeURIComponent(destination)}`;
  }
  return destination;
}

export async function getPostOnboardingDestination(intendedDestination: string) {
  const context = await getAccountAccessContext();
  if (context.authentication !== "verified" || context.access !== "active") return "/account/access";
  const pathname = new URL(intendedDestination, "https://incomenow.invalid").pathname;
  return pathname.startsWith("/app/") ? intendedDestination : "/app/explore";
}

export { mapPreferenceRow };
