"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, LoaderCircle } from "lucide-react";
import { completeOnboardingAction, skipOnboardingAndContinueAction } from "@/app/account/actions";
import { type AccountPreferenceInput, type AccountPreferences } from "@/lib/account-preferences";
import { PreferenceFields } from "./preference-fields";

export function OnboardingClient({ initial, next }: { initial: AccountPreferences; next: string }) {
  const router = useRouter();
  const [draft, setDraft] = useState<AccountPreferenceInput>(initial);
  const [message, setMessage] = useState<string | null>(null);
  const [canContinueWithoutSave, setCanContinueWithoutSave] = useState(false);
  const [pending, startTransition] = useTransition();

  const complete = () => startTransition(async () => {
    setMessage(null);
    setCanContinueWithoutSave(false);
    const result = await completeOnboardingAction(draft, next);
    if (!result.ok || !result.data) {
      setMessage(result.ok ? "We couldn’t confirm the saved preferences." : result.error);
      return;
    }
    router.replace(result.data.destination);
  });

  const skip = () => startTransition(async () => {
    setMessage(null);
    setCanContinueWithoutSave(false);
    const result = await skipOnboardingAndContinueAction(draft.revision, next);
    if (!result.ok || !result.data) {
      setMessage(result.ok ? "We couldn’t confirm that choice." : result.error);
      setCanContinueWithoutSave(true);
      return;
    }
    router.replace(result.data.destination);
  });

  return (
    <main className="onboarding-page">
      <header className="onboarding-header">
        <Link className="brand" href="/">IncomeNow<span>.in</span></Link>
        <button type="button" disabled={pending} onClick={skip}>Skip for now</button>
      </header>
      <section className="onboarding-content">
        <div className="onboarding-intro"><h1>What would you like to explore?</h1><p>Every question is optional, and you can change these choices later. Your full idea library remains available according to your membership access.</p></div>
        <PreferenceFields value={draft} onChange={setDraft} disabled={pending} />
        {message ? <div className="account-form-message error" role="alert">{message}</div> : null}
        <div className="onboarding-actions">
          <button className="primary-button" type="button" disabled={pending} onClick={complete}>
            {pending ? <LoaderCircle className="control-spinner" size={17} /> : null} Save preferences and continue <ArrowRight size={17} />
          </button>
          <button className="account-text-button" type="button" disabled={pending} onClick={skip}>Skip for now</button>
          {canContinueWithoutSave ? <button className="account-text-button" type="button" onClick={() => router.replace("/account/access")}>Continue without saving</button> : null}
        </div>
      </section>
    </main>
  );
}
