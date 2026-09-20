import type { Metadata } from "next";
import { RegisterForm } from "@/components/auth-forms";
import { AuthShell } from "@/components/auth-shell";

export const metadata: Metadata = { title: "Create account" };

export default function RegisterPage() {
  return <AuthShell context="register" title="Create your account" description="Set up your IncomeNow account. Membership access is checked separately."><RegisterForm /></AuthShell>;
}
