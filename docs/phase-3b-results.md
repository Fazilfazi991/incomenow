# Phase 3B results

## Outcome

Phase 3B implements optional onboarding and account settings without weakening the existing membership boundary. `/account/getting-started`, `/account/settings`, and `/account/access` require a verified account but do not require active membership. `/app/*` remains server-guarded by the separate entitlement record.

## Data and security

Migration `20260920160524_phase_3b_account_preferences.sql` adds one owner-keyed `account_preferences` row per account. Stable interest, experience, and approach identifiers are constrained in PostgreSQL and mirrored in the shared TypeScript taxonomy.

Authenticated accounts receive SELECT on their own row through RLS. They receive no direct insert, update, or delete permission. `save_account_preferences` and `skip_account_onboarding` are the only write paths; both derive ownership from `auth.uid()`, validate all values, manage timestamps/revisions on the server, and reject stale revisions with SQLSTATE `40001`. Preference and onboarding state never create, update, or imply a membership entitlement.

## Behavior

- Normal successful account entry to `/account/access` offers onboarding while its state is unanswered. Explicit deep links remain intact.
- Onboarding has three explicit states: `unanswered`, `completed`, and `skipped`. All preference groups are optional; saving an empty form is valid and records `completed`, while explicit skip records `skipped` without selections. A first preference save from Settings also resolves `unanswered` to `completed`; later Settings saves preserve `completed` or `skipped`.
- A failed save retains the client draft. A failed skip offers honest continuation without claiming the choice was persisted.
- Active members continue to the intended paid destination or the idea library after onboarding. Inactive or unverifiable membership returns to `/account/access`.
- Safe continuation accepts only the allowlisted account and member destinations, rejects external or self-referential onboarding destinations, and falls back by current membership state. Onboarding is an account-entry offer, not a middleware gate.
- Settings keeps profile and preference drafts, saves, and cancels independent. A profile save refreshes the account identity without discarding an unsaved preference draft; each Cancel restores only its own last-saved values.
- Leaving Settings with either draft dirty uses a native `<dialog>` decision modal, and browser unload uses the native unsaved-changes prompt.
- Authentication methods come from the account's linked identity providers. The UI does not infer a provider from the email address.
- Account navigation adds Getting started and Settings to the verified-account shell. The paid member shell adds Settings while remaining entitlement-gated; `/account/access` is preserved as the membership-status destination.

## Verification evidence

- `pnpm run typecheck`: passed.
- `pnpm run lint`: passed.
- `pnpm test`: 17 files, 54 tests passed.
- `pnpm run test:db`: 3 files, 116 assertions passed.
- `supabase db lint --local --level warning`: passed with no schema errors.
- `pnpm run test:plan-sync`: passed with all 17 stages and 37 tasks synchronized.
- `pnpm run build`: passed on Next.js 16.3.5.
- `pnpm run test:integration:phase3b`: all nine checks passed against the local production server with one disposable inactive account and one disposable active account: account routes, unchanged membership boundary, empty/skip/selected transitions, owner isolation, stale-write conflict, direct-write denial, self-entitlement denial, independent profile update, and fresh-session persistence. Both accounts were removed afterward.
- Browser verification used the optimized local build. Onboarding and settings were checked at 1440, 768, 390, and 320 widths with no horizontal overflow, framework error overlay, page error, or browser-console error. Live interactions verified onboarding persistence/continuation, independent Settings saves/cancels, the native unsaved-change modal, identity-derived authentication methods, membership-access linking, and sign-out availability.
- Impeccable finish review disposition: **SHIP**, with no findings. The mechanical detector had already run once and was not rerun.

Screenshots:

- `.impeccable/review/phase-3b-onboarding-desktop.png` — 1440×900 artifact.
- `.impeccable/review/phase-3b-onboarding-mobile.png` — 379×852 IAB content-surface artifact captured from a 390×900 viewport.
- `.impeccable/review/phase-3b-settings-desktop.png` — 1440×900 artifact.
- `.impeccable/review/phase-3b-settings-mobile.png` — 379×852 IAB content-surface artifact captured from a 390×900 viewport.

The authentication-method mapper has unit coverage for email, Google, and combined identity records, but Google and combined-provider evidence is synthetic only. No approved Google OAuth credentials were available for a real provider journey.

## Still pending

Checkout, billing, admin, analytics, avatar uploads, email changes, account linking/deletion, hosted Supabase migration/configuration and smoke tests, real Google OAuth and combined-provider verification, external SMTP/inbox delivery, production email-template and redirect configuration, production security/domain/operational review, approved commercial terms, and final resource licences/assets remain pending. No hosted project was contacted or changed, and nothing was pushed, published, or deployed.
