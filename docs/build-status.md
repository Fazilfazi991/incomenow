# Build status

## Phase and stack

Phase 3C is code-complete and locally verified in the workspace, building on the completed Phase 3B onboarding/settings commit `82644aa`, Phase 3A public entry, Phase 2B account-synced workspace, and Phase 2A.1 authentication baseline. The app uses Next.js 16 App Router, React 19, TypeScript, Supabase SSR/Auth, PostgreSQL RLS migrations, Zod, Tailwind CSS 4, Vitest/Testing Library, and pgTAP database tests.

This status deliberately distinguishes local verification from launch verification. Docker's Linux engine and the `IncomeNow` local Supabase stack were available during Phase 2A.1, but Google OAuth, a hosted Supabase project, external SMTP delivery, and production configuration were not exercised. No hosted Supabase project was contacted or changed.

## Implemented account flows

- Email/password registration with a 12-character minimum for new passwords.
- Email confirmation and resend through a purpose-specific `/auth/confirm` token-hash handler.
- Email/password login with a whitelisted post-auth destination.
- Google OAuth initiation and PKCE callback handling.
- Enumeration-resistant password-reset request, state-bound recovery verification, short-lived verified recovery context, password update, and session clearing.
- Explicit service-unavailable feedback when required public configuration is absent.
- Sign-out from the account-access page.

## Access and protected content

- `profiles`, provider-independent `membership_entitlements`, and account-bound `idea_access_grants` tables with RLS and minimal grants.
- Idempotent profile creation from `auth.users` with safe display metadata only.
- Separate authentication, full-membership, and per-idea grant checks; signup, email verification, offer URLs, and onboarding never create paid access.
- Registered accounts can browse, search, filter, and bookmark the safe catalogue. Full records require active full membership or a matching active idea grant.
- The `starter-pergola-v1` grant is constrained to IDEA #001, ordinary users cannot write it, and active-window evaluation covers future, expired, disabled, and revoked rows.
- Server-side idea authorization runs at each paid data boundary and is repeated by database policies/functions for project, task, stage, and note operations.
- `/app/explore` and locked `/app/ideas/[slug]` routes receive only reduced, server-approved DTOs. Full plan/resource markers are absent from production browser chunks.
- Dynamic `/api/member/access` responses are private/no-store and distinguish signed-out, registered-preview, starter, full, and unavailable states.
- `/account/access` renders registered, starter, full, and unavailable states without inventing checkout behavior.

## Preserved Phase 1 behavior

- `/preview/explore`, `/preview/saved`, and the three available detail routes retain fictional sample content and device-local bookmarks.
- Preview routes remain server-disabled by default in production and can be enabled only with `ENABLE_PREVIEW_ROUTES=true`.
- Updates, support, checkout/payment, admin, analytics, real downloads, and live demos remain out of scope. Account-synced bookmarks and the project workspace are now implemented separately from preview storage.

## Phase 2B workspace

- Account bookmarks use owner-scoped rows and server timestamps; duplicate saves are idempotent at the action boundary and never reset `saved_at`.
- `/app/saved` provides real account state, filters, optimistic save/remove feedback, rollback, and Undo without touching preview local storage.
- Projects are created atomically through a narrow authenticated function and pinned to an immutable structural plan version.
- `/app/projects` derives Active, Paused, and Complete state from persisted rows, reports completed-stage progress, identifies the current focus and next incomplete action, and links back to the original idea.
- `/app/projects/[projectId]` provides versioned stage navigation, completed-stage overall progress, required-task progress within each stage, a clear distinction between selected stage and derived current focus, pause/resume, one revisioned plain-text note per stage, unsaved-navigation decisions, and repository-backed stage resources.
- Removing full membership hides projects that no longer have relevant idea access without deleting them. An independent starter grant keeps the canonical Pergola project visible and editable; restoring full membership reveals the same other rows.

## Phase 3A public entry

- `/` is a public homepage with the approved hero, four-step explanation, three stable example ideas, public quick previews, capability explanation, membership introduction, FAQ, and real account-entry links.
- `/membership` presents one monthly IncomeNow membership with `Price to be confirmed`, explicit checkout unavailability, implemented inclusions, separate member responsibilities, a four-step future access journey, licence caution, and FAQ.
- A shared public header/footer remains distinct from authentication and protected-member shells. The mobile header uses a disclosure menu instead of member navigation.
- The public example client receives an explicit allowlisted `PublicIdea` projection for ideas 001, 003, and 004. Full idea objects, plan stages/tasks, resource IDs/locations, bookmarks, and notes remain outside the client payload.
- Public account actions reuse the server membership context and distinguish signed-out, active, inactive, and unavailable states. Both routes are dynamic and the optional lookup fails to a neutral unavailable state.
- No migration, checkout integration, billing SDK, hosted setting, or production data change was introduced.

## Phase 3B account onboarding and settings

- `/account/getting-started` offers five optional interests, one optional experience choice, and one optional approach choice. Empty save and explicit skip are both valid; neither changes membership.
- `/account/settings` independently saves display name and discovery preferences, displays linked auth providers from verified identity records, links to membership access, and supports sign-out.
- Normal account entry offers unanswered onboarding once. Explicit account/member deep links are preserved, onboarding is not a middleware gate, and continuation cannot loop back to onboarding.
- Owner-scoped preferences use stable typed IDs, RLS, explicit grants, narrow validated RPCs, server timestamps, and optimistic revision conflicts. Direct table writes are denied.
- Authentication failure, signed-out state, missing preference rows, preference lookup failure, and membership lookup failure remain distinct. Account settings do not depend on a successful entitlement lookup.

## Phase 3C US$1 Starter Pass

- `/` and `/membership` now make “Try IncomeNow for US$1” prominent while keeping the approved Stitch public system and honest limitations. The starter is US$1/USD, one-time, Pergola only, and one project; automatic renewal, lifetime access, duration, taxes, refunds, final resource rights, and live checkout are not claimed.
- Non-Pergola quick previews state that the US$1 starter includes the Pergola kit. Starter users open or continue that kit, and full members are sent to the broader library rather than prompted to repurchase.
- The authenticated catalogue is available to every verified account through a safe metadata projection. Locked details omit paid sections, action plans, resource IDs, and start controls; unknown access remains preview-only.
- Pergola guidance now includes the proposed buyer workflow, discovery questions, demonstration scope, offer/handover guidance, and an explicit readiness checklist. No live demo, source package, download, customer evidence, or commercial result is claimed.
- Project creation remains atomic and idempotent, with one owner/idea project and immutable plan version. Project reads and mutations require ownership plus access to that project’s idea.
- Optional onboarding preserves safe return destinations for registered, starter, and full accounts. Saving or skipping preferences never changes access.
- Additive migration `20260920175336_starter_offer_per_idea_access.sql` was applied to the existing local database without reset. Hosted Supabase was not contacted.

## Verification completed

- Phase 3C application checks: TypeScript and ESLint passed; Vitest/Testing Library passed 62 tests across 19 files.
- Phase 3C database regression: 164 pgTAP assertions passed across four suites; database lint reported no schema errors.
- Phase 3C project-plan sync remained exact at 17 stages and 37 tasks.
- Phase 3C real local integration passed ten disposable-user checks: registered preview/bookmarks, locked-payload minimisation, starter Pergola-only access, concurrent idempotent project start, task/note/pause persistence, cross-user denial, starter-to-full reuse, full-removal preservation, expired/revoked grants, and optional-onboarding deep links. Disposable users were removed by the verifier.
- Phase 3C optimized production build passed. A post-build scan found no protected plan/resource markers in static browser chunks.
- Phase 3C browser checks covered `/` and `/membership` at 1440, 768, 390, and 320 pixels with no horizontal overflow, framework overlay, or browser-console error. The mobile offer stack, navigation disclosure, starter copy, and explicit checkout-disabled copy rendered correctly.
- Payment tests remain intentionally unexecuted because no checkout or payment processor is connected.

- Phase 3B application checks: TypeScript and ESLint passed; Vitest/Testing Library passed 54 tests across 17 files.
- Phase 3B database regression: 116 pgTAP assertions passed across all three suites.
- Phase 3B real local integration: one inactive and one active disposable account passed all nine checks against the local production server—account routes, paid-route separation, empty/skip/selected preference transitions, owner isolation, stale-write conflicts, direct-write denial, self-entitlement denial, independent profile edits, and fresh-session persistence; both accounts were then removed.
- Phase 3B optimized production build passed. Production browser interactions completed onboarding, inactive-account continuation, independent profile/preference saves, auth-method display, membership-access linking, and sign-out availability.
- Phase 3B database lint passed, and project-plan sync remained exact at 17 stages and 37 tasks.
- Phase 3B responsive checks at 1440, 768, 390, and 320 pixels found no horizontal overflow, framework overlay, page error, or browser-console error. Durable screenshots are in `.impeccable/review/phase-3b-*.png`: desktop artifacts are 1440×900; mobile artifacts show the 379×852 IAB content surface from a 390×900 viewport.
- Phase 3B Impeccable finish review: `disposition: ship`, with no findings. The detector ran once and was not rerun.
- Google-only and combined-provider auth-method mapping is covered with synthetic identity records only; a real Google OAuth journey remains launch work.

- Phase 3A application checks: TypeScript and ESLint passed; Vitest/Testing Library passed 42 tests across 13 files.
- Phase 3A database regression: 72 pgTAP assertions passed across the existing Phase 2A and Phase 2B suites.
- Phase 3A production build: passed on Next.js 16.3.5; `/` and `/membership` compile as dynamic server-rendered routes.
- Phase 3A route probes: `/`, `/membership`, `/login`, `/register`, and `/account/access` returned 200; signed-out protected routes retained 307 redirects to the whitelisted login destination.
- Public HTML probes found no preview-route links, protected plan/resource identifiers, or invented free/trial/checkout claims.
- Project-plan regression: the repository and migration definitions remain synchronized at 17 stages and 37 tasks.
- Phase 3A browser verification at 1440, 768, 390, and 320 widths covered both public routes, mobile menu, FAQ, quick preview selection, Escape close, and focus restoration. All eight route/width combinations returned 200 with no horizontal overflow, framework overlay, console error, or page error.

- TypeScript: passed.
- ESLint: passed.
- Vitest/Testing Library: 9 files and 31 tests passed after Phase 2B.
- Local migration reset: passed against project ID `IncomeNow`; local and applied migration version `20260920112114` matched.
- pgTAP: 72 assertions passed across Phase 2A and Phase 2B suites. Phase 2B covers grants, active membership, ownership, atomic creation, pause/edit rules, optimistic note revisions, controlled plan changes, invalid definitions, and anonymous denial.
- Local Auth/browser journeys: two registrations, confirmation emails and handlers, invalid/valid login, browser refresh, Auth token refresh, sign-out, and post-sign-out denial passed.
- Recovery: generic unknown-address feedback, captured reset email, real recovery handler, changed password, old-password rejection, chosen-new-password login, direct-access denial, invalid/expired/replayed-link denial, and verified-context consumption passed.
- Membership/API: no grant, active, disabled, revoked, expired, future-start, and lookup-unavailable states passed. The access API returned the expected 401/403/503/200 outcomes with private/no-store responses.
- Cross-user isolation: own read/update, cross-user filtering, ownership-change denial, entitlement-mutation denial, anonymous denial, and separate browser/session behavior passed.
- Version sync: 17 stages and 37 tasks in repository content match the structural migration identifiers.
- Two-account Phase 2B integration: account isolation, cross-user route and mutation denial, fresh-session bookmark persistence, idempotent project start, child-plan creation, rendered stage progress and next action, full-checklist completion and task reopening, distinct notes in two stages, stale-note rejection, pause locks, direct-write denial, and protected route rendering passed.
- Production build: passed; account, auth-handler, API, saved, projects, workspace, and protected content routes compile as dynamic where required.
- Production probes without preview flag: `/login`, `/register`, and `/account/access` returned 200; `/app/explore` returned 307 to the whitelisted login destination; `/api/member/access` returned 401 without a session; `/preview/explore` returned 404.
- Production probes with preview flag: Explore and a valid detail returned 200; an unknown idea slug returned 404.
- Browser verification at 1440, 768, 390, and 320 widths covered Saved Ideas, My Projects, and Project Workspace with real local data. Optimistic bookmarks, task progress, note save-and-continue, unsaved protection, pause locks, and resume passed with no framework overlay or console error.
- Login submission without configuration renders the expected unavailable state rather than a fake success.
- Direct access to `/reset-password` without a verified recovery cookie redirects to the invalid recovery state.
- Development request logs omit OAuth, confirmation, and recovery callback URLs so short-lived query credentials are not written to the terminal; an explicit redaction probe passed while normal request logging remained enabled.
- Impeccable detector: its two actionable warnings were resolved; the remaining output was existing design-system advisory drift queued for documentation rather than a second detector pass.
- Impeccable finish review: `disposition: ship`; the reviewer confirmed the 768px workspace hero and 390px project-card action hierarchy fixes with no observed regressions.
- Cleanup: the final fresh two-account integration cycle passed, then both disposable accounts and their cascade-owned workspace rows were removed.

## Remaining launch blockers

The public entry, local database, email-account, and access-controlled member workspace are implemented, but the platform is not production-ready. The following remain unexecuted:

- Google provider consent, cancellation, callback failure, and returning-user behavior; no approved development OAuth credentials were present.
- Hosted Supabase migration/configuration and hosted smoke tests.
- External SMTP/inbox delivery and production email-template configuration.
- Production security, domain, and operational readiness review.
- Full-membership price/currency; starter access duration; tax/refund/cancellation terms; payment provider; checkout; and subscription/webhook processing.
- Final resource licence, real downloadable kits, production demos, and an operational publishing/admin workflow.

Exact local Google setup values and credential locations are documented in `docs/auth-setup.md`. Hosted rollout remains a separately approved operator action.

## Visual evidence

The selected Stitch references are recorded in `docs/design-map.md`. Phase 3C homepage and membership captures are in `.impeccable/review/phase-3c-{home,membership}-{1440,768,390,320}.png`; the review directory is intentionally ignored local evidence. Earlier Phase 3A captures remain in `artifacts/screenshots/phase-3a/`, and authentication captures remain in `.impeccable/review/`. Durable public, authentication, saved-idea, project, workspace, starter, and per-idea-access patterns are synchronized in `DESIGN.md` and `.impeccable/design.json`.
