# Phase 3C review fixes

## Scope and coordination

This pass addresses only the three confirmed findings in `docs/phase-3c-review.md` against commit `613c7abde79c8e20bea28a8eea4fa03024503ea9`. Application and database work stayed paused until the independent review was complete. No unrelated feature, push, deployment, hosted-service change, payment work, migration, or shared-database operation was performed.

## Fixes

- Public offer headings and supporting copy now follow the server-derived account state. Signed-out and registered visitors retain the US$1 invitation; starter accounts receive an open/continue message; full members receive a full-library message; unavailable lookups direct the account holder to verify access. The homepage and membership closing sections no longer prompt starter or full accounts to buy the starter offer again.
- The mobile idea section navigation no longer uses a negative inline margin. Its box is constrained to its parent at narrow widths while the link row keeps `overflow-x: auto` for internal scrolling.
- ESLint now narrowly ignores `.impeccable/review/**`, where local browser profiles and screenshots are stored. Application directories remain in scope for the exact repository lint command.

## Regression coverage

- Added shared-copy component tests for signed-out, registered, starter, and full states.
- Added public-page rendering tests for starter and full states on both `/` and `/membership`, including assertions that redundant US$1 headings are absent.
- Added a stylesheet regression test that preserves internal section-nav scrolling while rejecting the mobile negative margin and requiring parent-width containment.
- A real Chromium render at 320×900 measured `window.innerWidth = 320`, root `scrollWidth = 309`, and a contained section navigation from `9px` to `300.33px`. The nav retained internal horizontal scrolling (`clientWidth = 291`, `scrollWidth = 560`, `overflow-x = auto`). No framework error overlay was present.

## Verification

- `pnpm run typecheck`: passed.
- `pnpm run lint`: passed with the existing ignored local browser profile present.
- `pnpm test`: 70 tests passed across 21 files.
- `pnpm run build`: passed on Next.js 16.3.5.
- `git diff --check`: passed.
- The required Impeccable detector completed once. Its output remained advisory design-token drift in the existing consolidated stylesheet; this fix introduced no new color, typography, radius, or visual-system value.
- React review: the shared state-aware copy is a server-compatible presentational component with no effects, derived state, client boundary, or accessibility regression.

## Migration and database status

No migration was added, changed, applied, or rolled back in this remediation pass. The previously applied local migration remains `20260920175336_starter_offer_per_idea_access.sql`. The shared local database was not reset or mutated, and hosted Supabase was not contacted.

## First-agent follow-up

Re-review the three original findings against this follow-up commit: paid-account copy on `/` and `/membership`, the 320px Pergola section navigation, and exact `pnpm run lint` with `.impeccable/review/.edge-cdp-phase3c` still present. All broader Phase 3C launch deferrals remain unchanged.
