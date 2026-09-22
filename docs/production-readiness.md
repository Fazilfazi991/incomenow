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

**BACKUP NOT VERIFIED — no authorised logical database connection was available.**

- Project: `incomenow`
- Project ref: `imwiqfmafuamcgqswcfy`
- Environment: production
- Checked in Chrome: project is healthy, on the Free plan, and reports no scheduled backups.
- Supabase CLI: `2.117.0`
- The current CLI profile does not contain this project, and no production database password is present in the release workspace.
- No password was reset, no key was created, and no dump or restore was attempted using a substitute project.
- Backup files, sizes and SHA-256 values: none, because no valid backup could be created.

A default Supabase CLI schema dump is insufficient for this release: it excludes managed `auth` and `storage` schemas and contains neither data nor custom roles by default. The owner-approved backup procedure must therefore capture and verify, outside Git:

1. application/private schema definitions;
2. application data;
3. Auth identities and relevant Auth metadata using a supported scoped Auth recovery/export procedure;
4. custom roles and required grants;
5. Storage metadata, plus object bytes separately once member resources exist;
6. SHA-256 and byte size for every export; and
7. an isolated restore that reconciles the ten Auth identities without exposing emails, password hashes, tokens, or other sensitive fields in logs.

Production migration dry-run and production migration are blocked until that procedure ends in `BACKUP VERIFIED`.

## Production Auth and origin

### Current observed state

- Chrome showed ten Auth identities and Google disabled.
- No entitlement, starter grant, project access, or paid state was changed.
- Exact provider aggregation and intent could not be independently verified without an authorised database export/read connection. Do not infer that all identities are intentional solely because they exist.
- The profile-backfill migration inserts missing `public.profiles` rows from `auth.users` with `on conflict do nothing`; it does not insert membership entitlements or IDEA grants.
- Supabase Site URL is still `http://localhost:3000` with no production redirect URLs.
- Vercel currently has one valid production domain: `https://incomenow.vercel.app`.
- `incomenow.in` is not attached to the Vercel project and did not resolve in DNS when checked.

### Required final URL configuration

The brand target remains `https://incomenow.in`, but it is not yet an operable production origin. After DNS and Vercel domain verification, configure:

- Application `APP_ORIGIN`: `https://incomenow.in`
- Supabase Site URL: `https://incomenow.in`
- Allowed redirect URL: `https://incomenow.in/auth/confirm`
- Allowed redirect URL: `https://incomenow.in/auth/recovery`
- Allowed redirect URL: `https://incomenow.in/auth/callback`
- Email confirmation destination: `https://incomenow.in/auth/confirm`
- Password recovery destination: `https://incomenow.in/auth/recovery`

Use exact production paths. Do not add a production wildcard. If the owner elects to launch first on the existing Vercel domain, apply the same paths under `https://incomenow.vercel.app` and set `APP_ORIGIN` consistently; do not mix origins.

### Google decision

Owner decision is required before launch:

1. **Email/password first:** keep Google disabled in Supabase and replace the working-looking Google action with a clear unavailable/coming-soon state before deployment.
2. **Enable Google:** create and approve the Google OAuth application, set JavaScript origin to the final production origin, set Google’s authorised redirect URI to `https://imwiqfmafuamcgqswcfy.supabase.co/auth/v1/callback`, enable the provider in Supabase, and test the application callback at the selected origin.

Do not deploy the current active-looking Google button while the provider remains disabled.

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
| `pnpm test` | Passed: 48 files passed, one opt-in live-Storage file skipped; 208 tests passed and two live-Storage checks skipped in the normal suite. |
| `pnpm run test:plan-sync` | Passed: 66 stages and 135 tasks. |
| `pnpm run build` | Passed with Next.js 16.3.5. |
| `pnpm run test:db` | Not completed in this preparation run: the default local stack was stopped and Docker Desktop did not become ready within the bounded retry window. No production database was contacted. The accepted release base had already passed all eight pgTAP suites, but that prior result is not represented as a fresh run here. |

The protected-resource dry-run verified all seven local inputs without a network request. A separate opt-in integration run against an isolated local private Supabase bucket passed both tests, including exact hashes and structured data/guide loaders.

## Migration preparation

The production dry-run was **not executed** because backup verification did not pass and the current CLI profile cannot access the named production project. Do not link a different project, merge unsafe history, or bypass this gate.

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

Supabase's current Data API behavior can require explicit grants for new public tables. These migrations already revoke broad access, grant only required columns/actions, enable RLS on exposed tables and create ownership/access policies. The official production `db push --dry-run` must still report exactly the nine files above before approval.

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

## Unresolved owner-approval blockers

1. Provide authorised production database access or an owner-produced official export so the logical backup, Auth recovery coverage and isolated restore can be verified.
2. Attach and validate `incomenow.in`, or explicitly approve `incomenow.vercel.app` as the first production origin.
3. Configure matching Supabase Site URL/redirect URLs and Vercel `APP_ORIGIN`.
4. Decide email/password-only versus enabling Google; do not deploy the current active-looking Google button while Google is disabled.
5. Approve the private bucket/credential model and final artifact upload window.
6. After `BACKUP VERIFIED`, run the official linked production migration dry-run and confirm exactly nine migrations.

Current status: `BLOCKED` pending the items above. No production migration, Storage bucket, artifact upload, deployment, payment enablement or Git push has occurred.
