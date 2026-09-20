import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/auth-forms";
import { AuthShell } from "@/components/auth-shell";

export const metadata: Metadata = { title: "Recover your password" };

type ForgotPageProps = { searchParams: Promise<{ state?: string }> };

export default async function ForgotPasswordPage({ searchParams }: ForgotPageProps) {
  const { state } = await searchParams;
  return <AuthShell context="recovery" title="Recover your password" description="Request a one-time link for an email/password account."><ForgotPasswordForm invalid={state === "invalid"} /></AuthShell>;
}
