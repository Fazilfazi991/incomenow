# IncomeNow

IncomeNow Phase 2B adds account-synced saved ideas and a private project workspace to the verified Phase 2A authentication and membership foundation. Bookmarks, projects, version-pinned stages, required-task progress, pause state, and revisioned stage notes are persisted in local Supabase and isolated by active-member RLS.

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

Copy the local API URL and publishable key reported by Supabase into `.env.local`, then open `http://localhost:3000/login`. Docker must be running for the local Supabase stack. See `docs/auth-setup.md` for provider, email-template, and callback setup.

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

## Account and member routes

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

## Phase boundaries

Checkout/payment, billing UI, admin operations, analytics, support, live demos, and real downloadable resources remain intentionally unconnected. Preview bookmarks remain device-local and are never mixed with member records. No hosted Supabase project is changed by the repository setup alone.

See `docs/phase-2b-results.md` for the executed local verification and cleanup record.
