# Five-idea production readiness

Prepared from the approved sanitised release candidate. This is an owner-approval packet, not permission to migrate or deploy.

## Release history

- Release branch: `release/five-ideas-v1`
- Sanitised release base: `0f04c49ccfdf984603d33f01252ff82299060fc6`
- Remote checked: `origin` at `https://github.com/Fazilfazi991/incomenow.git`
- `origin/main`: `0ebd10cd573f6ab73d0246e1d64d6fe9ddbe0edd`
- Relationship: `origin/main` is an ancestor of the release branch. A future release can use a normal fast-forward path; no force push or unsafe merge is required.
- No remote branch contained the sanitised release commit when checked.

### Unsafe local refs

| Ref | Protected historical commit reachable? | Safe to push as-is? | Required action |
| --- | --- | --- | --- |
| `release/five-ideas-v1` | No | Yes, subject to final approval | Only push this reviewed sanitised lineage. |
| `integration/ideas-003-004-005` | No | Yes, but not the named release ref | Preserve as the accepted integration reference. |
| `origin/main` | No | Yes | May be fast-forwarded by the approved release later. |
| `main` | `23853e2…`, `49f85d2…` | **No** | Never push as-is. Do not merge it into the release branch. |
| `codex/idea-003-accounting-kit` | `23853e2…` | **No** | Never push as-is. Preserve locally until the owner approves retirement. |
| `codex/idea-005-resumi` | `23853e2…`, `49f85d2…` | **No** | Never push as-is. Preserve locally until the owner approves retirement. |
| `feature/idea-004-zerodebt` | `23853e2…`, `49f85d2…` | **No** | Never push as-is. Preserve locally until the owner approves retirement. |

The pre-sanitisation commits `18989b3…` and `072a749…` remain as unreachable local objects but are not reachable from a named local or remote ref. Reflogs and unreachable objects are not a release path.

## Production backup

**BACKUP VERIFIED — both custom archives are structurally valid, their aggregate data matches production, and both restored successfully in an isolated disposable PostgreSQL 17 environment.**

- Project: `incomenow`
- Project ref: `imwiqfmafuamcgqswcfy`
- Environment: production
- Checked in Chrome: project is healthy, on the Free plan, and reports no scheduled backups.
- Source PostgreSQL: `17.6`; backup client: `pg_dump 17.11`; Supabase CLI: `2.117.0`.
- Backup creation UTC: `2026-09-22T10:50:38.352115Z`.
- Storage objects requiring backup: `0` (`0` buckets and `0` objects).
- Aggregate SQL returned `0` Auth users and `0` identities. A final pre-migration recheck at `2026-09-22T11:45:05Z` returned the same exact counts.
- Essential Auth counts were also `0` for sessions, refresh tokens, MFA factors, MFA challenges and audit-log entries.
- The password was never written to Git, documentation, command output or either archive.

### Auth count discrepancy resolved

The production Dashboard still renders `Total: 10 users (estimated)` while its user grid contains no rows. This is not a record count. Production metadata reports `pg_class.reltuples = -1` for `auth.users`, meaning the table has no analyzed row statistic. Supabase Studio's optimized Users page uses an `EXPLAIN` planner estimate when `reltuples = -1`; production `EXPLAIN (FORMAT JSON) SELECT * FROM auth.users` reports `Plan Rows: 10`. The exact `COUNT(*)` is `0`. The apparent ten users were therefore PostgreSQL's default plan estimate for a never-analyzed table, surfaced by the Dashboard as explicitly estimated—not ten Auth records. This behavior matches Supabase Studio's current [`getUsersCountSQL`](https://github.com/supabase/supabase/blob/master/packages/pg-meta/src/sql/studio/auth/get-users-count.ts) implementation.

| Archive | Included schema | Bytes | SHA-256 | Verification |
| --- | --- | ---: | --- | --- |
| `incomenow-production-auth.backup` | `auth` | 99,847 | `BC958CE907028B7ABD4BB1619A9521B67335149F5013ED446B7539798D8F5F65` | Valid custom archive; 257 TOC entries; required user, identity, session and refresh-token table/data sections present; full isolated restore passed with 27 Auth tables and all essential aggregate counts matching production. |
| `incomenow-production-public.backup` | `public` | 1,652 | `BD3A8A4D199F8738EB5078E9A8F6EADE0323C3A3AEC13F446155E0E3DE3189BA` | Valid custom archive; 8 TOC entries; full isolated restore passed with zero public tables, matching production. |

The restricted backup directory and metadata remain outside the repository under `Documents/IncomeNow-private-backups/imwiqfmafuamcgqswcfy/20260922T104922Z`. The Auth artifact was created from project `imwiqfmafuamcgqswcfy` through the Supabase shared session pooler with SSL using `pg_dump 17.11`, custom format, and `--schema=auth`; credentials are omitted. Its archive is data-inclusive: the table of contents contains `TABLE DATA` sections for users, identities, sessions, refresh tokens, MFA factors, MFA challenges and audit-log entries. It was not created from local Supabase or either disposable restore database; the contemporaneous metadata records the production project ref and connection method, and the archive predates the disposable restore environments.

On `2026-09-22`, both archives were restored twice into separate disposable `postgres:17-alpine` containers using `--no-owner` and `--no-privileges`. The final recheck restored 27 Auth base tables, all seven required Auth tables and the `auth.uid()`, `auth.role()`, `auth.email()` and `auth.jwt()` helper functions. Users, identities, sessions, refresh tokens, MFA factors, MFA challenges and audit-log entries all exactly matched the current production aggregate value of zero. The restored public schema contained zero tables. Each disposable container was removed after verification. No restore was attempted against production.

## Production Auth and origin

### Current configured state

- Supabase Site URL: `https://incomenow.vercel.app`.
- Exact redirect allowlist: `https://incomenow.vercel.app/auth/callback`, `https://incomenow.vercel.app/auth/confirm`, and `https://incomenow.vercel.app/auth/recovery`.
- Email/password is enabled; email confirmation is required.
- Google remains disabled in Supabase.
- Login and registration now show a disabled “Google sign-in coming soon” control. The existing server-side Google action remains in the codebase for a future approved launch.
- Local browser verification confirmed no active Google submit action, no framework overlay and no console warning/error.
- No entitlement, starter grant, project access, or paid state was changed.
- The profile-backfill migration inserts missing `public.profiles` rows from `auth.users` with `on conflict do nothing`; it does not insert membership entitlements or IDEA grants.
- Vercel currently has one valid production domain: `https://incomenow.vercel.app`.
- `incomenow.in` is not attached to the Vercel project and did not resolve in DNS when checked.

### Required final URL configuration

The current production-preparation origin is `https://incomenow.vercel.app`. The brand target remains `https://incomenow.in`, but it is not yet an operable production origin. After DNS and Vercel domain verification, replace the Site URL, all three exact redirects and `APP_ORIGIN` together:

- Application `APP_ORIGIN`: `https://incomenow.in`
- Supabase Site URL: `https://incomenow.in`
- Allowed redirect URL: `https://incomenow.in/auth/confirm`
- Allowed redirect URL: `https://incomenow.in/auth/recovery`
- Allowed redirect URL: `https://incomenow.in/auth/callback`
- Email confirmation destination: `https://incomenow.in/auth/confirm`
- Password recovery destination: `https://incomenow.in/auth/recovery`

Use exact production paths. Do not add a production wildcard or mix origins.

### Google decision

The initial launch decision is email/password only. Google credentials were not created, the provider remains disabled, and the interface no longer initiates its OAuth flow. Future Google enablement still requires a separately approved Google OAuth application and end-to-end callback testing.

## Private member-resource architecture

The application now uses one server-only `PrivateResourceStore` contract:

- `exists(resourceId)`
- `getMetadata(resourceId)`
- `read(resourceId)`

Providers:

- Development/test: ignored local filesystem under the metadata-only manifest.
- Production: private Supabase Storage through the same logical resource IDs.

Proposed bucket: `member-resources`, with `public = false`. Do not add anonymous or general authenticated-user read policies. Server routes remain authoritative: authenticate, re-check current IDEA/full-member access, check release state, resolve a fixed manifest ID, read via a server-only credential, and return private/no-store content. Object paths never grant access by themselves.

The manifest is the single source for logical ID, IDEA ID, local path, production object key, expected SHA-256, byte size, content type and approval state. Protected bytes and prose remain outside Git.

The current protected routes continue proxying bytes through IncomeNow after authorization. No permanent signed URL is exposed. Dataset loaders read private JSON server-side, validate it, and project only the existing approved fields.

If credentials, bucket, metadata or an object are missing, availability checks fail closed and the catalogue removes the download action rather than advertising a broken resource.

### Provisioning process

Operator command:

```powershell
pnpm run resources:provision -- --dry-run
```

Dry-run is the default and verifies every local byte size and hash without making a network request. `--apply` requires an already-created private bucket and server-only credential. It refuses a public bucket, refuses unexpected existing bytes, uploads with `upsert: false`, and downloads each uploaded object to verify its exact hash and size.

Production provisioning has not been run. The seven locally approved inputs are ready for an owner-authorised upload only after the production bucket and credential plan are approved.

| Resource ID | Proposed private object key | Bytes | SHA-256 | Release state |
| --- | --- | ---: | --- | --- |
| `pergola-source` | `idea-001/pergola-source/universalpergola-main.zip` | 754,291 | `5E4DC492F2BD05869AE7FB77A4C83F66908F96FB6CD6329C4BDA1B36970345B5` | Owner approved |
| `pergola-prospects` | `idea-001/pergola-prospects/potential-customers.json` | 50,723 | `46D0022AF7D9BC20790C5BABD733F287B210BC1867B9E5F8B6FD95261940610A` | Member delivery approved |
| `pergola-setup-guide` | `idea-001/pergola-setup-guide/setup-guide-v1.json` | 9,847 | `E6B857D51BF9C2E888ED16CDE6711C9EE432E9051CA728A819CFAE7827A541DF` | Member delivery approved |
| `clinic-source` | `idea-002/clinic-source/clinic-operations-crm-distribution.zip` | 1,687,530 | `58600C10281677E528625F0E3B17EBB981352BFFB30366A0E5903E4DED836CDE` | Owner approved |
| `clinic-prospects` | `idea-002/clinic-prospects/uae-clinic-prospects-v1.json` | 83,595 | `16542CD14B50428C4F57FBBDF6EB616B09D8C8BD420FBFD9AEB05909FB87FA9E` | Member delivery approved |
| `clinic-setup-guide` | `idea-002/clinic-setup-guide/setup-guide-v1.json` | 18,082 | `3D54A08379290C526243DFA3C509A2C95F6B363B0460B3CFD9C4513BDB99210A` | Member delivery approved |
| `accounting-setup-guide` | `idea-003/accounting-setup-guide/setup-guide-v1.json` | 12,928 | `7E3890D6C8F7CDC897FB723DB5487F090538A2EB3181BCEC21E2B520BABF9470` | Member delivery approved |

### Local adapter verification

- Filesystem provider unit tests: passed.
- Supabase Storage provider unit tests using a deterministic Storage-compatible client: passed.
- Isolated local Supabase bucket `member-resources`, `public = false`: passed.
- Seven uploads and post-upload hash/size verification: passed.
- Pergola dataset projection: 77 records passed.
- Clinic dataset projection: 100 records passed.
- Pergola, Clinic and Accounting protected guide parsing: passed.
- Production Storage was not contacted or changed.

## Release verification

Executed on `release/five-ideas-v1` after the production-preparation changes:

| Command | Result |
| --- | --- |
| `pnpm run lint` | Passed. |
| `pnpm run typecheck` | Passed. |
| `pnpm test` | Passed: 49 files passed, one opt-in live-Storage file skipped; 210 tests passed and two live-Storage checks skipped. |
| `pnpm run test:plan-sync` | Passed: 66 stages and 135 tasks. |
| `pnpm run build` | Passed with Next.js 16.3.5. |
| `pnpm run test:db` | Passed against a fresh Docker-backed local Supabase database: eight pgTAP files and 267 assertions passed. All nine migrations were applied from zero before the run. |

The protected-resource dry-run verified all seven local inputs without a network request. A separate opt-in integration run against an isolated local private Supabase bucket passed both tests, including exact hashes and structured data/guide loaders.

A tracked-only clean clone of local commit `849014c` also passed install, lint, typecheck, production build and the application suite. Its expected unavailable-resource result was 192 tests passed and 18 artifact-dependent/opt-in checks skipped; no protected artifact was present or reconstructed.

## Migration preparation

The release worktree is linked to production project `imwiqfmafuamcgqswcfy`. Remote migration history is empty. No migration was applied.

Official command:

```powershell
supabase db push --linked --dry-run --include-all --skip-vault
```

Result: **PASS**. The CLI proposed exactly the following nine migrations:

The release contains exactly these nine ordered migrations:

1. `20260920112114_phase_2a_auth_membership.sql`
2. `20260920134950_phase_2b_workspace.sql`
3. `20260920160524_phase_3b_account_preferences.sql`
4. `20260920175336_starter_offer_per_idea_access.sql`
5. `20260921105604_clinic_plan_v1.sql`
6. `20260921160723_accounting_kit_plan_v2.sql`
7. `20260921161658_resumi_plan_v1.sql`
8. `20260921161811_zerodebt_plan_v2.sql`
9. `20260922113000_backfill_existing_auth_profiles.sql`

Static SQL review found no `DROP TABLE`, `DROP COLUMN`, `TRUNCATE`, Auth-user deletion, automatic paid-access grant, Storage exposure, or broad `GRANT ALL`. Expected changes are additive tables, RLS, narrowly scoped grants, ownership policies, protected functions/triggers, immutable plan data and the conflict-safe profile backfill.

Direct production aggregates currently report zero Auth users. If users are created before migration approval, the same idempotent backfill will add only missing minimal profiles. It never inserts full membership, Pergola Starter, IDEA grants or projects.

Supabase's current Data API behavior can require explicit grants for new public tables. These migrations already revoke broad access, grant only required columns/actions, enable RLS on exposed tables and create ownership/access policies. The official production dry-run reported exactly the nine files above.

## Environment inventory

Chrome showed only `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` and `APP_ORIGIN` configured in the current Vercel project. Values were not copied into this document.

| Variable | Classification | Required purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Public | Browser/server Supabase project URL. |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Public | Publishable browser key; RLS remains authoritative. |
| `APP_ORIGIN` | Server-only | Exact trusted application origin for Auth redirects. |
| `PRIVATE_RESOURCE_PROVIDER` | Server-only | Set to `supabase-storage` in production. |
| `PRIVATE_RESOURCE_BUCKET` | Server-only | Private bucket name; proposed value `member-resources`. |
| `SUPABASE_SECRET_KEY` | Server-only secret | Elevated Storage reads/uploads; never use a `NEXT_PUBLIC_` prefix. Legacy `SUPABASE_SERVICE_ROLE_KEY` is accepted only as a migration fallback. |
| `PRIVATE_RESOURCE_LOCAL_ROOT` | Development only | Optional local ignored resource root; not required in production. |

Stripe keys, checkout, webhooks, permanent Storage URLs and Google credentials are not needed for the email/password-only preparation option. No payment variable was added.

## Hosted smoke-test plan

After backup, approved migration, Auth URL configuration, deployment and private resource provisioning:

1. Create disposable confirmed users for FREE, Pergola Starter, full member, expired and revoked states.
2. Verify signup, confirmation and login using the selected production origin.
3. Confirm all five safe previews and bookmarks for FREE.
4. Confirm Pergola Starter unlocks only IDEA #001 and creates at most one IDEA #001 project.
5. Confirm full membership opens IDEA #001–#005 and does not duplicate existing projects.
6. Verify tasks, notes, optimistic-conflict behavior, pause/resume and immutable plan versions.
7. Verify Pergola and Clinic source, setup and protected prospect resources; compare downloaded bytes to the manifest.
8. Verify missing, expired, revoked and lookup-unavailable access fails closed.
9. Verify one user cannot read or mutate another user's projects, tasks or notes.
10. Remove all disposable entitlements, grants, projects, notes, profiles and Auth users created by the smoke test, then confirm cleanup by count only.

## Production mutations already performed

- Supabase Auth Site URL changed from localhost to `https://incomenow.vercel.app`.
- The three exact callback, confirmation and recovery redirect URLs were added.
- The owner reset the production database password so the backup could be created.
- A Supabase CLI access token named `incomenow-production` was created for the exact project account.

The aggregate verification query and migration dry-run were read-only. Linking the release worktree changed local CLI metadata only. No schema migration, user mutation, Storage bucket, object upload, deployment, payment enablement or Git push occurred.

## Remaining production actions

The backup restore and fresh Docker-backed pgTAP blockers are resolved. Production migration, deployment, private Storage provisioning and payment enablement remain intentionally unperformed and require their own explicit approvals.

`APP_ORIGIN` must be set to `https://incomenow.vercel.app` in the eventual approved production deployment. The `member-resources` bucket and seven artifact uploads remain intentionally deferred.

Current status: `READY FOR HOSTED PRODUCTION MIGRATION — awaiting explicit owner approval before applying any migration.`

## Final owner approval packet

- **BACKUP:** VERIFIED — archives, structures, hashes, isolated restore and aggregate reconciliation pass.
- **AUTH:** CONFIGURED — temporary production origin and three exact redirects saved; email/password enabled; Google disabled.
- **MIGRATION DRY RUN:** PASS — exact linked production project, empty remote history, exactly nine migrations proposed.
- **MIGRATIONS PROPOSED:** 9, listed in order above.
- **DATABASE TESTS:** PASS — fresh local database applied all nine migrations; eight pgTAP files and 267 assertions passed.
- **FINAL STATUS:** READY FOR HOSTED PRODUCTION MIGRATION — stop before applying migrations and wait for explicit owner approval.
