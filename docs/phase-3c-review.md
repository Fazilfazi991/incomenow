# Phase 3C independent review

## Disposition

**NEEDS FIXES**

The access model, database enforcement, protected-content boundary, project lifecycle, and Phase 3B regressions passed the independent checks below. Two user-experience defects remain: paid accounts still see a static US$1 purchase heading on public pages, and the full Pergola detail produces a 3px page-level horizontal overflow at 320px. The repository's exact lint command is also contaminated by an ignored local Edge profile, although source-scoped lint passes.

## Reviewed target and coordination

- Exact source: `613c7abde79c8e20bea28a8eea4fa03024503ea9` — `feat: add US$1 starter access`.
- Branch: `main`, two commits ahead of `origin/main` at the start and end of source review.
- Phase 3B commit `82644aa` is an ancestor of the reviewed commit.
- The tracked working tree was clean before this report was written. Build-generated changes to `next-env.d.ts` were reverted to the reviewed version after verification.
- Agent 2 explicitly confirmed that application edits, migrations, and shared-database operations were paused. No competing database process was found during the integration window.
- Local migration history confirms `20260920175336_starter_offer_per_idea_access.sql` is applied. It was not reapplied, edited, or reset.
- Required project instructions and phase reports were read: `AGENTS.md`, `PRODUCT.md`, `DESIGN.md`, `docs/phase-3b-results.md`, `docs/phase-3c-results.md`, and `docs/build-status.md`.

## Checks actually performed

| Check | Independent result |
| --- | --- |
| `pnpm run typecheck` | PASS |
| `pnpm test` | PASS — 19 files, 62 tests |
| `pnpm run test:db` | PASS — 4 suites, 164 pgTAP assertions |
| `pnpm exec supabase db lint --local --level error --fail-on error` | PASS — no schema errors |
| `pnpm run test:plan-sync` | PASS — 17 stages and 37 tasks synchronized |
| `pnpm run build` | PASS — Next.js 16.3.5 optimized production build |
| Production static-chunk scan | PASS — selected protected plan, task, resource, and full-guide markers absent from `.next/static` |
| Phase 3C disposable integration | PASS — all 10 reported flows rerun independently; cleanup confirmed |
| Phase 3B disposable integration | PASS — 9 account/settings/onboarding/isolation/persistence flows; accounts provisioned for this review and removed afterward |
| Source-scoped ESLint (`src`, `scripts`, proxy/config files) | PASS |
| Exact `pnpm run lint` | FAIL — see Finding 3; failures are inside a local Edge profile, not application source |
| Impeccable detector | Completed once; output was advisory design-token drift in the existing consolidated stylesheet, with no additional blocking detector finding |

The Phase 3C integration rerun covered registered preview browsing and bookmarks, locked-payload minimisation, Pergola-only starter access, concurrent idempotent project start, task/note/pause persistence, cross-user denial, starter-to-full project reuse, full-removal preservation of the independent starter project, expired/revoked grants, and optional-onboarding deep links.

The additional Phase 3B integration rerun covered registered and full-account routes, optional empty/skip/selected onboarding, saved-preference persistence, owner isolation, stale-write conflicts, direct-write denial, self-entitlement denial, independent profile updates, and a fresh-session readback. The database suites also cover note conflicts, pause/resume rules, plan versions, anonymous denial, and preservation of stored work across access changes.

All disposable users created by this review were deleted; a final admin check found zero review-pattern accounts. No hosted service was contacted. An owner-directed starter grant for an existing local account was intentionally retained after the review; it is a trusted local grant, not payment confirmation.

## Confirmed behavior

- A verified account without paid access can browse reduced catalogue records and save ideas, but cannot load protected guide sections or start a project.
- An active starter grant opens IDEA #001 and one account-owned Pergola project. Repeated and concurrent starts return the same project. Other ideas remain locked and cannot create projects.
- Full membership opens included published ideas and can create projects beyond the Pergola starter.
- Starter-to-full access reuses the existing Pergola project. Removing the full entitlement leaves the independent starter project intact; revocation or expiry hides it without deleting stored project, task, or note rows.
- Cross-user project and note reads are filtered, and cross-user mutation RPCs fail.
- Unknown access fails closed for protected operations and is not rendered as successful payment.
- Optional onboarding, settings, preferences, stale-write conflicts, bookmarks, plan versions, pause/resume, and private notes remain functional.
- Checkout remains unavailable. Duration, taxes, refunds, cancellation handling, and final resource rights remain explicitly unconfigured.
- Locked `/app` HTML and production browser chunks did not contain the selected protected implementation markers or private resource identifiers.

## Findings

### 1. Paid accounts still see a redundant US$1 purchase prompt

**Priority: P2 — user-facing offer-state defect**

Reproduction:

1. Create an active starter account or active full-member account.
2. Request `/` and `/membership` with that authenticated session.
3. Observe that the action is correctly account-aware (`Open your starter idea` or `Open idea library`).
4. Observe that the same page still contains the heading `Try IncomeNow for US$1`; the homepage also contains `Start with one focused idea for US$1`.

Independent probes returned `purchaseHeading: true` for starter and full accounts on both routes. This conflicts with the requirement that existing starter users see Open/Continue rather than another purchase prompt and that full members are not encouraged to purchase redundant starter access.

Affected source:

- `src/app/page.tsx:118`
- `src/app/page.tsx:125`
- `src/app/membership/page.tsx:88`
- The account-aware actions themselves are correct in `src/components/public-site.tsx:51`.

Suggested correction:

- Make the surrounding heading and supporting copy account-aware, not only the button. Registered/signed-out visitors may receive the US$1 invitation; starter users should receive a continue/open message; full members should receive a library message with no starter-purchase framing.
- Add public-page rendering tests for starter and full states that assert the redundant purchase heading is absent.

### 2. Pergola detail overflows the 320px viewport

**Priority: P2 — narrow-mobile layout defect**

Reproduction:

1. Sign in with active starter access.
2. Set the browser CSS viewport to 320×900.
3. Open `/app/ideas/pergola-quotation-follow-up-crm`.
4. Evaluate `window.innerWidth` and `document.documentElement.scrollWidth`.

Observed: `innerWidth = 320`, `scrollWidth = 323`. The overflowing box is `.section-nav`, measured at left `-3`, right `323`, width `326`. Its child links scroll internally as intended, but the nav container itself expands the document by 3px.

Affected source:

- `src/app/globals.css:581` applies `margin: 8px -12px 0` to `.section-nav` at the mobile breakpoint.

Suggested correction:

- Keep horizontal scrolling inside the section navigation while constraining the nav box to the viewport. Align the negative inset with the actual mobile detail-page gutter, or use an explicit contained width/max-width and border-box sizing.
- Add a 320px regression assertion that the root scroll width does not exceed the viewport.

### 3. The repository lint command scans local browser-profile code

**Priority: P3 — verification hygiene**

Reproduction:

1. Keep the existing ignored Edge profile under `.impeccable/review/.edge-cdp-phase3c`.
2. Run `pnpm run lint`.

Observed: ESLint traverses browser extensions in that profile and exits with 37 errors and 920 warnings. A source-scoped ESLint run across `src`, `scripts`, `proxy.ts`, `next.config.ts`, and `postcss.config.mjs` passes.

Affected source/configuration:

- `eslint.config.mjs:7` ignores `.next`, `out`, `coverage`, and `stitch`, but not local review/browser-profile artifacts.

Suggested correction:

- Keep temporary browser profiles outside the repository, or add the narrow `.impeccable/review/**` review-artifact path to ESLint's global ignores. Do not broadly ignore application directories.

## Mobile evidence

The four required member surfaces were visually inspected at a 390×900 CSS viewport. The catalogue, Pergola detail, locked idea, and project workspace were readable, retained the mobile header/bottom navigation, and exposed working actions appropriate to the account state. The narrow 320px Pergola capture documents Finding 2.

### Starter catalogue — 390px

![Starter catalogue at 390px](../.impeccable/review/phase-3c-review-starter-catalogue-390.png)

### Pergola full content — 390px

![Pergola content at 390px](../.impeccable/review/phase-3c-review-pergola-content-390.png)

### Locked non-Pergola idea — 390px

![Locked idea at 390px](../.impeccable/review/phase-3c-review-locked-idea-390.png)

### Pergola project workspace — 390px

![Project workspace at 390px](../.impeccable/review/phase-3c-review-project-workspace-390.png)

### Pergola detail — 320px overflow evidence

![Pergola content at 320px showing the overflowing section navigation](../.impeccable/review/phase-3c-review-pergola-content-320-overflow.png)

## Remaining kit, payment, and launch dependencies

These are readiness dependencies, not defects in the starter-access authorization model:

- The owner-supplied CRM ZIP, production demo, and prospect sheet still require receipt and verification. Their mention is not evidence that any asset is complete, permitted for redistribution, or ready for member delivery.
- Final downloadable kit contents, resource packaging, sanitisation, permissions, licence approval, and customer-specific asset review remain outstanding.
- Payment provider selection, checkout, webhook fulfilment, access duration, tax/refund/cancellation rules, and full-membership commercial terms remain unconfigured.
- Hosted Supabase migration/configuration, hosted smoke tests, production SMTP, Google OAuth, domain/security/operations review, analytics, and operational admin remain launch work.

No CRM rebuild or search of unrelated project folders was performed. No push, merge, deployment, payment enablement, or hosted mutation was performed.

## Reference basis

The database verification approach was checked against the current official Supabase guidance for [local database testing and linting](https://supabase.com/docs/guides/local-development/cli/testing-and-linting), [Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security), and [server-side authentication](https://supabase.com/docs/guides/auth/server-side).
