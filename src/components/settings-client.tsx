"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, LoaderCircle } from "lucide-react";
import { saveDisplayNameAction, savePreferencesAction } from "@/app/account/actions";
import type { AccountPreferenceInput, AccountPreferences } from "@/lib/account-preferences";
import type { AuthenticationMethod } from "@/lib/account-identity";
import type { AccessStatus } from "@/lib/access-policy";
import { PreferenceFields } from "./preference-fields";

type SettingsClientProps = {
  email: string;
  initialDisplayName: string | null;
  initialPreferences: AccountPreferences;
  methods: AuthenticationMethod[];
  access: AccessStatus;
};

export function SettingsClient({ email, initialDisplayName, initialPreferences, methods, access }: SettingsClientProps) {
  const router = useRouter();
  const initialPreferenceInput: AccountPreferenceInput = {
    interestCategories: initialPreferences.interestCategories,
    experienceLevel: initialPreferences.experienceLevel,
    preferredApproach: initialPreferences.preferredApproach,
    revision: initialPreferences.revision,
  };
  const [displayName, setDisplayName] = useState(initialDisplayName ?? "");
  const [savedDisplayName, setSavedDisplayName] = useState(initialDisplayName ?? "");
  const [profileMessage, setProfileMessage] = useState<string | null>(null);
  const [profilePending, startProfileTransition] = useTransition();
  const [preferences, setPreferences] = useState<AccountPreferenceInput>(initialPreferenceInput);
  const [savedPreferences, setSavedPreferences] = useState<AccountPreferenceInput>(initialPreferenceInput);
  const [preferenceMessage, setPreferenceMessage] = useState<string | null>(null);
  const [preferencePending, startPreferenceTransition] = useTransition();
  const [navigationTarget, setNavigationTarget] = useState<string | null>(null);
  const navigationDialog = useRef<HTMLDialogElement>(null);
  const navigationTrigger = useRef<HTMLElement | null>(null);

  const profileDirty = displayName !== savedDisplayName;
  const preferencesDirty = JSON.stringify(preferences) !== JSON.stringify(savedPreferences);
  const dirty = profileDirty || preferencesDirty;

  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => {
      if (!dirty) return;
      event.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  useEffect(() => {
    const protectInternalNavigation = (event: MouseEvent) => {
      if (!dirty || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const target = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>("a[href]") : null;
      if (!target || target.target === "_blank") return;
      const destination = new URL(target.href, window.location.href);
      if (destination.origin !== window.location.origin || destination.href === window.location.href) return;
      event.preventDefault();
      event.stopPropagation();
      navigationTrigger.current = target;
      setNavigationTarget(`${destination.pathname}${destination.search}${destination.hash}`);
    };
    document.addEventListener("click", protectInternalNavigation, true);
    return () => document.removeEventListener("click", protectInternalNavigation, true);
  }, [dirty]);

  useEffect(() => {
    const dialog = navigationDialog.current;
    if (!dialog) return;
    if (navigationTarget) {
      if (!dialog.open) {
        if (typeof dialog.showModal === "function") dialog.showModal();
        else dialog.setAttribute("open", "");
      }
      dialog.querySelector<HTMLButtonElement>("button")?.focus();
    } else if (dialog.open) {
      if (typeof dialog.close === "function") dialog.close();
      else dialog.removeAttribute("open");
    }
  }, [navigationTarget]);

  const closeNavigationDialog = () => {
    setNavigationTarget(null);
    queueMicrotask(() => navigationTrigger.current?.focus());
  };

  const saveProfile = () => startProfileTransition(async () => {
    setProfileMessage(null);
    const result = await saveDisplayNameAction(displayName);
    if (!result.ok || !result.data) {
      setProfileMessage(result.ok ? "We couldn’t confirm that update." : result.error);
      return;
    }
    const confirmed = result.data.displayName ?? "";
    setDisplayName(confirmed);
    setSavedDisplayName(confirmed);
    setProfileMessage("Display name saved.");
    router.refresh();
  });

  const savePreferences = () => startPreferenceTransition(async () => {
    setPreferenceMessage(null);
    const result = await savePreferencesAction(preferences);
    if (!result.ok || !result.data) {
      setPreferenceMessage(result.ok ? "We couldn’t confirm the saved preferences." : result.error);
      return;
    }
    const confirmed: AccountPreferenceInput = {
      interestCategories: result.data.interestCategories,
      experienceLevel: result.data.experienceLevel,
      preferredApproach: result.data.preferredApproach,
      revision: result.data.revision,
    };
    setPreferences(confirmed);
    setSavedPreferences(confirmed);
    setPreferenceMessage("Discovery preferences saved.");
  });

  return (
    <div className="settings-stack">
      <section className="settings-section" aria-labelledby="profile-heading">
        <div className="settings-heading"><div><h2 id="profile-heading">Profile</h2><p>Choose the name shown in your IncomeNow account.</p></div></div>
        <label className="account-input"><span>Display name</span><input value={displayName} maxLength={100} onChange={(event) => { setDisplayName(event.target.value); setProfileMessage(null); }} /></label>
        <label className="account-input"><span>Email</span><input value={email} readOnly aria-readonly="true" /></label>
        {profileMessage ? <div className={profileMessage.endsWith("saved.") ? "account-form-message success" : "account-form-message error"} role="status">{profileMessage}</div> : null}
        <div className="settings-actions"><button className="account-text-button" type="button" disabled={profilePending || !profileDirty} onClick={() => { setDisplayName(savedDisplayName); setProfileMessage(null); }}>Cancel changes</button><button className="primary-button" type="button" disabled={profilePending || !profileDirty} onClick={saveProfile}>{profilePending ? <LoaderCircle className="control-spinner" size={16} /> : null} Save profile</button></div>
      </section>

      <section className="settings-section" aria-labelledby="preferences-heading">
        <div className="settings-heading"><div><h2 id="preferences-heading">Discovery preferences</h2><p>Keep these broad or leave any answer blank. They do not change membership access.</p></div><Link href="/account/getting-started">Open guided view <ArrowRight size={15} /></Link></div>
        <PreferenceFields value={preferences} onChange={(nextPreferences) => { setPreferences(nextPreferences); setPreferenceMessage(null); }} disabled={preferencePending} compact />
        {preferenceMessage ? <div className={preferenceMessage.endsWith("saved.") ? "account-form-message success" : "account-form-message error"} role="status">{preferenceMessage}</div> : null}
        <div className="settings-actions"><button className="account-text-button" type="button" disabled={preferencePending || !preferencesDirty} onClick={() => { setPreferences(savedPreferences); setPreferenceMessage(null); }}>Cancel changes</button><button className="primary-button" type="button" disabled={preferencePending || !preferencesDirty} onClick={savePreferences}>{preferencePending ? <LoaderCircle className="control-spinner" size={16} /> : null} Save preferences</button></div>
      </section>

      <section className="settings-section settings-summary" aria-labelledby="security-heading">
        <div><h2 id="security-heading">Sign-in and security</h2><p>Authentication methods connected to this account.</p></div>
        <dl><div><dt>Email</dt><dd>{email}</dd></div><div><dt>Sign-in methods</dt><dd>{methods.length ? methods.join(", ") : "Unavailable"}</dd></div></dl>
      </section>

      <section className="settings-section settings-summary" aria-labelledby="membership-heading">
        <div><h2 id="membership-heading">Membership access</h2><p>Membership is checked separately from your account and preferences.</p></div>
        <div className="membership-setting-row"><span className={`account-status ${access}`}>{access === "active" ? "Active" : access === "inactive" ? "Not active" : "Unavailable"}</span><Link className="secondary-button" href="/account/access">Review access <ArrowRight size={15} /></Link></div>
      </section>
      <dialog ref={navigationDialog} className="decision-backdrop" aria-labelledby="account-unsaved-title" onCancel={(event) => { event.preventDefault(); closeNavigationDialog(); }}>
        <div className="decision-dialog"><h2 id="account-unsaved-title">Discard account changes?</h2><p>You have unsaved profile or preference changes. Stay here to keep editing, or discard them and continue.</p><div><button type="button" className="secondary-button" onClick={closeNavigationDialog}>Stay here</button><button type="button" className="text-button danger" onClick={() => { const target = navigationTarget; setDisplayName(savedDisplayName); setPreferences(savedPreferences); setNavigationTarget(null); navigationTrigger.current = null; if (target) router.push(target); }}>Discard changes</button></div></div>
      </dialog>
    </div>
  );
}
