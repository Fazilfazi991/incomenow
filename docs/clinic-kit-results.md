# Clinic Operations CRM kit results

Date: 2026-09-21
Status: implementation and local verification complete; stopped for owner review

## Published catalogue

The canonical idea model now owns publication through a required `published` boolean. Ordinary homepage examples, authenticated Explore results, search/filter counts, saved discovery, bookmark/start admission, and direct member routes all derive from that state.

Published:

- IDEA #001 — Pergola Business Kit
- IDEA #002 — Clinic Operations CRM Kit (`clinic-operations-crm`)

Preserved but unpublished:

- IDEA #003 — Quotation Follow-up Automation
- IDEA #004 — Local-Service Lead Website
- IDEA #005 — Supplier Research Service
- IDEA #034 — Rental Property Management Tool

An unpublished slug returns the application's unavailable/not-found state before paid content or project data is loaded. Existing development-only preview routes retain their production guard.

## Clinic access rule

- Signed out: only public-safe content where the existing public route permits it.
- Registered without paid access: Clinic appears in Explore and can be bookmarked; its detail is a reduced safe preview without full sections, plan data, resources, or a start control.
- Pergola Starter: the same Clinic safe preview; the starter grant continues to unlock only IDEA #001 and its single project.
- Full member: full Clinic kit and one owner-scoped Clinic project through the existing membership, project, and RLS architecture.

No Clinic product, price, checkout, or parallel entitlement system was added.

## Kit experience

The reusable kit hub now accepts an idea-specific activity list instead of assuming seven Pergola activities. Clinic opens one focused activity at a time and supports direct query-string URLs, refresh, Browser Back, Back to kit, compact section navigation, and responsive layouts.

Clinic's ten activities are:

1. Why this opportunity
2. Explore the Clinic CRM
3. Get the software
4. Setup & customise
5. Find clinics
6. Start the conversation
7. Price your offer
8. Tools you'll need
9. Understand the clinic
10. Deliver the project

The content is framed as clinic administration and operations: enquiries, appointments, follow-ups, customer/patient administration, tasks, payment tracking where applicable, communication workflow, and operational reporting. It is not represented as an EHR, EMR, medical-records product, clinical decision system, or certified/compliant healthcare platform.

The pricing activity uses local component state and member-entered assumptions to calculate estimated delivery cost, modelled fees, and projected gross margin. It is labelled **Planning estimate — not a market-price recommendation** and does not persist data or make revenue claims. The discovery activity offers a fourteen-question copy/download questionnaire; IncomeNow does not collect the clinic's answers. A visible **Before using real clinic data** boundary warns against entering sensitive patient information and requires an appropriate technical/legal/security review before production use.

Opening an activity, copying a template/questionnaire, or changing calculator inputs does not create checklist progress.

## Project plan and migration

Clinic plan v1 uses stable structural identifiers, ten stages, and twenty required outcome-focused tasks:

1. Understand the clinic opportunity
2. Explore the CRM
3. Choose a clinic segment
4. Research potential customers
5. Define your service package
6. Prepare the CRM demo
7. Speak with clinics
8. Scope a customer implementation
9. Customise and test
10. Deploy and hand over

Pergola's existing plan was not changed. Clinic projects use the existing atomic, idempotent creation function and remain pinned to their creation plan version.

Additive migration: `supabase/migrations/20260921105604_clinic_plan_v1.sql`

The migration:

- adds `private.workspace_idea_definitions.published boolean not null default false`;
- marks only IDEA #001 and #002 published;
- inserts Clinic plan v1, ten stages, and twenty tasks;
- adds `private.idea_is_published(text)`;
- requires publication before ordinary bookmark insertion; and
- rejects new projects for unpublished ideas while preserving existing rows/history.

It was applied with `supabase migration up --local` to the existing local stack. The database was not reset, Pergola records were not replaced, and hosted Supabase was not contacted.

## Asset and input status

Available and created locally:

- Structured Clinic kit content and safe catalogue preview.
- A modern 1600×1000 illustrative Clinic cover at `public/artwork/ideas/clinic-operations-crm.webp` (123,356 bytes).
- Five editable conversation templates.
- Local-state pricing planner.
- Copy/download discovery questionnaire.
- Clinic project plan v1.

The cover was generated specifically for IncomeNow as a decorative clinic-reception/operations scene with appointment-calendar, profile, follow-up, and dashboard cues. The generation explicitly excluded embedded text/logos, red-cross imagery, certificates, medical procedures, emergency imagery, and watermarks. It is illustrative and is not presented as a real CRM screenshot.

Waiting for the owner to actually supply:

- Clinic CRM demo URL.
- Clinic CRM source ZIP.
- Clinic prospect spreadsheet.
- Approved real CRM screenshots/assets.

Because those inputs were not supplied, the kit says **Clinic CRM demo will be added**, keeps source and setup commands unavailable, teaches a manual research method instead of inventing leads or scraping, and does not assume a hosting/backend stack. No Clinic archive, credentials, raw contacts, or owner data were added to the repository.

## Verification

Completed locally against the additive migration and local Supabase stack:

- `pnpm lint` — passed.
- `pnpm typecheck` — passed.
- `pnpm test` — 114 tests passed across 33 files.
- `pnpm run test:db` — 192 pgTAP assertions passed across five suites.
- `pnpm exec supabase db lint --local --schema public,private --level warning --fail-on error` — no application-schema errors. The unscoped command also inspects pgTAP's third-party `extensions` schema and reports known extension-internal findings, so application lint is intentionally scoped to `public` and `private`.
- `pnpm run test:plan-sync` — 27 stages and 57 tasks matched migrations.
- `pnpm run test:integration:phase3c` — eleven disposable-user checks passed; test users were removed.
- `pnpm run build` — optimized Next.js 16.3.5 production build passed.

The test coverage includes the exact 001/002 publication set; hidden search/direct-route behavior; safe Clinic projections; unavailable resource claims; registered, Pergola Starter, and full-member access; Clinic project admission and ownership; immutable plan creation; calculator arithmetic including empty, zero, decimal, and negative normalization; and the reusable 7/10 activity mapping.

Browser review covered the Clinic hub, focused activities, direct section refresh, Browser Back, compact selector, local calculator updates, questionnaire copy feedback, hidden-idea route, and the two-card Explore catalogue. Layouts were inspected at 1440, 768, 390, and 320 pixels with no horizontal overflow or framework error overlay. Mobile retained all ten activities and usable calculator/questionnaire controls.

Local owner-review route (requires a full-member account):

`http://localhost:3000/app/ideas/clinic-operations-crm`

## Deferred and unchanged

No push, deployment, hosted Supabase mutation, payment activation, admin/analytics work, Google OAuth configuration, domain work, or final commercial-term decision was performed. Pergola remains the only US$1 Starter kit.
