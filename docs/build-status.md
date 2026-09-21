# Build status

## Phase and stack

The Clinic publication phase is code-complete and locally verified in the workspace. The live catalogue now contains IDEA #001 Pergola Business Kit and IDEA #002 Clinic Operations CRM Kit, building on Phase 4A Pergola readiness, Phase 3C per-idea access, the kit-first refinements, Phase 3B onboarding/settings, Phase 3A public entry, Phase 2B account-synced workspace, and Phase 2A.1 authentication. The app uses Next.js 16 App Router, React 19, TypeScript, Supabase SSR/Auth, PostgreSQL RLS migrations, Zod, Tailwind CSS 4, Vitest/Testing Library, and pgTAP database tests.

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
- Updates, support, checkout/payment, admin, analytics, and unconnected catalogue resources remain out of scope. The owner-supplied Pergola source archive, inspected setup guide, and cleaned prospect export are protected member downloads; the separately hosted synthetic-data Pergola demo remains the external example. Account-synced bookmarks and the project workspace remain separate from preview storage.

## Phase 2B workspace

- Account bookmarks use owner-scoped rows and server timestamps; duplicate saves are idempotent at the action boundary and never reset `saved_at`.
- `/app/saved` provides real account state, filters, optimistic save/remove feedback, rollback, and Undo without touching preview local storage.
- Projects are created atomically through a narrow authenticated function and pinned to an immutable structural plan version.
- `/app/projects` derives Active, Paused, and Complete state from persisted rows, reports completed-stage progress, identifies the current focus and next incomplete action, and links back to the original idea.
- `/app/projects/[projectId]` provides versioned stage navigation, completed-stage overall progress, required-task progress within each stage, a clear distinction between selected stage and derived current focus, pause/resume, one revisioned plain-text note per stage, unsaved-navigation decisions, and repository-backed stage resources.
- Removing full membership hides projects that no longer have relevant idea access without deleting them. An independent starter grant keeps the canonical Pergola project visible and editable; restoring full membership reveals the same other rows.

## Phase 3A public entry

- `/` is a public homepage with the approved hero, four-step explanation, the two currently published real kits, public quick previews, capability explanation, membership introduction, FAQ, and real account-entry links.
- `/membership` presents one monthly IncomeNow membership with `Price to be confirmed`, explicit checkout unavailability, implemented inclusions, separate member responsibilities, a four-step future access journey, licence caution, and FAQ.
- A shared public header/footer remains distinct from authentication and protected-member shells. The mobile header uses a disclosure menu instead of member navigation.
- The public example client receives a reduced `PublicIdea` projection derived from each canonical idea's publication state. Full idea objects, plan stages/tasks, resource IDs/locations, bookmarks, and notes remain outside the client payload.
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
- Public offer headings and supporting copy are account-aware: starter accounts receive an open/continue message, full members receive a full-library message, and neither is prompted to buy redundant starter access.
- Non-Pergola quick previews state that the US$1 starter includes the Pergola kit. Starter users open or continue that kit, and full members are sent to the broader library rather than prompted to repurchase.
- The authenticated catalogue is available to every verified account through a safe metadata projection. Locked details omit paid sections, action plans, resource IDs, and start controls; unknown access remains preview-only.
- Pergola guidance now includes the proposed buyer workflow, discovery questions, demonstration scope, offer/handover guidance, and an explicit readiness checklist. No live demo, source package, download, customer evidence, or commercial result is claimed.
- Project creation remains atomic and idempotent, with one owner/idea project and immutable plan version. Project reads and mutations require ownership plus access to that project’s idea.
- Optional onboarding preserves safe return destinations for registered, starter, and full accounts. Saving or skipping preferences never changes access.
- Additive migration `20260920175336_starter_offer_per_idea_access.sql` was applied to the existing local database without reset. Hosted Supabase was not contacted.

## Pergola kit-first owner refinement

- The unlocked Pergola route now presents “Pergola Business Kit” as the primary member experience. Catalogue, saved, and project cards lead with **Open kit**; **My checklist** is secondary and project creation remains explicit.
- The first viewport exposes the verified public demo URL and the owner-supplied source archive through a private/no-store authenticated route. The customer activity now exposes a separately protected, cleaned member research export.
- Kit sections follow the requested opportunity → demo → software → setup → customers → sales kit → delivery order using validated structured content. Public and locked projections still omit sections, resource IDs, external URLs, and the protected download path.
- The workspace retains the existing project, task, note, pause, version, and ownership records while displaying plain-language step/task copy. It uses one current-step heading, a compact **Your steps** disclosure, secondary progress/pause controls, collapsed notes that preserve drafts, and a prominent **Back to kit** action.
- No migration or database mutation was required. Hosted Supabase, payments, deployment, domain work, Google verification, and final commercial terms remain untouched.

## Pergola interactive-kit refinement

- The unlocked Pergola URL now defaults to a compact activity hub instead of rendering seven complete sections in one document. Its seven cards open validated `?section=` views with direct links, refresh safety, Browser Back, Back to kit, a native activity selector, and redirects for the former `#section-*` anchors.
- Demo and protected-source actions remain directly available from the hub. Focused views use existing protected content and permissions: opportunity model, inspected demo modules, offline/UAT source boundary, verified customisation steps, inspected setup guidance, a protected prospect explorer/export, five editable sales templates with copy confirmation, a delivery handover guide, and the existing personal checklist.
- Checklist continuation appears only when persisted tasks or notes provide meaningful progress. Kit visits, demo opens, ZIP downloads, and template copies never create progress. Existing six-stage progress, ownership, plan version, pause state, tasks, and notes remain unchanged.
- Shared motion now covers press feedback, card hover/selection, one-time section entry, native disclosures, clipboard confirmation, task-save feedback, and reduced-motion suppression. No animation package or persistence was added.
- No migration, database reset, hosted change, payment activation, push, or deployment was performed.

## Modern digital art direction and motion pass

- The rejected warm/printed-kit **Tangible Fieldwork** direction is retired for new public work. The first owner-review slice is intentionally limited to the homepage hero, interactive How it works explanation, and public covers for Pergola, Quotation Follow-up Automation, and Local-Service Lead Website.
- The hero now pairs the fixed headline “Find an idea. Build your version.” and exact owner-approved supporting copy with a seamless 7.2-second derivative of the supplied 8-second 1280×720 motion graphic. It autoplays muted and inline, loops continuously, pauses below 35% visibility or when the tab is hidden, prefers a 599 KB VP9 WebM with a 1.19 MB H.264 MP4 fallback, and uses a 1280×720 closing-frame WebP poster when reduced motion is requested or playback fails.
- How it works now uses one selectable Discover → Explore the kit → Adapt your version → Prepare your offer explanation. Selection is expressed with text, border, check icon, `aria-selected`, and a shared tab panel; it does not update real project progress.
- Three original local 16:10 covers use a cool-neutral 3D family with emerald/cyan/blue/violet accents. A scoped `publicCoverArt` field keeps these owner-review assets on public examples and the homepage starter preview without changing current member catalogue artwork.
- Unknown account state keeps neutral marketing headings and public examples. The existing compact header account check is the sole account-error action; repeated homepage bands use neutral public destinations instead.
- The clean signed-out Supabase correction remains: only the official `AuthSessionMissingError` is treated as signed out; genuine auth, token, configuration, and data failures remain fail-closed as unavailable.
- No migration, database reset, shared database mutation, hosted change, payment activation, push, deployment, or release-blocked archive change was performed.

## Phase 4A Pergola commercial readiness

- The supplied prospect workbook was inspected as one 191-record research sheet and normalised into a private structured artifact. Eligibility is deterministic: HIGH or MEDIUM research priority, at least one primary contact route, no prior contacted/failed outreach state, and first occurrence by normalised company/domain key. The resulting member dataset contains 77 records—51 HIGH and 26 MEDIUM—with 34 published primary emails, 76 published primary phones, and 69 recorded quote forms.
- The member customer activity now supports company/domain search plus state, city, category, research-priority, and contact-availability filters. Results retain source links, checked dates, explicit missing-contact/quote-form states, copy-success feedback, and a protected UTF-8 CSV export. Internal IDs, enrichment columns, lead scores, search queries, notes, owner/next-action fields, secondary contacts, and outreach status are excluded.
- The Universal Pergola source package was inspected in an isolated temporary folder. Its stack is Next.js 16.3.5, React 19.3, TypeScript 5.9, Tailwind CSS 4.3, Supabase SSR/JS, PostgreSQL/RLS/Auth/Storage, Zod, pdf-lib, and npm lockfile workflows. The package exposes CRM modules for categories/products, enquiries, customers, site visits, quotations, projects, payments, tasks, feedback, reports, and PDF documents. Messaging and payment gateways are not implemented.
- Isolated package validation passed `npm ci --ignore-scripts` with zero reported vulnerabilities and `npm run check` with 47 tests, type generation/type checking, lint, and production build. No package database, hosted service, migration, seed, or deployment command was run; live Auth/Storage/CRUD behavior remains unverified.
- Software, setup, sales, and delivery activities now distinguish included, locally verified, and not-yet-verified capabilities. The setup activity contains twelve labelled steps and three safe Codex prompts; the sales activity contains five editable templates; delivery contains a twelve-point customer handover guide.
- Prospect CSV and setup Markdown routes repeat the existing fresh server-side IDEA #001 access decision, return private/no-store attachments, and fail closed. Signed-out/registered-preview, starter, full-member, revoked, and unavailable behavior continues to use the Phase 3C access model; no migration was required.
- With owner approval, the original ZIP-containing commit was amended. `private-resources/pergola/universalpergola-main.zip` remains local with SHA-256 `5E4DC492F2BD05869AE7FB77A4C83F66908F96FB6CD6329C4BDA1B36970345B5`, is ignored by a narrow path rule, and is absent from reachable local `main` history. Nothing was pushed or deployed.
- Full implementation and evidence details are recorded in `docs/phase-4a-pergola-kit-readiness.md`.

## Clinic Operations CRM publication

- IDEA #002 is now the published **Clinic Operations CRM Kit**, positioned strictly as administrative operations software for independent clinics and small clinic groups. It does not claim EHR/EMR functionality, healthcare certification, regulatory compliance, market demand, customer outcomes, or earnings.
- Canonical `published` state now drives ordinary homepage examples, the authenticated catalogue, search/filter counts, saved discovery, bookmark/start validation, and direct member routes. Only IDEA #001 and #002 are published; unfinished IDEA #003, #004, #005, and #034 content is preserved but unavailable through ordinary catalogue and direct-member flows.
- Registered and Pergola Starter accounts can view and save the Clinic safe preview. Clinic full content and project creation require fresh full-membership authorization. The US$1 offer continues to unlock only the Pergola kit and its one project.
- The reusable interactive kit supports per-idea activity counts. Clinic has ten focused activities covering opportunity, CRM exploration, software, setup, research, conversation, pricing, tools, discovery, and delivery; direct section URLs, refresh, Browser Back, Back to kit, compact navigation, and mobile layouts reuse the established kit grammar.
- The Clinic price planner is local component state, calculates delivery cost and projected gross margin only from member assumptions, and is labelled as a planning estimate rather than an earnings or market-price recommendation. The discovery questionnaire is copyable/downloadable and is not stored centrally.
- Clinic plan v1 adds ten immutable stages and twenty required tasks without changing Pergola's plan. Additive migration `20260921105604_clinic_plan_v1.sql` adds database publication state, publishes only 001/002, inserts the Clinic plan, and makes bookmark/project admission reject unpublished ideas. It was applied to the existing local database without reset; hosted Supabase was not contacted.
- Available inputs are the authored Clinic kit content, generated illustrative cover, calculator, questionnaire, templates, and project plan. No Clinic demo URL, source ZIP, prospect spreadsheet, or approved CRM screenshots were actually supplied, so the relevant resources remain explicitly unavailable and no software commands or infrastructure assumptions are presented as verified.
- The detailed implementation, access, migration, asset, limitation, and verification record is in `docs/clinic-kit-results.md`.

## Verification completed

- Clinic publication application checks passed: TypeScript, ESLint, the optimized Next.js production build, and 114 Vitest/Testing Library tests across 33 files.
- Database regression passed 192 pgTAP assertions across five suites without a reset; linting the local `public` and `private` application schemas reported no errors. Project-plan sync matched 27 stages and 57 tasks.
- The refreshed Phase 3C disposable-user integration passed eleven checks, including Clinic safe previews for registered/Starter accounts, full Clinic access, hidden-idea denial, starter-only Pergola authorization, project ownership/reuse, grant removal, and optional onboarding. Its disposable accounts were removed.
- Browser checks covered the Clinic hub, price planner, discovery questionnaire, hidden direct route, and the two-card Explore catalogue at 1440, 768, 390, and 320 pixels. There was no horizontal overflow or framework overlay; all ten activity cards and responsive calculator controls remained usable.

- Phase 4A application checks passed: TypeScript, ESLint, the optimized Next.js build, and 107 Vitest/Testing Library tests across 32 files.
- Phase 4A database regression passed all 164 pgTAP assertions across four suites without a reset; database schema/migrations were unchanged.
- The refreshed Phase 3C disposable-user integration passed eleven checks, including locked payload minimisation, protected prospect/setup downloads, starter-only authorization, revocation, full-membership behavior, owner isolation, project reuse, and optional onboarding. Disposable accounts were removed.
- Browser verification covered the protected customer, setup, and sales activities at 1440, 768, 390, and 320 pixels. Search, state filtering, copy feedback, protected-resource presentation, mobile navigation, and zero horizontal overflow passed; there was no framework error overlay. Captures are in `artifacts/phase-4a/`.
- The source workbook SHA-256 is `39E2FBD76E3E5BA2E368040531832629A89C759A14EF77EFCF85BB428DF73A3F`; the cleaned JSON artifact SHA-256 is `A0DD71787EE3E21E5600FCB1BF7D8849D6C846119D027D16ECC2DB90C9C40443`; the deterministic member CSV SHA-256 is `6B70264AE7433D0369C5E7E7C40A93897974F7DEEF6967FE3C62E4AF2C6E78AA`.

- Visual-pass application checks: TypeScript, ESLint, 90 Vitest/Testing Library tests across 27 files, and the optimized Next.js build passed.
- Visual-pass browser review covered 1440, 768, 390, and 320 pixels across the public home, membership, preview Explore, quick-preview dialog, mobile menu, authenticated Explore, Saved, and Projects surfaces. Reviewed routes had no horizontal overflow, framework overlay, or broken artwork.
- Visual-pass captures are in `.impeccable/review/visual-pass-*.png`; the durable contact sheet is `artifacts/visual-pass/artwork-contact-sheet.png`.
- The Impeccable detector ran once after this UI was stable and returned advisory design-token inventory only. This is not owner approval.
- Interactive-kit application checks: TypeScript, ESLint, and the optimized Next.js build passed; Vitest/Testing Library passed 87 tests across 26 files.
- Interactive-kit browser review covered 1440, 768, 390, and 320 pixels; hub/section/Back, direct refresh, legacy-anchor full-load redirect, compact selector, editable sales copy, starter/locked behavior, and existing checklist reads passed with no horizontal overflow, framework overlay, or browser-console warning/error.
- Interactive-kit review captures are in `.impeccable/review/interactive-kit-{hub-desktop,hub-mobile,sales-mobile}.png`. The available browser-control surface did not expose local recording, so no interaction video was produced.
- The Impeccable detector ran once after the interactive UI was complete and returned advisory design-token inventory across the existing shared stylesheet. This is not owner approval.
- Pergola kit-first application checks: TypeScript, ESLint, and the optimized Next.js build passed; Vitest/Testing Library passed 80 tests across 24 files.
- The protected ZIP route is covered for a denied entitlement and a successful fresh account/idea-access decision. The public and authenticated catalogue projection tests confirm the download path is absent from safe payloads.
- Authenticated browser review covered the kit at desktop, 390, and 320 pixels plus the simplified checklist. There was no horizontal overflow or framework overlay; the mobile section navigation was static, demo/download actions were visible early, the checklist omitted “Plan v1,” and collapsed notes preserved then discarded an unsaved test draft without a database write.
- The Impeccable detector ran once after UI completion and reported 0 anti-patterns. Its advisory-only design-token inventory reflects existing stylesheet-wide documentation drift.
- The owner-supplied ZIP contains 333 archive entries and no real `.env`, dependency tree, private-key pattern, service-role key pattern, password pattern, or file over 2 MB. SHA-256: `5E4DC492F2BD05869AE7FB77A4C83F66908F96FB6CD6329C4BDA1B36970345B5`.
- Phase 3C post-review application checks: TypeScript, the exact repository ESLint command, and the optimized build passed; Vitest/Testing Library passed 70 tests across 21 files. ESLint narrowly excludes ignored `.impeccable/review/**` browser artifacts while continuing to scan application source.
- Phase 3C database regression: 164 pgTAP assertions passed across four suites; database lint reported no schema errors.
- Phase 3C project-plan sync remained exact at 17 stages and 37 tasks.
- Phase 3C real local integration passed ten disposable-user checks: registered preview/bookmarks, locked-payload minimisation, starter Pergola-only access, concurrent idempotent project start, task/note/pause persistence, cross-user denial, starter-to-full reuse, full-removal preservation, expired/revoked grants, and optional-onboarding deep links. Disposable users were removed by the verifier.
- Phase 3C optimized production build passed. A post-build scan found no protected plan/resource markers in static browser chunks.
- Phase 3C browser checks covered `/` and `/membership` at 1440, 768, 390, and 320 pixels with no horizontal overflow, framework overlay, or browser-console error. The mobile offer stack, navigation disclosure, starter copy, and explicit checkout-disabled copy rendered correctly.
- The post-review Pergola detail regression passed at 320×900: root scroll width remained within the viewport, and the section navigation retained contained internal horizontal scrolling.
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
- Final resource/source-data licence and redistribution approval; production readiness for the supplied source and external demo; real customer acceptance, backup/recovery rehearsal, messaging/payment integrations if later required; and an operational publishing/admin workflow.

Exact local Google setup values and credential locations are documented in `docs/auth-setup.md`. Hosted rollout remains a separately approved operator action.

## Visual evidence

The selected Stitch references are recorded in `docs/design-map.md`. Phase 4A protected-kit captures are in `artifacts/phase-4a/`. Phase 3C homepage and membership captures are in `.impeccable/review/phase-3c-{home,membership}-{1440,768,390,320}.png`; the review directory is intentionally ignored local evidence. Earlier Phase 3A captures remain in `artifacts/screenshots/phase-3a/`, and authentication captures remain in `.impeccable/review/`. Durable public, authentication, saved-idea, project, workspace, starter, and per-idea-access patterns are synchronized in `DESIGN.md` and `.impeccable/design.json`.
