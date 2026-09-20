# IncomeNow

IncomeNow Phase 3A adds a public homepage and membership explanation to the verified authentication and member workspace. Visitors can review honest example summaries and membership scope without a session; account-aware actions connect to the existing registration, login, access, and protected-library routes without weakening membership checks.

## Runtime

- Node.js 20.9 or newer (the workspace currently uses Node.js 24)
- npm 10 or newer

## Setup

```bash
npm install
npm run supabase:start
cp .env.example .env.local
npm run dev
```

Copy the local API URL and publishable key reported by Supabase into `.env.local`, then open `http://localhost:3000/`. The public pages stay readable when Supabase is unavailable. Docker must be running for local authenticated and database flows. See `docs/auth-setup.md` for provider, email-template, and callback setup.

## Commands

```bash
npm run dev
npm run typecheck
npm run lint
npm test
npm run test:db
npm run test:plan-sync
npm run test:integration:local
npm run test:integration:phase2b
npm run build
npm start
```

`test:integration:local` retains the Phase 2A identity/access verifier. `test:integration:phase2b` is the opt-in two-account bookmark/workspace verifier documented in `docs/auth-setup.md`; neither script prints credentials or changes a hosted project.

## Public, account, and member routes

- `/` — public homepage
- `/membership` — public membership scope and current offer status

- `/register`, `/login`, `/verify-email`, `/forgot-password`, `/reset-password`
- `/account/access`
- `/app/explore`
- `/app/ideas/[slug]`
- `/app/saved`
- `/app/projects`
- `/app/projects/[projectId]`

Authentication does not grant membership. Protected routes require a verified session and a separate active `membership_entitlements` record checked on the server and constrained by RLS.

See `docs/phase-2a-integration-results.md` for the executed local verification matrix. Google OAuth, hosted Supabase configuration, and external email delivery remain explicitly unverified.

## Preview routes

- `/preview/explore`
- `/preview/ideas/pergola-quotation-follow-up-crm`
- `/preview/ideas/quotation-follow-up-automation`
- `/preview/ideas/local-service-lead-generation`
- `/preview/saved`

Preview routes are server-blocked by default in production. Set `ENABLE_PREVIEW_ROUTES=true` only for an explicitly approved non-production preview deployment.

## Content maintenance

Sample ideas live in `src/content/ideas.ts` and are parsed by `src/content/idea-schema.ts`. Versioned project-plan copy lives in `src/content/project-plan-data.json`; the matching immutable structural IDs are inserted by the Phase 2B migration and checked with `npm run test:plan-sync`. Existing projects remain pinned to their creation version when a later plan becomes current.

The homepage receives only the explicit `PublicIdea` projection in `src/content/public-idea.ts`. Its three stable example records expose public summaries, customer/problem context, technical requirements, resource-type labels, and schematic variants—never protected plan records, private resource locations, or account data. The typed membership offer in `src/content/membership-offer.ts` intentionally reports `Price to be confirmed` and no checkout.

## Phase boundaries

Checkout/payment, billing UI, admin operations, analytics, support, live demos, and real downloadable resources remain intentionally unconnected. Preview bookmarks remain device-local and are never mixed with member records. No hosted Supabase project is changed by the repository setup alone.

See `docs/phase-3a-results.md` for the public-page implementation and verification record. Phase 2B evidence remains in `docs/phase-2b-results.md`.
