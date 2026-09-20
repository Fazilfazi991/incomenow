import type { Metadata } from "next";
import { LoginForm } from "@/components/auth-forms";
import { AuthShell } from "@/components/auth-shell";
import { safeInternalDestination } from "@/lib/safe-redirect";

export const metadata: Metadata = { title: "Log in" };

type LoginPageProps = { searchParams: Promise<{ next?: string; error?: string; status?: string }> };

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const notice = params.status === "password-updated" ? "Password updated. Log in with the new password." : params.status === "signed-out" ? "You have been signed out." : params.error === "oauth" ? "Google sign-in was cancelled or could not be completed." : params.error === "configuration" ? "Account services are not configured for this environment." : undefined;
  return <AuthShell context="login" title="Welcome back" description="Log in to continue with your IncomeNow account."><LoginForm next={safeInternalDestination(params.next)} notice={notice} /></AuthShell>;
}
