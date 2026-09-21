# Clinic CRM source inspection

Date: 2026-09-21

## Inputs

- Public demo: `https://besmile-public-demo.vercel.app/admin`
- Archive: owner-supplied `besmile-production-readiness.zip`
- Archive size: 14,202,553 bytes
- Archive entries: 920
- Uncompressed archive content: 17,683,048 bytes
- SHA-256: `7958426B74F454EE0A346FBB18D968ED56A3063AC6B2E3BD7D1302070D731662`
- Redistribution status: **sanitised distribution ZIP approved on 2026-09-21 for authorised full-member delivery; original archive remains blocked**
- Clinic prospect workbook: subsequently supplied and integrated as a separate protected member-safe projection; see `docs/clinic-prospect-integration.md`

The archive was inspected as data before execution and extracted only to an isolated temporary folder outside IncomeNow. It was never placed in `public/`, committed, migrated into IncomeNow, or connected to a hosted backend.

## Public demo evidence

The page title is **BSmile CRM**. No authentication is required for the supplied public URL. The app labels itself **Fusion Ventures Demo** and states **Synthetic data • Changes reset when the page reloads**.

Observed read-only:

- Dashboard with synthetic revenue, collections, active leads, conversion, invoice, finance, pipeline, and priority panels.
- Leads Management with search, staged lead rows, and visible contact actions.
- Clients with twenty explicitly fictional records and one fictional detail page containing a care plan, progress, sessions, notes, and timeline.
- Appointment & Scheduling with time, fictional client, clinician, care focus, and status.
- Tasks with assignee, priority, status, and completion controls.
- Finance and invoices with synthetic totals, rows, and statuses.
- Reports explicitly labelled illustrative, with export/report generation disabled.
- Navigation for employees, attendance, leave, calendars, meetings, chat, announcements, notifications, documents, payroll, feedback, settings, and roles/access.

Not tested:

- Any create, update, delete, completion, import, export, send, upload, payment, or role-changing action.
- Persistence or reset behaviour beyond the demo's own banner statement.
- Authentication, production data, integrations, recovery, or hosted acceptance.
- A distinct follow-up workflow; the inspected admin follow-up route repeated the lead-table structure.

No real customer record was identified in the inspected demo. Visible client and lead data appeared fictional and the client list states this explicitly.

## Static archive review

No real `.env`, private-key file, database dump, dependency tree, `.next` output, or service-role/JWT-looking credential was found in the archive. `.env.example` and `.env.release-gate.example` are present and were treated as configuration documentation, not production credentials. No secret values are reproduced here.

Publication blockers:

- Fifteen employee/org-chart image assets appear to depict identifiable staff.
- Source/docs include QA project references and real-looking employee email addresses.
- A script contains an absolute private workstation path to an internal social-media-leads workbook.
- The codebase includes sensitive patient records, notes, and document workflows.
- Attachment malware scanning is listed as missing.
- Redistribution approval and sanitisation evidence were not supplied.

At that phase boundary, the fixed source-download route was not created and the setup guide was the only protected Clinic download. The later distribution-safe phase resolved technical sanitisation and malware-scanning blockers in a separate archive; the new source route remains release-locked pending explicit owner approval. See `docs/clinic-distribution-readiness.md`.

## Actual technical stack

- Framework/runtime: Next.js 15.5.25, React 19, TypeScript.
- Package manager: pnpm 11.19.0, with both pnpm and npm lockfiles present; the declared package manager is pnpm.
- Backend: Supabase PostgreSQL, Auth, RLS, security-definer helpers, and private Storage with signed paths.
- Deployment architecture: Vercel-oriented Next.js hosting plus a dedicated Supabase project; `vercel.json` defines a scheduled chat-expiry route.
- Optional communication: web push via VAPID keys. No completed SMS provider was found.
- Optional third-party API: Google Sheets feedback import using a service account.
- Email: production transactional email and email-OTP infrastructure remain pending.
- Existing tests: Vitest unit/integration suites, Playwright/E2E scripts, security/QA scripts, release checks, and production-smoke documentation.
- Demo/seed data: QA/demo procedures exist and include production guards. They were not run.

Environment-variable names cover Supabase public/server values, application URL, web push, dispatch/cron secrets, and optional Google feedback configuration. Production values must remain customer-owned and environment-managed.

## Health-data review

The source is broader than the commercial **Clinic Operations CRM** position. It includes:

- Patient identity/contact fields, date of birth, gender, nationality, address, and emergency contacts.
- Care plans, appointment/session data, administrative summaries, clinical or treatment notes, and activity history.
- Private patient-document uploads with categories for prescriptions, medical reports, assessment reports, and insurance documents.
- General document uploads that could contain medical history, laboratory results, or imaging even though dedicated structured lab/imaging modules were not identified.

These capabilities can process highly sensitive health information. The integration makes no HIPAA, GDPR, DHA, DOH, MOHAP, security-certification, or production-readiness claim. Independent legal, privacy, security, architecture, and customer acceptance work is required before real clinic use.

## Isolated local validation

The archive was extracted outside the repository after zip-slip paths were checked. Install used `pnpm install --frozen-lockfile --ignore-scripts`; no seed, migration, smoke, release, or hosted-service script was executed.

- Typecheck: passed.
- Lint: passed with 25 warnings and no errors. Warnings include missing hook dependencies, internal navigation through `window.location`, and raw `<img>` use.
- Tests: first concurrent run passed 830/831 with one PDF-generator timeout; its targeted rerun passed 9/9, then a complete rerun passed 831/831 across 192 files.
- Production build: passed with local placeholder configuration; 88 routes/pages were generated.

Implemented in source, locally verified by code checks: dashboard, CRM leads/import/sales, client/patient records, scheduling, tasks, employee operations, attendance/leave, communication, finance/invoices/payroll, reports, documents, role/permission code, audit paths, and private Storage routes.

Not live-verified: hosted Auth/RLS behaviour, real CRUD, production Storage/uploads, signed URL acceptance, web push, Google feedback, email, cron, backups, restore, rollback, deployment, and customer acceptance.

## Remaining decisions

1. Sanitised redistribution package: completed technically; see `docs/clinic-distribution-readiness.md`.
2. Sanitised package redistribution approval: completed on 2026-09-21 for authorised full-member delivery only; the original archive remains excluded.
3. Decide whether sensitive clinical/patient modules belong in the commercial scope; otherwise remove or isolate them.
4. Complete independent security/privacy/legal review and a threat-modelled acceptance plan.
5. Add malware scanning and verify private document authorization, retention, deletion, backup, and restore.
6. Select customer-owned production accounts, domain, email infrastructure, monitoring, backup, and recovery ownership.
7. Clinic prospect workbook and member-safe finder/export: completed separately; see `docs/clinic-prospect-integration.md`.
