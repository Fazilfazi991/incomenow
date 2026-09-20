# Phase 3C results — US$1 Starter Pass

## Baseline and coordination

- Work started from local `main` at `82644aa` (`feat: add optional onboarding and account settings`) with a clean tree.
- The completed Phase 3B migration `20260920160524_phase_3b_account_preferences.sql`, onboarding/settings routes, owner restrictions, revision handling, and preference RPCs were preserved.
- The first-agent task was confirmed idle before this working folder and local database were changed.
- The Phase 3C result is the reviewed local commit containing this report (`feat: add US$1 starter access`); the final handoff records its exact hash.
- Nothing was pushed, deployed, merged, or connected to a hosted service.

## Resulting access model

| Account capability | Safe catalogue and bookmarks | Full idea content | Projects |
| --- | --- | --- | --- |
| Registered, no purchase | Yes | No | No creation or access without a relevant grant |
| Starter Pass | Yes | Canonical Pergola idea only | One idempotent account-owned Pergola project |
| Full membership | Yes | Every included published idea | One account-owned project per included idea |
| Unknown access lookup | Safe preview only | Denied closed | Denied closed |

Authentication, optional onboarding, full membership, per-idea grants, and payment are separate. Signup, email verification, onboarding completion/skip, browser state, and `?offer=starter` never create a grant. A starter account is not represented as a full monthly member.

## Implementation

- Added typed starter and full-membership offers. The starter is `starter-pergola-v1`, US$1/USD, one-time, IDEA #001, and one project. Access duration, taxes, refunds, final resource rights, and checkout remain explicitly unconfigured.
- Opened `/app/explore` and account bookmarks to verified accounts through a safe catalogue DTO. Locked details contain metadata, intended customer, technical requirements, market-evidence state, problem statement, and resource type labels only.
- Full idea records are returned only after a fresh server-side decision for the requested idea. The application independently rechecks project creation and mutations, while PostgreSQL functions and RLS enforce ownership plus relevant idea access.
- Preserved one owner/idea project, immutable plan versions, atomic/idempotent creation, pause locks, revisioned notes, and stored rows across entitlement changes.
- Preserved optional onboarding and validated return destinations. Registered accounts continue to the preview catalogue; authorised starter/full deep links continue to their intended idea or project.
- Updated the homepage, membership page, public quick previews, catalogue cards, account-access page, member shell, and API status to distinguish registered, starter, full, and unavailable states.
- Removed the complete idea dataset from the historical preview bookmark client dependency. A production-bundle scan now confirms protected plan/resource markers are absent from static browser chunks.
- Expanded IDEA #001 with a proposed contractor workflow, eight discovery questions, demonstration boundaries, scoped-offer/handover guidance, and a readiness checklist. The copy does not claim customers, demand, a working CRM, downloads, or a tested source package.

## Database migration

Applied locally, without a reset:

- `20260920175336_starter_offer_per_idea_access.sql`

The migration adds `public.idea_access_grants`, constrained to the current starter offer and canonical idea, with account ownership, active windows, revocation state, source metadata, RLS, minimal grants, an access index, and the existing timestamp trigger. Ordinary users can select their non-privileged grant fields but cannot insert, update, or delete grants.

Security-definer functions use a pinned search path and implement idea access, project access, and access requirements. Bookmark policies now permit verified owner-scoped use without paid access. Project, stage, task, and note policies/functions require ownership plus full or matching idea access.

The migration was applied with `supabase migration up --local`. The shared local database was not reset, and no hosted Supabase project was linked or changed.

## Verification

- `pnpm run typecheck`: passed.
- `pnpm run lint`: passed.
- `pnpm test`: 62 tests passed across 19 files.
- `pnpm run test:db`: 164 assertions passed across four pgTAP suites.
- `pnpm exec supabase db lint --local --level error`: passed with no schema errors.
- `pnpm run test:plan-sync`: passed at 17 stages and 37 tasks.
- `pnpm run build`: passed on Next.js 16.3.5.
- Static browser-chunk scan: protected plan/resource markers absent.
- `pnpm run test:integration:phase3c`: passed all ten checks against the built local app and local Supabase.

The disposable integration run covered registered browsing/bookmarks, safe locked payloads, Pergola-only starter access, denial of other project creation, concurrent project start, task/note/pause persistence, cross-user denial, upgrade reuse, removal of full access without starter-project loss, expired/revoked grants, and optional-onboarding deep links. The verifier removes its temporary users in `finally` cleanup.

Payment tests were not run because checkout and a payment processor are deliberately not connected.

## Responsive review and screenshots

The homepage and membership page were checked in a Chromium production session at 1440, 768, 390, and 320 pixels. All eight route/width combinations had no horizontal overflow or framework error overlay. Browser logs contained no warnings or errors. Mobile navigation, stacked offers, US$1 copy, and the explicit checkout-disabled notice remained readable. Two touch targets found during the pass—the mobile menu disclosure and membership breadcrumb—were raised to a 44px minimum.

Local review captures are stored under `.impeccable/review/` as:

- `phase-3c-home-{1440,768,390,320}.png`
- `phase-3c-membership-{1440,768,390,320}.png`

These captures are local review artifacts and are not deployment assets.

## Starter-kit readiness

The current kit is ready for access-control and workspace testing, not for accepting money. Before commercial launch it still needs:

- real buyer interviews, workflow observations, demand evidence, and willingness-to-pay evidence;
- a working, tested CRM demonstration using fictional or authorised data;
- tested role permissions, validation, audit logging, backups, restore procedures, and error handling;
- verified authorised integrations, limits, duplicate prevention, and delivery-failure handling;
- approved duration, taxes, refunds, support scope, hosting/data responsibilities, and resource licence;
- final downloadable materials, acceptance tests, administrator guidance, credential transfer, support/incident ownership, change control, and exit/export guidance.

## Deferred launch work

- Hosted Supabase migration and smoke testing.
- Domain configuration, final branding/logo, Google provider verification, and external SMTP.
- Real checkout, payment processing, webhook fulfilment, tax/refund/cancellation handling, and final full-membership terms.
- Final resource packages, production demos, licence approval, security/operational review, analytics, and operational admin.

No live entitlement was seeded for new registrations, and no real payment path was enabled.
