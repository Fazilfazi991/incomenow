"use server";

import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { RECOVERY_STATE_COOKIE, RECOVERY_VERIFIED_COOKIE } from "@/lib/auth-cookies";
import { lockCurrentUserAttribution } from "@/lib/acquisition.server";
import { getAccountEntryDestination } from "@/lib/account.server";
import {
  emailSchema,
  loginSchema,
  registrationSchema,
  resetPasswordSchema,
  type AuthActionState,
  validationState,
} from "@/lib/auth-validation";
import { getTrustedAppOrigin, safeInternalDestination } from "@/lib/safe-redirect";
import { SupabaseConfigurationError } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

function text(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function unavailableState(): AuthActionState {
  return { status: "error", message: "Account services are not configured for this environment." };
}

export async function registerAction(_previous: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const parsed = registrationSchema.safeParse({
    displayName: text(formData, "displayName"),
    email: text(formData, "email"),
    password: text(formData, "password"),
  });
  if (!parsed.success) return validationState(parsed.error);

  const origin = getTrustedAppOrigin();
  if (!origin) return unavailableState();
  const next = safeInternalDestination(text(formData, "next"));
  let destination = "/verify-email?state=sent";

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        data: parsed.data.displayName ? { display_name: parsed.data.displayName } : undefined,
        emailRedirectTo: `${origin}/auth/confirm?next=${encodeURIComponent(next)}`,
      },
    });

    if (error) return { status: "error", message: "Unable to create the account. Check the details or try again later." };
    if (data.session) {
      await lockCurrentUserAttribution(supabase);
      destination = await getAccountEntryDestination(next, supabase);
    }
  } catch (error) {
    if (error instanceof SupabaseConfigurationError) return unavailableState();
    throw error;
  }

  redirect(destination);
}

export async function loginAction(_previous: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const parsed = loginSchema.safeParse({ email: text(formData, "email"), password: text(formData, "password") });
  if (!parsed.success) return validationState(parsed.error);
  let destination: string;

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword(parsed.data);
    if (error) return { status: "error", message: "Unable to sign in. Check your credentials and verification status." };
    await lockCurrentUserAttribution(supabase);
    destination = await getAccountEntryDestination(safeInternalDestination(text(formData, "next")), supabase);
  } catch (error) {
    if (error instanceof SupabaseConfigurationError) return unavailableState();
    throw error;
  }

  redirect(destination);
}

export async function googleAction(formData: FormData) {
  const origin = getTrustedAppOrigin();
  if (!origin) redirect("/login?error=configuration");
  let destination: string;

  try {
    const supabase = await createClient();
    const next = safeInternalDestination(text(formData, "next"));
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
        scopes: "openid email profile",
      },
    });
    destination = error || !data.url ? "/login?error=oauth" : data.url;
  } catch (error) {
    if (!(error instanceof SupabaseConfigurationError)) throw error;
    destination = "/login?error=configuration";
  }

  redirect(destination);
}

export async function resendVerificationAction(_previous: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const parsed = emailSchema.safeParse({ email: text(formData, "email") });
  if (!parsed.success) return validationState(parsed.error);
  const origin = getTrustedAppOrigin();
  if (!origin) return unavailableState();

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.resend({
      type: "signup",
      email: parsed.data.email,
      options: { emailRedirectTo: `${origin}/auth/confirm?next=/account/access` },
    });
    if (error?.status === 429) return { status: "error", message: "Please wait before requesting another verification email." };
    if (error) return { status: "error", message: "The verification request could not be completed right now." };
    return { status: "success", message: "If the account is eligible, a new verification message has been requested." };
  } catch (error) {
    if (error instanceof SupabaseConfigurationError) return unavailableState();
    throw error;
  }
}

export async function requestPasswordResetAction(_previous: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const parsed = emailSchema.safeParse({ email: text(formData, "email") });
  if (!parsed.success) return validationState(parsed.error);
  const origin = getTrustedAppOrigin();
  if (!origin) return unavailableState();

  const state = randomUUID();
  const cookieStore = await cookies();
  cookieStore.set(RECOVERY_STATE_COOKIE, state, {
    httpOnly: true,
    sameSite: "lax",
    secure: origin.startsWith("https://"),
    maxAge: 30 * 60,
    path: "/auth/recovery",
  });

  try {
    const supabase = await createClient();
    const redirectTo = `${origin}/auth/recovery?state=${encodeURIComponent(state)}`;
    const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, { redirectTo });
    if (error?.status === 429) return { status: "error", message: "Please wait before requesting another password reset." };
    if (error) return { status: "error", message: "The reset request could not be completed right now." };
    return { status: "success", message: "If an eligible account exists, a password-reset message has been requested." };
  } catch (error) {
    if (error instanceof SupabaseConfigurationError) return unavailableState();
    throw error;
  }
}

export async function resetPasswordAction(_previous: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const parsed = resetPasswordSchema.safeParse({ password: text(formData, "password") });
  if (!parsed.success) return validationState(parsed.error);

  const cookieStore = await cookies();
  const verifiedUserId = cookieStore.get(RECOVERY_VERIFIED_COOKIE)?.value;
  if (!verifiedUserId) return { status: "error", message: "This recovery session is missing or expired. Request a new reset link." };

  try {
    const supabase = await createClient();
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user || userData.user.id !== verifiedUserId) {
      return { status: "error", message: "This recovery session is invalid or expired. Request a new reset link." };
    }

    const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
    if (error) return { status: "error", message: "The password could not be changed. Request a new reset link and try again." };
    cookieStore.delete(RECOVERY_VERIFIED_COOKIE);
    await supabase.auth.signOut();
  } catch (error) {
    if (error instanceof SupabaseConfigurationError) return unavailableState();
    throw error;
  }

  redirect("/login?status=password-updated");
}

export async function signOutAction() {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
  } catch (error) {
    if (!(error instanceof SupabaseConfigurationError)) throw error;
  }
  redirect("/login?status=signed-out");
}
