import type { Metadata } from "next";
import { VerifyEmailForm } from "@/components/auth-forms";
import { AuthShell } from "@/components/auth-shell";

export const metadata: Metadata = { title: "Verify your email" };

type VerifyPageProps = { searchParams: Promise<{ state?: string }> };

export default async function VerifyEmailPage({ searchParams }: VerifyPageProps) {
  const { state } = await searchParams;
  return <AuthShell context="verify" title="Verify your email" description="Use the confirmation link sent to your inbox to finish setting up your account."><VerifyEmailForm invalid={state === "invalid"} /></AuthShell>;
}
