# Phase 2A.1 integration results

Executed on 2026-09-20 against the disposable local Supabase project `IncomeNow`. Supabase CLI 2.117.0 used Docker Desktop's `desktop-linux` context. No hosted project was linked, contacted, migrated, or modified.

| Area | Status | Evidence and actual result |
| --- | --- | --- |
| 1. Local Supabase startup | Pass | Docker's Linux engine responded. Local API `127.0.0.1:54321`, Postgres `127.0.0.1:54322`, Studio `127.0.0.1:54323`, and Mailpit `127.0.0.1:54324` were reported. Required Auth, database, API gateway, PostgREST, and Mailpit containers were healthy. The optional Vector service restarted and was not needed by Phase 2A. |
| 2. Migration application | Pass | `supabase db reset --local --no-seed` completed against the freshly created disposable local database. Migration list showed local/applied version `20260920112114`. |
| 3. pgTAP database tests | Pass | `supabase test db --local` executed the real SQL suite: 1 file, 17 assertions, all successful. The original 15 assertions were preserved; two checks explicitly prove database role `authenticated` and the intended user-A `auth.uid()` claim. Tests ran transactionally and rolled back. |
| 4. Email signup and confirmation | Pass locally | Two accounts were created through the real registration UI. Pre-confirmation login was denied. Mailpit captured the custom confirmation message, and its real link passed through `/auth/confirm`. Exactly one profile was created per user and no entitlement was created. This verifies development capture, not external inbox delivery. |
| 5. Login, refresh, and sign-out | Pass | Invalid login failed; confirmed login succeeded; browser reload retained the session; the Auth service completed `refreshSession`; UI sign-out completed; `/api/member/access` returned 401 and protected navigation returned to the allowlisted login destination afterward. |
| 6. Recovery | Pass locally | Unknown-address feedback was generic and produced no message. A real Mailpit recovery link passed through `/auth/recovery`, enabled the verified reset context, and changed the password. The old password was rejected and the user-chosen new password logged in successfully. Direct access, malformed state, replayed links, a locally aged expired link, and a normal session without recovery proof were denied. The verified context was consumed after success. |
| 7. Entitlement transitions | Pass | No grant denied access; an active local grant allowed `/app/explore` and all three protected idea details. Disabled, revoked, expired, and future-start grants denied access. Temporarily revoking the local lookup permission produced fail-closed `unavailable` behavior, after which the exact select grant was restored. |
| 8. Cross-user isolation | Pass | Separate browser contexts were used for A and B. User A read/updated only its profile, could not read/update B, could not change profile ownership, and could not create/change entitlements. Anonymous profile access was denied. B remained inactive while A was active. Direct data, API, and server-rendered page boundaries agreed. |
| 9. Google provider authentication | Blocked | No approved development Google OAuth client ID/secret or enabled local provider block was available. No Google Cloud application was created or changed. Required non-secret values: JavaScript origin `http://localhost:3000`; Google → Supabase redirect `http://127.0.0.1:54321/auth/v1/callback`; Supabase → app callback `http://localhost:3000/auth/callback`. Setup is documented in `docs/auth-setup.md`. |
| 10. Hosted configuration and external email delivery | Blocked / not executed | No hosted project was linked or mutated. Hosted migration, redirect settings, Google provider, SMTP, templates, external delivery, and production smoke tests remain operator-approved launch work. |

## Fixes made during verification

- Raised the local-only Auth email limit from 2 to 20 messages/hour so two confirmations plus recovery scenarios can execute while rate limiting remains enabled.
- Added explicit pgTAP role/JWT assertions, increasing the database suite from 15 to 17 assertions without weakening any policy.
- Added `scripts/verify-phase-2a-local.mjs` and `npm run test:integration:local` for reproducible Auth refresh, RLS, API, protected-content, cross-user, cache-policy, and sign-out checks without storing credentials.
- Corrected the documented local entitlement upsert so it also clears `starts_at`; this prevents a prior future-start fixture from remaining inactive unexpectedly.
- Suppressed development request logging for `/auth/callback`, `/auth/confirm`, and `/auth/recovery`. A redaction probe confirmed that ordinary requests still log while callback URLs and their short-lived query credentials do not.
- Added the Supabase CLI's generated `.temp` and `.branches` directories to the repository ignore rules so local runtime credentials and branch metadata cannot be accidentally committed.

## Readiness

The local database, development-email account flows, recovery flow, entitlement policy, RLS boundaries, access API, and protected-content boundaries are ready foundations for Phase 2B workspace development. Google OAuth and production email/hosted configuration remain explicit launch blockers. This result does not claim production readiness.

The two disposable browser-test accounts, their cascaded profiles and entitlement fixture, and their captured Mailpit messages were removed after verification. The reusable local configuration and transactional test suite remain in place.
