# IDEA #003 accounting demo evidence

Date: 2026-09-21 (Asia/Dubai)

Status: **Local demo verified. Public demo URL not yet available.**

This evidence is for the future **AI Accounting & Finance Operations Kit**. It does not publish IDEA #003, change access rules, make the source downloadable, or claim the accounting application is production-ready.

## Source inspected

- Repository: `Fazilfazi991/Accountingsoftware`
- Default branch observed: `release/production`
- Source/base commit: `6d89cdd56bef5b3f011a7c34d5dfd2f4b335cce4`
- Isolated demo branch: `demo/public-accounting-demo`
- Local demo URL on the review machine: `http://127.0.0.1:3205`
- Framework: Next.js 16 App Router, React 19, TypeScript and Tailwind CSS 4
- Backend in authenticated product mode: Supabase Auth and Postgres/RLS
- Demo backend: none; browser-local synthetic fixtures only

No public deployment was created. Do not expose the local URL in member-facing content.

## Future member-facing demo metadata

| Field | Prepared value |
| --- | --- |
| Demo title | FYNTA accounting operations demo |
| Button label after deployment | Open accounting software demo |
| Public URL | `null` — assign only after an approved visitor-accessible deployment exists |
| Availability now | Local review ready; public deployment pending |
| Synthetic-data notice | Demo environment. Synthetic data. Changes stay in your browser and can be reset. |
| Financial notice | Demo data is fictional. This software supports operational and accounting workflows and does not replace professional accounting, tax or financial advice. |
| AI notice | Optional AI — connect a supported provider using the customer's own API credentials. AI is disabled in the public-demo build by default. |

The IncomeNow application must not show an active external-demo button until a public URL is supplied and verified in a fresh visitor context.

## What a member should look at

1. Dashboard cash/bank, expenses, receivables and payables.
2. Synthetic customer and supplier records.
3. Paid, partially paid and overdue invoices.
4. Supplier bills and payment status.
5. Browser-local expense creation and reset.
6. Cash/bank, reconciliation and journal screens.
7. Reports generated from the current synthetic browser dataset.
8. The disabled optional-AI state and customer-owned credential explanation.

## Verified demo scope

| Module | Verification |
| --- | --- |
| Dashboard | Rendered and visually checked at 1440, 1024, 768, 390 and 320px. |
| Customers / suppliers | List, detail and new-record routes render from synthetic fixtures. |
| Invoices / receivables | List, detail and form routes render; paid/partial/overdue fixtures are present. |
| Quotations | Fixture-backed list/detail/form and conversion logic are present. |
| Purchase bills / payables | Synthetic list/detail/form and supplier-payment workflow are included. |
| Expenses | A synthetic expense was added in the browser, observed in the list and removed by Reset demo. |
| Banking / reconciliation | Browser-local screens render without a database connection. |
| Journals / accounts | Fixture-backed screens render; production posting was not exercised. |
| Reports | Report index and profit/loss route render from fixture calculations. |
| Optional AI | Explicitly disabled; API routes return 503 and no provider call is made. |

No page-level horizontal overflow or console errors were observed in the checked desktop/mobile route matrix.

## Screenshots

- [Desktop dashboard, 1440px](evidence/accounting-demo/desktop-dashboard-1440.png)
- [Tablet dashboard, 768px](evidence/accounting-demo/tablet-dashboard-768.png)
- [Mobile dashboard, 390px](evidence/accounting-demo/mobile-dashboard-390.png)
- [Mobile disabled-AI state, 320px](evidence/accounting-demo/mobile-ai-320.png)

## Local validation

- `npm ci`: passed.
- `npx tsc --noEmit`: passed.
- `npm run lint`: passed with no errors and five warnings.
- `npm run test`: 29 files and 145 tests passed.
- `npm run build` with the two explicit demo variables: passed.
- Direct demo API request: blocked with HTTP 503 and `Cache-Control: no-store`.
- Demo auth route: redirected to the public demo.
- Supabase/database QA scripts: intentionally not run.

The dependency audit reported one high-severity advisory in the development-only ESLint chain (`js-yaml@4.3.1`). It is not in the public-demo runtime bundle, but the lockfile should be updated and all checks rerun before deployment.

## Honest limitations

- No public URL exists yet.
- No database-backed or multi-user demo behavior was tested or enabled.
- Authenticated production roles, RLS, posting and migrations were not integration-tested in this task.
- AI output was not tested because no provider key or approved billable account was used.
- VAT/report outputs have not been independently certified for accounting, tax, IFRS, GAAP or audit compliance.
- No verified attachment/file-storage implementation was found.
- A public chunk still contains generic Supabase SDK code and the public Supabase environment-variable names because a shared module also serves authenticated product mode. No values, project URL/reference or Supabase request were present in the verified demo. A later bundle split could remove this unnecessary code.
- The repository source has not been approved for member redistribution. The source download must remain unavailable until ownership, third-party licences, sanitisation and distribution rights are confirmed.

## Deployment handoff

Recommended only after owner approval: a dedicated Vercel project on the demo branch with exactly these server-side values:

```text
ACCOUNTING_PUBLIC_DEMO=true
ACCOUNTING_DEMO_DATASET=synthetic-v1
```

Do not copy production Supabase, database, service-role, email, payment, storage or AI secrets into that project. After deployment, verify the original URL in a fresh visitor context, rerun mobile/desktop/API/bundle checks, then replace the `null` metadata URL.
