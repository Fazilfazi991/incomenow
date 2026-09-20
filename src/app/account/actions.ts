"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { accountPreferencesSchema, type AccountPreferences } from "@/lib/account-preferences";
import { getPostOnboardingDestination, mapPreferenceRow } from "@/lib/account.server";
import { safeOnboardingDestination } from "@/lib/safe-redirect";
import { createClient } from "@/lib/supabase/server";

export type AccountActionResult<T = undefined> =
  | { ok: true; data?: T }
  | { ok: false; error: string; code?: "conflict" | "invalid" | "unauthenticated" | "unavailable" };

const displayNameSchema = z.string().trim().max(100);

async function getVerifiedClient() {
  const client = await createClient();
  const { data, error } = await client.auth.getUser();
  return error || !data.user ? null : { client, user: data.user };
}

export async function saveDisplayNameAction(value: string): Promise<AccountActionResult<{ displayName: string | null }>> {
  const parsed = displayNameSchema.safeParse(value);
  if (!parsed.success) return { ok: false, error: "Use 100 characters or fewer.", code: "invalid" };
  const verified = await getVerifiedClient();
  if (!verified) return { ok: false, error: "Your account session could not be verified. Sign in again.", code: "unauthenticated" };
  const displayName = parsed.data || null;
  const { data, error } = await verified.client.from("profiles")
    .update({ display_name: displayName })
    .eq("user_id", verified.user.id)
    .select("display_name")
    .single();
  if (error || !data) return { ok: false, error: "We couldn’t save your display name. Try again.", code: "unavailable" };
  revalidatePath("/account", "layout");
  revalidatePath("/app", "layout");
  return { ok: true, data: { displayName: data.display_name } };
}

export async function savePreferencesAction(
  input: unknown,
  markCompleted = false,
): Promise<AccountActionResult<AccountPreferences>> {
  const parsed = accountPreferencesSchema.safeParse(input);
  if (!parsed.success || typeof markCompleted !== "boolean") {
    return { ok: false, error: "Review the selected preferences and try again.", code: "invalid" };
  }
  const verified = await getVerifiedClient();
  if (!verified) return { ok: false, error: "Your account session could not be verified. Sign in again.", code: "unauthenticated" };
  const { data, error } = await verified.client.rpc("save_account_preferences", {
    p_interest_categories: parsed.data.interestCategories,
    p_experience_level: parsed.data.experienceLevel,
    p_preferred_approach: parsed.data.preferredApproach,
    p_expected_revision: parsed.data.revision,
    p_mark_completed: markCompleted,
  });
  if (error) {
    if (error.code === "40001") return { ok: false, error: "These preferences changed in another session. Your choices are still here—reload before saving again.", code: "conflict" };
    return { ok: false, error: "We couldn’t save your preferences. Your choices are still here.", code: "unavailable" };
  }
  const saved = data?.[0];
  if (!saved) return { ok: false, error: "We couldn’t confirm the saved preferences.", code: "unavailable" };
  revalidatePath("/account/settings");
  revalidatePath("/account/getting-started");
  return { ok: true, data: mapPreferenceRow({
    interest_categories: saved.saved_interest_categories,
    experience_level: saved.saved_experience_level,
    preferred_approach: saved.saved_preferred_approach,
    onboarding_state: saved.saved_onboarding_state,
    revision: saved.saved_revision,
    updated_at: saved.saved_updated_at,
  }) };
}

export async function skipOnboardingAction(revision: number): Promise<AccountActionResult<AccountPreferences>> {
  if (!Number.isInteger(revision) || revision < 0) return { ok: false, error: "The saved preference version is invalid.", code: "invalid" };
  const verified = await getVerifiedClient();
  if (!verified) return { ok: false, error: "Your account session could not be verified. Sign in again.", code: "unauthenticated" };
  const { data, error } = await verified.client.rpc("skip_account_onboarding", { p_expected_revision: revision });
  if (error) {
    if (error.code === "40001") return { ok: false, error: "These preferences changed in another session. Reload before continuing.", code: "conflict" };
    return { ok: false, error: "We couldn’t record that choice. You can continue without changing your saved preferences.", code: "unavailable" };
  }
  const saved = data?.[0];
  if (!saved) return { ok: false, error: "We couldn’t confirm that choice.", code: "unavailable" };
  revalidatePath("/account/getting-started");
  return { ok: true, data: mapPreferenceRow({
    interest_categories: saved.saved_interest_categories,
    experience_level: saved.saved_experience_level,
    preferred_approach: saved.saved_preferred_approach,
    onboarding_state: saved.saved_onboarding_state,
    revision: saved.saved_revision,
    updated_at: saved.saved_updated_at,
  }) };
}

export async function completeOnboardingAction(
  input: unknown,
  nextValue: string,
): Promise<AccountActionResult<{ preferences: AccountPreferences; destination: string }>> {
  const saved = await savePreferencesAction(input, true);
  if (!saved.ok) return saved;
  if (!saved.data) return { ok: false, error: "We couldn’t confirm the saved preferences.", code: "unavailable" };
  const intended = safeOnboardingDestination(nextValue);
  return { ok: true, data: { preferences: saved.data, destination: await getPostOnboardingDestination(intended) } };
}

export async function skipOnboardingAndContinueAction(
  revision: number,
  nextValue: string,
): Promise<AccountActionResult<{ preferences: AccountPreferences; destination: string }>> {
  const skipped = await skipOnboardingAction(revision);
  if (!skipped.ok) return skipped;
  if (!skipped.data) return { ok: false, error: "We couldn’t confirm that choice.", code: "unavailable" };
  const intended = safeOnboardingDestination(nextValue);
  return { ok: true, data: { preferences: skipped.data, destination: await getPostOnboardingDestination(intended) } };
}
