# IncomeNow

IncomeNow Phase 3B adds optional account onboarding and settings to the public entry, verified authentication, and member workspace. Verified accounts can manage profile and discovery preferences whether or not membership is active; protected member content still requires a separate active entitlement.

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
npm run test:integration:phase3b
npm run build
npm start
```

`test:integration:local` retains the Phase 2A identity/access verifier. The Phase 2B and Phase 3B scripts are opt-in two-account local verifiers documented in `docs/auth-setup.md`; none prints credentials or changes a hosted project.

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

Authentication does not grant membership. The three `/account/*` routes require a verified account but not active membership. Protected `/app/*` routes require both a verified session and a separate active `membership_entitlements` record checked on the server and constrained by RLS.

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

See `docs/phase-3b-results.md` for the onboarding/settings implementation and verification record. Earlier public and workspace evidence remains in the Phase 3A and Phase 2B result documents.
