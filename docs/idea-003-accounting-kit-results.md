# IDEA #003 — AI Accounting & Finance Operations Kit results

Date: 2026-09-21
Status: implementation and isolated local verification complete; stopped for owner review

## Stable inputs and evidence boundary

This phase started from the reviewed IncomeNow evidence commit `31f2f554887259c77f92780472d30dbd789131ef` on branch `codex/idea-003-accounting-kit`.

The Accounting application evidence remains pinned to the owner-supplied repository state:

- Repository: `Fazilfazi991/Accountingsoftware`
- Demo branch: `demo/public-accounting-demo`
- Inspected commit: `8653f614f745052be30d96812c2f8a8a9833b9c9`
- Verified example organisation: `Northstar Trading Demo LLC`
- Verified demo model: browser-local, synthetic, resettable data
- Verified checks from the source-review phase: 145 tests across 29 files; TypeScript, build, and lint with zero errors and five warnings passed
- Recorded limitation: the public-demo build has no login, Supabase product mode, or live AI; demo AI/API requests fail closed with HTTP 503
- Recorded advisory: one high-severity development-only ESLint-chain advisory remained in the source review

IncomeNow does not turn the local URL into a public demo claim. It does not distribute the source or assert that the inspected archive/repository is licensed for member redistribution. Production Auth/RLS, migrations, live posting, banking, AI-provider output, backups, recovery, integrations, accounting/tax correctness, and customer acceptance remain unverified unless stated separately.

## Publication and access

IDEA #003 is now the published **AI Accounting & Finance Operations Kit** at `ai-accounting-finance-operations`.

- Signed-out visitors receive only the existing public-safe catalogue behavior.
- Registered accounts and Pergola Starter accounts can discover and save the safe Accounting preview.
- Full kit content, the setup-guide route, and Accounting project creation require a fresh server-side full-membership decision.
- A Pergola-only starter grant never unlocks IDEA #003.
- The source remains unavailable for every account type because redistribution approval is not confirmed.
- Unknown or unavailable access fails closed and is not rendered as successful membership.

The public and locked projections omit full sections, plan definitions, resource targets, source locations, and protected guide content. A production bundle scan found no source commit, setup/delivery text, sales-template marker, QA identity, or fixture password in `.next/static`.

## Member kit

The full-member route uses the established reusable kit shell and contains twelve focused activities:

1. Why this opportunity
2. Explore the accounting software
3. Get the software
4. Setup & customise
5. Understand the accounting workflow
6. Optional AI-assisted workflow
7. Find potential customers
8. Start the conversation
9. Price the service
10. Choose a package
11. Deliver safely
12. Start your project

The demo activity describes only inspected synthetic modules and separates implementation found, demo observation, source/test evidence, and runtime limits. The software activity records the inspected source commit and capability scope without exposing a download. The setup activity provides a protected Markdown guide, verified commands only where supported by inspected files, safe prompts, and clear not-yet-tested labels.

Optional AI is disabled by default. The kit distinguishes an implemented UI/API surface from the demo's fail-closed 503 behavior, unconfigured provider/runtime requirements, and untested output. It requires customer-owned provider decisions, minimised data, human review, a safe off switch, and professional review; it makes no accounting, tax, legal, financial, audit, compliance, savings, revenue, or accuracy claim.

Five editable sales templates cover email, discovery call, follow-up, demo, and proposal. Edits stay in the browser view and copying sends nothing. Prospect guidance is a research method only; no prospect list, buyer, contact, demand, ranking, or sales result is invented.

The pricing planner uses only member-entered assumptions. It separates recurring technical costs, delivery hours/internal cost, modelled fees, projected gross margin, and gross-margin percentage. It has no default currency, fixed market price, forecast, or earnings promise.

## Protected guide and unavailable inputs

`/app/resources/accounting-setup-guide` repeats the fresh full-membership check and returns a private/no-store Markdown attachment only to an active full member. Signed-out, registered-only, starter-only, inactive, and unavailable access do not receive the guide.

Still unavailable:

- a visitor-safe public Accounting demo URL;
- member redistribution permission and a sanitised source package;
- an Accounting prospect sheet;
- production deployment/configuration evidence;
- live Auth/RLS, storage, posting, integrations, backup/restore, AI-provider, and accounting/tax acceptance evidence.

These are content, permission, or launch dependencies rather than fabricated kit resources.

## Versioned project plan and migration

The historical IDEA #003 plan version 1 remains in repository content. New Accounting projects pin immutable plan version 2 with twelve stages and twenty-four required tasks:

1. Confirm the customer and operating problem
2. Review the inspected software evidence
3. Map the current finance workflow
4. Define roles, controls, and professional review
5. Scope software and customer-owned services
6. Decide whether optional AI is permitted
7. Research and qualify potential customers
8. Prepare a synthetic-data demonstration
9. Agree the implementation and commercial scope
10. Configure, migrate, and test safely
11. Train, deploy, and hand over
12. Record acceptance and ongoing ownership

Additive migration: `supabase/migrations/20260921160723_accounting_kit_plan_v2.sql`

The migration publishes IDEA #003, preserves version 1 as non-current, and inserts version 2 with stable stage/task identifiers. It was applied only to a disposable Supabase project on non-default ports for this verification. It was not applied to the owner's shared local database or any hosted project.

## Verification actually performed

- The host's intercepted `pnpm run` command performed its own dependency-install preflight and exited before the requested script because `unrs-resolver` build scripts were not approved. No build-script approval, dependency declaration, manifest, or lockfile change was made. The exact repository targets below were therefore executed from the already installed local binaries, and the result is reported as such rather than as a successful `pnpm run` wrapper invocation.
- `tsc --noEmit` — passed.
- `eslint .` — passed.
- `vitest run` — passed: 135 tests across 38 files.
- `next build` — passed on Next.js 16.3.5, including the protected Accounting guide route.
- Plan-definition sync — passed: 39 stages and 81 tasks across all repository plans matched migration tuples.
- Isolated pgTAP regression — passed: 217 assertions across six suites.
- Isolated database lint — passed with no errors in `extensions`, `private`, or `public`.
- Accounting pgTAP coverage verified safe-preview bookmarking for registered/Starter accounts, project denial without full membership, idempotent full-member start, version 2 pinning, 12 stages/24 tasks/12 notes, task and note persistence, pause/resume rules, and cross-user read/mutation denial.
- Protected guide browser/API check — active full member received status 200, `text/markdown`, an attachment filename, and `private, no-store`; a signed-out request received no guide and redirected to login.
- Browser QA — production pages were checked at 1440, 1024, 768, 390, and 320 pixels. Each viewport reported document width equal to viewport width. The five editable tabs retained an unsaved draft while switching, and the planner produced 10 delivery hours, 600 modelled cost, 1,000 modelled fees, and 400 / 40% gross margin from the entered synthetic assumptions.
- Project browser flow — a disposable isolated full member saw all 12 plan stages, created the Accounting project through the real server action, and opened the resulting owner-scoped checklist at 390 pixels.
- Static-browser-chunk scan — no inspected source commit, protected guide/delivery phrase, sales-template marker, or disposable credential was found in `.next/static`.

Screenshots:

- `artifacts/idea-003-accounting-kit/accounting-kit-1440.png`
- `artifacts/idea-003-accounting-kit/accounting-kit-1024.png`
- `artifacts/idea-003-accounting-kit/accounting-kit-768.png`
- `artifacts/idea-003-accounting-kit/accounting-kit-390.png`
- `artifacts/idea-003-accounting-kit/accounting-kit-320.png`
- `artifacts/idea-003-accounting-kit/accounting-conversation-390.png`
- `artifacts/idea-003-accounting-kit/accounting-pricing-390.png`
- `artifacts/idea-003-accounting-kit/accounting-project-390.png`

The disposable Supabase project was stopped and its data volumes were removed after testing. The owner's shared local account, starter grant, projects, notes, and database were not changed.

## Merge and conflict manifest

High-overlap files that should be reviewed carefully if later work changed the same areas:

- `src/content/ideas.ts` — replaces the previous IDEA #003 draft with the published Accounting content.
- `src/content/project-plan-data.json` — preserves Accounting version 1 and adds current version 2.
- `src/lib/kit-sections.ts` — adds Accounting-specific activity metadata and new reusable section slugs.
- `src/components/interactive-idea-kit.tsx` — adds Accounting hub status/icon dispatch and twelve-stage copy.
- `src/app/globals.css` — adds scoped Accounting ledger, evidence, workflow, package, and responsive styles.
- `PRODUCT.md` and `docs/build-status.md` — update current catalogue/access/readiness documentation.
- `scripts/verify-phase-2a-local.mjs` and `scripts/verify-phase-3c-local.mjs` — update IDEA #003 slug/title expectations used by historical integration verifiers.
- `supabase/tests/phase_4b_clinic_kit_test.sql` — moves hidden-idea checks to IDEA #004 because IDEA #003 is now published.

New isolated files are the Accounting readiness content, kit section, pricing component/calculator and tests, protected guide route/tests, version 2 migration, Accounting pgTAP suite, screenshots, and this result document.

Merge requirement: apply the migration once in the intended target only after reviewing the target's migration history and pausing concurrent database writers. Do not recreate or reset the shared database merely to merge this phase.

## Stop point

Release hardening moved the Accounting readiness/evidence/guide payload out of tracked TypeScript and into the ignored 12,928-byte `setup-guide-v1.json` artifact pinned by SHA-256 `7E3890D6C8F7CDC897FB723DB5487F090538A2EB3181BCEC21E2B520BABF9470`. Active full membership is checked before the artifact is read; missing or mismatched provisioning returns an unavailable state and no guide payload.

No push, merge, deployment, hosted-service mutation, checkout/payment work, Accounting source publication, public-demo deployment, or external customer contact was performed. The phase is ready for owner and independent review, not production launch.
