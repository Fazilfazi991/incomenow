# Authentication and membership setup

Phase 2A uses Supabase Auth for identity and public Postgres tables with RLS for profile and membership state. Account creation never creates an entitlement.

## Local setup

1. Start Docker Desktop.
2. Run `npm run supabase:start`.
3. Copy `.env.example` to `.env.local`.
4. Copy the local API URL and publishable key from the Supabase CLI output into `.env.local`. Never add a service-role or secret key to a `NEXT_PUBLIC_` variable, and never paste `.env.example` over an existing environment file.
5. Run `npm run supabase:reset` to apply the migration and `npm run test:db` to execute the transactional pgTAP RLS suite.
6. Run `npm run dev` and use `http://localhost:3000/register`.

The local configuration requires email confirmation, a 12-character minimum for new passwords, and custom confirmation/recovery templates in `supabase/templates/`. Supabase CLI 2.117.0 reports the development email viewer as **Mailpit** at `http://127.0.0.1:54324`. This captures local messages only; it does not prove production inbox delivery. The local email limit is 20 messages per hour so the complete confirmation and recovery suite can run while preserving rate limiting.

The CLI warns that local services bind to `0.0.0.0` and use shared development credentials. Keep the stack on a trusted development machine/network and never expose it as a production service.

## Callback and email URLs

- Application origin: `APP_ORIGIN`, with no path (local example: `http://localhost:3000`).
- Email confirmation handler: `${APP_ORIGIN}/auth/confirm`.
- Google application callback: `${APP_ORIGIN}/auth/callback`.
- Recovery verification handler: `${APP_ORIGIN}/auth/recovery`; successful verification continues to `/reset-password`.
- Google OAuth provider callback registered with Google: `https://<project-ref>.supabase.co/auth/v1/callback` for a hosted Supabase project. Use the local callback reported by the CLI when testing a local provider configuration.

Allowed redirect URLs must be exact and environment-specific. Do not add wildcard production redirects. The app accepts only `/account/access`, `/account/settings`, `/account/getting-started`, `/app/explore`, `/app/saved`, `/app/projects`, validated UUID project routes, and `/app/ideas/*` as post-auth destinations. Onboarding continuation also rejects a self-referential `/account/getting-started` destination to prevent loops.

For hosted environments, configure the Google client ID/secret and SMTP/email templates in Supabase project settings. Those are operator changes and are not performed by this repository or by Phase 2A without explicit approval.

## Local Google OAuth setup (currently blocked)

No approved development Google client ID or secret was available during Phase 2A.1, so Google was not enabled or tested. An authorized owner can prepare it as follows:

1. In Google Auth Platform, configure `http://localhost:3000` as an authorized JavaScript origin.
2. Configure `http://127.0.0.1:54321/auth/v1/callback` as the authorized Google redirect URI. This is Google → local Supabase Auth, not the application's callback.
3. Put the credentials in a root `.env` file used by the Supabase CLI, not in the app's `.env.local`:

   ```dotenv
   SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID=replace-with-development-client-id
   SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_SECRET=replace-with-development-client-secret
   ```

4. Add the following provider block to `supabase/config.toml`, then restart the local Supabase stack:

   ```toml
   [auth.external.google]
   enabled = true
   client_id = "env(SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID)"
   secret = "env(SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_SECRET)"
   skip_nonce_check = false
   ```

5. The application then sends Supabase Auth back to `http://localhost:3000/auth/callback`; only the application's allowlisted final destinations are accepted.

Do not commit the root `.env` file or create/alter a Google Cloud application without owner approval.

## Entitlement fixture strategy

The migration intentionally creates no active memberships. For local testing, first register and verify a user, then insert a fixture only through local Studio or the local SQL editor:

```sql
insert into public.membership_entitlements (user_id, enabled, source, source_reference)
select id, true, 'complimentary', 'local-phase-2a'
from auth.users
where email = 'replace-with-local-test-email@example.com'
on conflict (user_id) do update
set enabled = excluded.enabled,
    source = excluded.source,
    source_reference = excluded.source_reference,
    starts_at = null,
    revoked_at = null,
    expires_at = null;
```

Use only disposable local users. Do not put this statement in `seed.sql`, because automatic seeding could blur the boundary between account creation and membership access. The pgTAP test creates isolated users and entitlements inside a transaction and rolls everything back.

## Local integration verifier

After creating and confirming two disposable local users, the direct Auth/RLS/API verifier can be run with temporary process-only values:

```powershell
$env:PHASE2A_EMAIL_A = "first-disposable-user@example.test"
$env:PHASE2A_EMAIL_B = "second-disposable-user@example.test"
$env:PHASE2A_PASSWORD = "their-shared-temporary-password"
$env:PHASE2A_EXPECTED_ACCESS = "inactive" # active, inactive, or unavailable
pnpm run test:integration:local
```

The verifier checks invalid login, both user sessions, `getUser`, real Auth refresh, RLS isolation, forbidden ownership and entitlement writes, anonymous denial, `/api/member/access`, protected-content boundaries, and post-sign-out denial. Supply fixtures only in the disposable local database and remove the environment variables afterward.

## Security model

- The browser receives only the Supabase publishable key.
- Server Components, actions, route handlers, and the root proxy use cookie-aware Supabase SSR clients.
- Authentication is verified with `getUser`/`getClaims`; authorization never trusts user metadata.
- `profiles` can be read by their owner; only `display_name` is user-updatable.
- `membership_entitlements` can be read only by their owner and cannot be created or changed by authenticated or anonymous users.
- `idea_access_grants` exposes only non-privileged fields to its owner and cannot be created, updated, or deleted by authenticated or anonymous users. The current constraint permits only `starter-pergola-v1` for IDEA #001.
- `account_preferences` can be read only by its owner. Validated security-definer functions perform revision-checked save/skip transitions; authenticated users receive no direct insert, update, or delete grant.
- Profile, preferences, authentication-method display, and `/account/*` routes require a verified account but never require or create membership. Onboarding state is convenience state, not authorization state.
- Safe catalogue previews and bookmarks require a verified account. Full idea records and project operations call a fresh full-membership-or-specific-idea access check at their server data boundary and deny paid data when the relevant lookup is unavailable.
- The access API is dynamic and returns `Cache-Control: private, no-store`.
- Workspace rows are owned by `auth.uid()`, visible only while the owner has full or matching idea access, and hidden rather than deleted when relevant access becomes inactive.
- Project creation and pause/task/note transitions use narrow authenticated functions; structural plan tables stay in the private schema.
- Stage notes are plain text, limited to 4,000 characters, and use optimistic revision checks to prevent silent overwrites.

## Phase 2B local verifier

Create two disposable confirmed local accounts with active test entitlements, then provide their process-only values as `PHASE2B_EMAIL_A`, `PHASE2B_EMAIL_B`, and `PHASE2B_PASSWORD`. Also expose the local CLI values as `API_URL` and `ANON_KEY`, set `APP_ORIGIN=http://localhost:3000`, and run `pnpm run test:integration:phase2b`.

The verifier checks account isolation, bookmark persistence, idempotent atomic project creation, pinned plan versions, task progress, stale-note rejection, pause locks, direct-write denial, protected route rendering, and a fresh-session read. `scripts/manage-phase-2b-test-users.mjs` is local-only support for explicitly creating or deleting the two named disposable accounts; it requires the local `SERVICE_ROLE_KEY` in process memory and never writes credentials to disk.

## Phase 3B local verifier

Create one disposable confirmed account without an entitlement and one with a local active entitlement. Provide process-only `PHASE3B_EMAIL_INACTIVE`, `PHASE3B_EMAIL_ACTIVE`, and `PHASE3B_PASSWORD` values, plus local `API_URL`, `ANON_KEY`, `SERVICE_ROLE_KEY`, and `APP_ORIGIN`, then run `pnpm run test:integration:phase3b`.

`scripts/manage-phase-3b-test-users.mjs` creates or removes only the two explicitly named disposable accounts. The verifier covers both account routes, registered safe-catalogue access versus full content, optional empty/selected preference transitions, owner isolation, revision conflicts, forbidden direct writes and self-entitlement, independent profile edits, and fresh-session persistence. Delete the disposable accounts after the run; account-owned rows cascade with them.

## Phase 3C local verifier

With the built app and local Supabase running, expose the local CLI values as `API_URL`, `ANON_KEY`, and `SERVICE_ROLE_KEY`, set `APP_ORIGIN=http://localhost:3000`, and run `pnpm run test:integration:phase3c`.

The verifier provisions its own disposable registered, starter, full, expired, and revoked accounts using the local service role. It checks safe previews/bookmarks, locked-payload minimisation, Pergola-only access, idempotent concurrent project creation, task/note/pause persistence, cross-user denial, starter/full transitions, access windows, and onboarding deep links. It removes every temporary account in `finally` cleanup and does not seed default registration access.

## Hosted rollout checklist

No hosted project has been mutated by this implementation. Before rollout, an authorized operator must review the migration, link the intended Supabase project, apply the migration, configure exact site/redirect URLs, configure SMTP and email templates, configure Google OAuth, and run the hosted smoke tests with dedicated test accounts.
