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

The pricing activity uses local component state and member-entered assumptions to separate one-time delivery labour, one entered period of recurring technical costs, modelled fees, and projected gross margin. It is labelled **Planning estimate — not a market-price recommendation** and does not persist data or make revenue claims. The discovery activity offers a fourteen-question copy/download questionnaire; IncomeNow does not collect the clinic's answers. A visible **SENSITIVE INFORMATION** boundary says **Discuss workflows and requirements. Do not enter real patient data into IncomeNow.** and requires an appropriate technical/legal/security review before production use.

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

## Real demo and source integration

The owner supplied the exact public demo and source archive.

- Demo: `https://besmile-public-demo.vercel.app/admin`
- Page title: `BSmile CRM`
- Authentication: none for the public demo.
- Banner: `Fusion Ventures Demo` and `Synthetic data • Changes reset when the page reloads`.
- Observed areas: dashboard, leads, fictional client records and detail, appointment scheduling, tasks, invoices/finance, reports, employees, attendance/leave, documents, communication, roles and access.
- Mutating actions were not used. Reset/persistence, export, report generation, messaging, payment, and production operation were not tested.

The recommended read-only demo path is Dashboard → Leads Management → fictional Clients → Appointment & Scheduling → Tasks → Invoices / Reports. Follow-ups remain labelled navigation-only because the inspected admin route repeated the lead-table structure rather than proving a distinct workflow.

Archive evidence:

- File: `besmile-production-readiness.zip`
- Size: 14,202,553 bytes.
- Entries: 920.
- SHA-256: `7958426B74F454EE0A346FBB18D968ED56A3063AC6B2E3BD7D1302070D731662`.
- Stack: Next.js 15, React 19, TypeScript, pnpm 11.19.0, Supabase PostgreSQL/Auth/RLS/private Storage, and Vercel-oriented deployment.
- Optional integrations found: web push and Google Sheets customer-feedback import.
- No completed SMS provider or email-OTP second factor was found.

The archive is **not published**. It contains personal staff/org-chart imagery, an internal local workbook path, QA/project references, and source capability for patient identity, care plans, clinical/treatment notes, prescriptions, medical reports, assessment reports, insurance documents, and private uploads. Malware scanning is not enabled. Redistribution approval was not supplied. The source ZIP remains outside the repository and `public/`; no source-download route exists.

The member kit now provides:

- The verified external demo action and an evidence table that separates observation from interaction testing.
- A source-scope matrix that separates demo observation, source inspection, and local status.
- A fourteen-step inspected setup guide with **VERIFIED**, **OPTIONAL**, and **NOT YET VERIFIED** labels.
- A protected, private/no-store Clinic setup-guide download for fresh active Clinic/full-member access.
- Stack-specific tools, cost categories, sales-demo structure, discovery boundaries, and delivery checks.

No Clinic prospect workbook was supplied. The prospect finder and protected CSV remain unavailable, and the Pergola workbook was not reused.

Detailed static inspection, health-data findings, local package checks, and remaining production questions are recorded in `docs/clinic-source-inspection.md`.

## Verification

The original Clinic publication was completed locally against the additive migration and local Supabase stack. This real-asset phase adds no migration and does not change the database schema or data.

Current application verification:

- `pnpm run typecheck` — passed.
- `pnpm run lint` — passed.
- `pnpm test` — passed: 121 tests across 35 files.
- `pnpm run build` — passed, including the protected Clinic setup-guide route.
- Database regression — passed: 192 pgTAP assertions across five suites without a reset; linting the local `public` and `private` schemas reported no errors.
- Project-plan sync — passed: 27 stages and 57 tasks matched the structured content.
- Disposable-user integration — passed all 12 checks, including fresh registered/Starter denial, full-member access, and downgraded denial for the protected Clinic setup guide. Disposable accounts were removed.
- Browser verification — passed 40 route/viewport combinations across the Clinic hub and nine activities at 1440, 768, 390, and 320 pixels, with no horizontal overflow, framework overlay, or console warning/error.
- Client-bundle inspection found no source archive hash/name, extraction path, workstation path, service-role marker, or Clinic source-package marker in `.next/static`.

Clinic source-package verification, executed separately in an isolated temporary folder with local placeholder build configuration:

- `pnpm install --frozen-lockfile --ignore-scripts` — passed; the lockfile passed pnpm's supply-chain policy check.
- `pnpm run typecheck` — passed.
- `pnpm run lint` — passed with 25 warnings and no errors.
- `pnpm test` — first run had one 30-second PDF-generator timeout under concurrent checks; the targeted file passed 9/9 on rerun, then the complete suite passed 831/831 tests across 192 files.
- `pnpm run build` — passed with placeholder local/test variables and no hosted backend contact; 88 pages were generated.

Local owner-review route (requires a full-member account):

`http://localhost:3000/app/ideas/clinic-operations-crm`

## Deferred and unchanged

No push, deployment, hosted Supabase mutation, payment activation, admin/analytics work, Google OAuth configuration, domain work, source redistribution, prospect publication, or final commercial-term decision was performed. Pergola remains the only US$1 Starter kit. The Clinic CRM is not described as production ready or compliant.
