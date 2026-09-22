# Phase 4A — Pergola kit commercial-readiness report

## Outcome

The protected Pergola Business Kit is locally ready for owner review as an honest implementation package. It now combines the existing synthetic-data demo and protected source archive with an inspected software scope, an actionable setup guide, a protected 77-business research list, five editable sales templates, and a customer-delivery handover guide.

This is not a production-readiness claim. Hosted Supabase, live CRM authentication and storage, real customer data, customer acceptance, deployment, messaging, payment processing, final licensing, and commercial terms remain deferred.

## Source inputs and custody

- Owner workbook: `37083a54-35a7-4c26-8210-ead74f76c10e.xlsx`
- Workbook SHA-256: `39E2FBD76E3E5BA2E368040531832629A89C759A14EF77EFCF85BB428DF73A3F`
- Owner CRM archive: `private-resources/pergola/universalpergola-main.zip`
- Archive SHA-256: `5E4DC492F2BD05869AE7FB77A4C83F66908F96FB6CD6329C4BDA1B36970345B5`
- Cleaned private JSON artifact: `private-resources/pergola/potential-customers.json`
- Current preserved local JSON SHA-256: `46D0022AF7D9BC20790C5BABD733F287B210BC1867B9E5F8B6FD95261940610A`
- Deterministic member CSV SHA-256: `6B70264AE7433D0369C5E7E7C40A93897974F7DEEF6967FE3C62E4AF2C6E78AA`

The source workbook remains outside the repository. The source ZIP remains local and protected by the existing authenticated download route, but a narrow ignore rule prevents it from re-entering Git. No source package or member dataset is placed in `public/` or a client bundle.

## Prospect-data preparation

The workbook contains one `Leads` sheet, 32 columns, and 191 populated research rows. Phase 4A applies the following deterministic publication rules in order:

1. Keep only HIGH or MEDIUM research-priority rows.
2. Require at least one primary contact route: primary email or primary phone.
3. Exclude prior contacted and send-failed outreach states.
4. Deduplicate by normalised company/domain key, keeping the first eligible occurrence.

The sequential exclusions were 97 rows below the allowed priority, one remaining row without a primary contact route, and 16 prior-outreach rows. No eligible duplicate keys remained. The resulting 77 records contain 51 HIGH and 26 MEDIUM priorities, 34 published primary emails, 76 published primary phones, and 69 recorded quote forms.

The member projection contains only company name, website/domain, country, state/region, city, category, business model, primary email, primary phone, quote-form state/URL, source URL, checked date, research priority, and a generated stable record ID. It excludes workbook/internal IDs, enrichment fields, lead scores, search queries, notes, owner and next-action fields, secondary contacts, social profiles, and outreach state.

The product consistently labels these as possible businesses to research, not confirmed buyers or exclusive leads. Members are told to verify every business and contact route before outreach.

## Member experience

The protected customer activity now provides:

- company/domain search;
- state, city, category, research-priority, and contact-availability filters;
- a live result count and clear zero-result reset;
- explicit missing email, phone, and quote-form states;
- source, website, and quote-form links where supplied;
- clipboard success feedback only after a successful copy;
- a protected UTF-8 CSV download with the same approved projection.

The desktop result grid converts to complete stacked records on smaller screens. Browser checks at 1440, 768, 390, and 320 pixels found no document-level horizontal overflow.

## CRM package inspection

The archive was extracted to an isolated temporary directory for static inspection and dependency/build validation. It contains a Next.js 16.3.5 / React 19.3 / TypeScript 5.9 application using Tailwind CSS 4.3, Supabase SSR and JavaScript clients, PostgreSQL with RLS, Auth, private Storage policies, Zod validation, pdf-lib document generation, and npm/package-lock workflows.

Observed application modules include categories/products, enquiries, customers, site visits, quotations and revisions, projects, payment records, tasks, feedback, reports, private files, and generated PDF documents. The package does not implement a messaging gateway or payment processor. Its own documentation describes an offline/UAT foundation rather than a production-ready hosted service.

The archive contains `.env.example` with public Supabase/application variable names only; no real `.env`, service-role credential, or private-key file was found during the scoped inspection.

## Validation status

| Area | Status | Evidence and boundary |
| --- | --- | --- |
| Package install | Verified locally | `npm ci --ignore-scripts`; 375 packages; zero reported vulnerabilities |
| Package automated checks | Verified locally | `npm run check`; 47 tests, generated types/type checking, lint, and production build passed |
| Source structure and modules | Included and inspected | Static source, routes, migrations, RLS policies, tests, and docs reviewed |
| Local package database | Present but not verified | Database start/reset/seed were not run; shared database operations were intentionally avoided |
| Hosted Supabase/Auth/Storage | Not verified | No hosted project or credentials were contacted or changed |
| Production deployment | Not verified | No push, deploy, domain, environment, or external-service change |
| Messaging/payment integrations | Not implemented | Keep outside the sales claim unless separately added and tested |

## Setup and handover guidance

The protected setup activity now covers twelve labelled areas: prerequisites, extraction, dependency installation, environment variables, local backend preparation, local run, branding, workflow configuration, acceptance testing, deployment preparation, customer handover, and backups/support. Each item is marked as included/inspected, locally verified, or present but not verified.

Three copyable Codex prompts help a member scope branding, map a fictional customer workflow, and prepare an acceptance checklist. The guide explicitly prohibits passwords, private keys, connection strings, customer exports, and other secrets in AI prompts.

The delivery activity adds a twelve-point handover guide covering agreed scope, source version, environment-variable names without values, account ownership, roles, tested workflows, commercial wording, acceptance, deployment ownership, backups/recovery, credential transfer, and support boundaries.

## Sales kit

The sales activity now provides five editable, device-local templates:

1. initial introduction;
2. phone opening;
3. follow-up;
4. demo structure;
5. proposal outline.

Copy confirmation never implies a message was sent. The guidance requires verified context and prohibits invented prior interest, results, or urgency.

## Access and security review

- The page loads prospect records on the server only after the existing fresh account and IDEA #001 access check succeeds.
- CSV and Markdown downloads repeat that fresh authorization at their own data boundaries.
- Responses are dynamic, private/no-store attachments with `nosniff` headers.
- Registered-preview users receive 403 and the dataset is not read; starter and full members can download; revoked access returns to 403.
- Locked/public projections still omit paid sections, resource IDs/paths, prospect records, and internal CRM content.
- No database migration was needed. Existing Phase 3C per-idea grants and project ownership remain unchanged.

## Git-history correction

The owner approved removing the source ZIP from reachable local Git history. The original ZIP-containing commit was amended to `b89629bda9157c032f6b7180f594d2df67ec6d3b`; a narrow `/private-resources/pergola/universalpergola-main.zip` ignore rule prevents accidental restaging. The local archive retains its original hash and remains available to the protected route. No push, publish, or deployment occurred.

The later release-hardening pass also untracked the 77-record member projection and moved the premium readiness content to an ignored server artifact. Current local hashes are `46D0022AF7D9BC20790C5BABD733F287B210BC1867B9E5F8B6FD95261940610A` for the 50,723-byte prospect JSON and `E6B857D51BF9C2E888ED16CDE6711C9EE432E9051CA728A819CFAE7827A541DF` for the 9,847-byte guide artifact. Both are loaded only after current IDEA #001 access succeeds.

## IncomeNow verification

- TypeScript: passed.
- ESLint: passed.
- Vitest/Testing Library: 107 tests across 32 files passed.
- Optimized Next.js production build: passed.
- pgTAP: 164 assertions across four suites passed without a database reset.
- Disposable-user integration: eleven checks passed, including protected downloads, locked-payload minimisation, starter and full authorization, revocation, cross-user denial, project reuse, and optional onboarding; disposable users were removed.
- Browser: customer search/filter/copy feedback, setup and sales presentation, 1440/768/390/320 responsive layouts, and no document-level horizontal overflow passed.

## Owner-review routes and evidence

- Local customer finder: `http://localhost:3000/app/ideas/pergola-quotation-follow-up-crm?section=customers`
- Local setup guide: `http://localhost:3000/app/ideas/pergola-quotation-follow-up-crm?section=setup`
- Local sales kit: `http://localhost:3000/app/ideas/pergola-quotation-follow-up-crm?section=sales`
- Screenshots: `artifacts/phase-4a/`

These routes require a local account with current IDEA #001 starter access or full membership.

## Remaining owner/launch decisions

- Approve the source archive and workbook-derived data for member redistribution, including contact-data retention/update policy.
- Decide final starter duration, refunds, taxes, checkout/provider, and resource licence terms.
- Provision and verify a dedicated hosted Supabase project, Auth redirects/providers, SMTP, Storage, backups, and recovery.
- Complete customer-specific workflow configuration, production acceptance, domain/deployment, and support responsibilities.
- Decide whether messaging and payment integrations belong in a future CRM scope; they are not present today.
