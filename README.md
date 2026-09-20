# IncomeNow

IncomeNow Phase 3C adds an authenticated preview catalogue and a US$1 one-time Starter Pass for the Pergola Business Kit while preserving the completed Phase 3B onboarding and settings work. Authentication remains separate from paid access: a verified account can browse and bookmark safe previews, a starter grant opens only IDEA #001 and its one project, and full membership opens every included published idea.

## Runtime

- Node.js 20.9 or newer (the workspace currently uses Node.js 24)
- pnpm (the current local verification workflow uses pnpm; the existing package lock is preserved)

## Setup

```bash
pnpm install
pnpm run supabase:start
cp .env.example .env.local
pnpm run dev
```

Copy the local API URL and publishable key reported by Supabase into `.env.local`, then open `http://localhost:3000/`. The public pages stay readable when Supabase is unavailable. Docker must be running for local authenticated and database flows. See `docs/auth-setup.md` for provider, email-template, and callback setup.

## Commands

```bash
pnpm run dev
pnpm run typecheck
pnpm run lint
pnpm test
pnpm run test:db
pnpm run test:plan-sync
pnpm run test:integration:local
pnpm run test:integration:phase2b
pnpm run test:integration:phase3b
pnpm run test:integration:phase3c
pnpm run build
pnpm start
```

`test:integration:local` retains the Phase 2A identity/access verifier. The Phase 2B, Phase 3B, and Phase 3C scripts are opt-in local verifiers documented in `docs/auth-setup.md`; none prints credentials or changes a hosted project. Phase 3C creates disposable local users and explicit test grants, then removes them.

## Public, account, and member routes

- `/` — public homepage
- `/membership` — public membership scope and current offer status

- `/register`, `/login`, `/verify-email`, `/forgot-password`, `/reset-password`
- `/account/access`
- `/account/getting-started`
- `/account/settings`
- `/app/explore`
- `/app/ideas/[slug]`
- `/app/saved`
- `/app/projects`
- `/app/projects/[projectId]`

Authentication does not grant paid access. The three `/account/*` routes and the safe `/app` catalogue require a verified account but not active membership. Full idea content and project operations require either an active `membership_entitlements` row or an active matching `idea_access_grants` row, checked at the server data boundary and independently constrained by RLS. Starter access is never inferred from signup, onboarding, a browser flag, or an offer URL.

See `docs/phase-2a-integration-results.md` for the executed local verification matrix. Google OAuth, hosted Supabase configuration, and external email delivery remain explicitly unverified.

## Preview routes

- `/preview/explore`
- `/preview/ideas/pergola-quotation-follow-up-crm`
- `/preview/ideas/quotation-follow-up-automation`
- `/preview/ideas/local-service-lead-generation`
- `/preview/saved`

Preview routes are server-blocked by default in production. Set `ENABLE_PREVIEW_ROUTES=true` only for an explicitly approved non-production preview deployment.

## Content maintenance

Sample ideas live in `src/content/ideas.ts` and are parsed by `src/content/idea-schema.ts`. Versioned project-plan copy lives in `src/content/project-plan-data.json`; the matching immutable structural IDs are inserted by the Phase 2B migration and checked with `pnpm run test:plan-sync`. Existing projects remain pinned to their creation version when a later plan becomes current.

The homepage receives only the explicit `PublicIdea` projection in `src/content/public-idea.ts`. The authenticated catalogue uses the separate safe `IdeaCatalogEntry` projection. Both omit plan records, resource IDs/locations, and account data from locked browser payloads. The typed offers in `src/content/membership-offer.ts` define the US$1/USD one-time Pergola starter and the separately unpriced monthly membership; both keep live checkout disabled.

## Phase boundaries

Checkout/payment, billing UI, admin operations, analytics, support, live demos, and real downloadable resources remain intentionally unconnected. Starter duration, taxes, refunds, and final resource rights are not configured. Preview bookmarks remain device-local and are never mixed with account bookmarks. No hosted Supabase project is changed by the repository setup alone.

See `docs/phase-3c-results.md` for the starter implementation and verification record. `docs/phase-3b-results.md` remains the historical onboarding/settings report; earlier public and workspace evidence remains in the Phase 3A and Phase 2B result documents.
