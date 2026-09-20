import type { Metadata } from "next";
import { RegisterForm } from "@/components/auth-forms";
import { AuthShell } from "@/components/auth-shell";
import { safeInternalDestination } from "@/lib/safe-redirect";

export const metadata: Metadata = { title: "Create account" };

type RegisterPageProps = { searchParams: Promise<{ next?: string }> };

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const params = await searchParams;
  return <AuthShell context="register" title="Create your account" description="Set up your IncomeNow account. Paid access is checked separately."><RegisterForm next={safeInternalDestination(params.next)} /></AuthShell>;
}
