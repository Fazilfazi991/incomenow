# ZeroDebt public-demo results

Review date: 2026-09-22

Status: **owner-approved synthetic demo deployed and live-verified**.

## Deployment record

| Field | Value |
| --- | --- |
| Public URL | `https://zerodebt-public-demo.vercel.app` |
| Provider | Vercel |
| Dedicated project | `zerodebt-public-demo` (`prj_d3nt7xzn1KnxMacr3yr8l8m27hEv`) |
| Accepted deployment | `dpl_C1RFes6Lv1KWp6v7A4D1UDiCqUMG` |
| Deployment status | Ready |
| Source branch | `demo/zerodebt-public-demo` |
| Deployed source commit | `b0763b74ba5cbcdeb1b0450dbd1406d99111551e` |
| Framework/runtime | Next.js 15.5.24 on Vercel; Node.js 24.x project setting |

The deployment was made from a clean `git archive` extraction of the approved commit, not from the original checkout or its ignored `.env.local`. The separate project does not modify or share configuration with the existing ZeroDebt production project.

Two pre-acceptance deployments were rejected during live verification and were never linked from IncomeNow. The first contained a trailing newline in an environment value; the second revealed that the newly created Vercel project had been classified as `Other`, which left middleware unbundled. The environment values were rewritten without trailing newlines, the project preset was changed to Next.js, and the accepted deployment above was built from the unchanged approved source commit.

## Configuration model

The dedicated project has exactly these three application environment variables:

| Variable | Value | Classification |
| --- | --- | --- |
| `NEXT_PUBLIC_DEMO_MODE` | `true` | Safe/public demo switch |
| `NEXT_PUBLIC_APP_URL` | `https://zerodebt-public-demo.vercel.app` | Safe/public canonical origin |
| `AI_ASSISTANT_ENABLED` | `false` | Non-secret server configuration |

No Supabase URL/key, service-role credential, Telegram token or webhook secret, AI-provider key, payment credential, advertising credential, analytics credential, OCR credential, or production `.env` file was configured.

No backend, database, authentication provider, queue, storage bucket, OCR service, payment service, advertising network, AI provider, or Telegram service is required. Vercel serves the Next.js application, static assets, and fail-closed middleware only.

## Live safety checks

| Requirement | Result |
| --- | --- |
| Homepage and overview | `/` and `/overview` returned 200 and rendered the synthetic workspace. |
| Synthetic data | The visible workspace is the fictional `Alex Demo` fixture. No real personal or financial data was introduced. |
| Browser-local persistence | A Quick Entry survived a page reload under `zerodebt-public-demo-workspace-v3`. |
| Quick Entry and confirmation | `biryani 500` parsed to a ₹500 Food & Dining expense and did not save until **Confirm** was pressed. |
| Reset | **Reset demo** removed the test entry and restored the baseline synthetic workspace. |
| APIs fail closed | `/api/workspace` and `/api/ai/chat` returned 403 JSON responses. The demo-mode middleware covers all `/api/*` routes. |
| Admin/auth | `/admin` and `/auth` returned 307 redirects to `/overview`; no privileged UI was exposed. |
| AI | `/ai` states `AI-ASSISTED FEATURE · DISABLED IN DEMO`, says no provider key is present, and made no AI-provider request. |
| Telegram | `/telegram` states `TELEGRAM INTERACTION EXAMPLE`, says it does not connect to Telegram, and made no Telegram request. |
| Network origins | Browser resource inspection reported only `https://zerodebt-public-demo.vercel.app`. |
| Runtime logs | The accepted deployment had no warning, error, or fatal runtime-log entries during QA. Observed response classes were 200, 304, 307, and 403. |

The compact disclosure renders as `ZeroDebt Demo · Synthetic financial data`, followed by text explaining that changes stay in the browser and may reset. It does not cover the product with a large warning banner.

## Responsive browser QA

The live deployment was inspected at 1440, 1024, 768, 390, and 320 CSS pixels across Overview/dashboard, debts, activity, progress/plan, Quick Entry, AI, Telegram, and reset behavior.

| Width | Representative evidence | Result |
| --- | --- | --- |
| 1440 | Overview/dashboard | Passed; disclosure, synthetic totals, reset, navigation, and assistant control rendered without horizontal overflow. |
| 1024 | Debt Command Center | Passed; debt cards, Snowball order, insight, disclosure, and reset rendered without horizontal overflow. |
| 768 | Activity | Passed; filters, dated entries, navigation, disclosure, and reset rendered without horizontal overflow. |
| 390 | Quick Entry review and persistence/reset flow | Passed; input, review, explicit confirmation, reload persistence, activity entry, and reset all worked without horizontal overflow. |
| 320 | Telegram and AI representations plus core routes | Passed; both non-live labels and safety copy rendered without horizontal overflow. |

All six reviewed routes (`/overview`, `/debts`, `/transactions`, `/plan`, `/ai`, and `/telegram`) reported document width equal to viewport width at 768, 390, and 320. Representative 1440 and 1024 views were also checked. No browser console warning/error or framework overlay appeared.

## Build and pre-deployment verification

- Fresh `pnpm install --frozen-lockfile`: passed after explicitly allowing the `unrs-resolver` install build under pnpm 11.
- Typecheck and lint: passed.
- Tests: 24 files passed and 1 skipped; 227 tests passed and 12 skipped (239 total).
- Next.js production build: passed; 53 pages generated/analyzed.
- Accepted Vercel build: passed with the Next.js preset and produced the expected middleware plus application outputs.
- Production-output scan: no Supabase project URL/key, service-role secret, bot token, AI key, payment/ad credential, real user data, or sensitive financial data was found. The configured canonical origin is the public demo URL. This is a targeted release check, not a general security certification.

## Reset, AI, and Telegram presentation

- Reset deletes the current local demo workspace and writes a fresh synthetic fixture. Reload alone intentionally preserves local changes.
- AI remains an audited implementation description with deterministic calculations; the demo has no billable provider connection.
- Telegram remains an audited integration/example; the demo has no bot, webhook, chat identity, or production token.

## Remaining risks

- Browser-local data remains on a shared device until Reset or site-data clearing.
- Future code, dependency, middleware, or environment changes require the same live checks again.
- Vercel hosting and the public dependency supply chain remain external operational dependencies.
- Clean targeted scans and successful QA do not certify the application as secure or suitable for production financial data.
- Source redistribution is still prohibited pending written permission/licensing and logo, mascot, and asset provenance confirmation.
