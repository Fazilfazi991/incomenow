import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ResetPasswordForm } from "@/components/auth-forms";
import { AuthShell } from "@/components/auth-shell";
import { RECOVERY_VERIFIED_COOKIE } from "@/lib/auth-cookies";

export const metadata: Metadata = { title: "Set a new password" };

export default async function ResetPasswordPage() {
  const cookieStore = await cookies();
  if (!cookieStore.has(RECOVERY_VERIFIED_COOKIE)) redirect("/forgot-password?state=invalid");
  return <AuthShell context="recovery" title="Set a new password" description="Choose a new password for the verified recovery session."><ResetPasswordForm /></AuthShell>;
}
