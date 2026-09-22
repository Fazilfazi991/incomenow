# Production migration results

Date: 2026-09-22  
Production project: `imwiqfmafuamcgqswcfy` (`main`, Production)  
Release branch: `release/five-ideas-v1`  
Release HEAD used: `1e108dc954c9cea052c3cbdc6e61a0309071518e`

## Result

The approved production backend bootstrap completed successfully. No IncomeNow deployment, Git push, payment work, Google OAuth enablement, advertising change, or new feature work was performed.

## Release and backup preflight

- The release worktree was clean before migration and remained on `release/five-ideas-v1`.
- `0f04c49ccfdf984603d33f01252ff82299060fc6` is in the sanitised release ancestry. The current HEAD contains the reviewed release-preparation state plus the final backup-discrepancy documentation update.
- Old `main`, `codex/idea-003-accounting-kit`, `codex/idea-005-resumi`, `feature/idea-004-zerodebt`, and any other pre-sanitisation refs remain unsafe for release unless independently sanitised.
- Immediately before migration, exact production counts were `auth.users = 0` and `auth.identities = 0`.
- Verified recovery artifact, outside Git:
  - filename: `incomenow-production-auth.backup`
  - size: `99,847` bytes
  - SHA-256: `BC958CE907028B7ABD4BB1619A9521B67335149F5013ED446B7539798D8F5F65`
  - created: `2026-09-22T10:49:22.4658678Z`
  - source project: `imwiqfmafuamcgqswcfy`
  - scope: data-inclusive custom-format PostgreSQL backup of the Auth schema; isolated restore previously reproduced the exact zero-user/zero-identity state.

## Database

The linked project ref was rechecked as `imwiqfmafuamcgqswcfy`. Hosted application migration history was empty before bootstrap. The official linked dry run listed exactly the nine approved files and no seed, role, Vault, or additional migration work.

Migration window: `2026-09-22T12:05:41.1231656Z` to `2026-09-22T12:05:57.6480929Z` (CLI exit `0`). Applied history:

1. `20260920112114_phase_2a_auth_membership.sql`
2. `20260920134950_phase_2b_workspace.sql`
3. `20260920160524_phase_3b_account_preferences.sql`
4. `20260920175336_starter_offer_per_idea_access.sql`
5. `20260921105604_clinic_plan_v1.sql`
6. `20260921160723_accounting_kit_plan_v2.sql`
7. `20260921161658_resumi_plan_v1.sql`
8. `20260921161811_zerodebt_plan_v2.sql`
9. `20260922113000_backfill_existing_auth_profiles.sql`

Post-migration verification:

- Published: IDEA #001, #002, #003, #004 and #005.
- Unpublished: IDEA #034.
- Stored plan registry: 7 versions, 66 stages, 135 tasks.
- Current versions: 55 stages, 112 tasks.
- Exact repository/database plan tuple synchronization passed for all 66 stages and 135 tasks.
- All nine expected public application tables have RLS enabled.
- Ten required access/workspace/preferences functions and eleven required triggers were present.
- `anon` has no application-table privilege in the checked set.
- `authenticated` has no insert/update/delete privilege on membership entitlements or IDEA grants.
- The six intended authenticated RPC execute grants were present.
- The migrations created zero memberships, zero IDEA grants, zero projects and zero other paid-access state.

## Auth

- Site URL: `https://incomenow.vercel.app`.
- Exact redirect allow list (three entries only):
  - `https://incomenow.vercel.app/auth/callback`
  - `https://incomenow.vercel.app/auth/confirm`
  - `https://incomenow.vercel.app/auth/recovery`
- New-user signup is enabled, email authentication is enabled, and email confirmation is required.
- Google is disabled. The release UI exposes only the accessible disabled wording `Google sign-in coming soon`.
- A hosted no-delivery signup link exercised account creation and the production confirmation handler. Login, `getUser`, refresh/session persistence, recovery state/token handling and sign-out passed against hosted Auth.
- End-to-end SMTP inbox delivery was not exercised because no owner-controlled disposable inbox was supplied and Supabase rejects reserved test domains. No personal or unrelated address was used.

## Private Storage

Bucket `member-resources` was created and re-read as private. It has no bucket-specific object policy granting anonymous or broad authenticated access. Anonymous public-object access returned HTTP 400, and a disposable ordinary authenticated user could not download an object directly.

Exactly seven manifest-approved objects were uploaded with overwrite disabled and downloaded back for byte-size/SHA-256 verification:

| Resource | Object key | Bytes | SHA-256 |
| --- | --- | ---: | --- |
| Pergola source | `idea-001/pergola-source/universalpergola-main.zip` | 754,291 | `5E4DC492F2BD05869AE7FB77A4C83F66908F96FB6CD6329C4BDA1B36970345B5` |
| Pergola prospects | `idea-001/pergola-prospects/potential-customers.json` | 50,723 | `46D0022AF7D9BC20790C5BABD733F287B210BC1867B9E5F8B6FD95261940610A` |
| Pergola setup guide | `idea-001/pergola-setup-guide/setup-guide-v1.json` | 9,847 | `E6B857D51BF9C2E888ED16CDE6711C9EE432E9051CA728A819CFAE7827A541DF` |
| Clinic source | `idea-002/clinic-source/clinic-operations-crm-distribution.zip` | 1,687,530 | `58600C10281677E528625F0E3B17EBB981352BFFB30366A0E5903E4DED836CDE` |
| Clinic prospects | `idea-002/clinic-prospects/uae-clinic-prospects-v1.json` | 83,595 | `16542CD14B50428C4F57FBBDF6EB616B09D8C8BD420FBFD9AEB05909FB87FA9E` |
| Clinic setup guide | `idea-002/clinic-setup-guide/setup-guide-v1.json` | 18,082 | `3D54A08379290C526243DFA3C509A2C95F6B363B0460B3CFD9C4513BDB99210A` |
| Accounting setup guide | `idea-003/accounting-setup-guide/setup-guide-v1.json` | 12,928 | `7E3890D6C8F7CDC897FB723DB5487F090538A2EB3181BCEC21E2B520BABF9470` |

No Accounting, ZeroDebt or Resumi source archive was uploaded or enabled. No protected artifact is tracked by Git or present under `public/`. The server secret remains server-only; no permanent signed URL is created.

## Hosted smoke tests

The unreleased release worktree was run locally against production Auth, Database and private Storage so application routes could be verified without deploying IncomeNow.

- Signed out: protected app routes redirected/denied.
- Free: five safe catalogue previews and bookmarks worked; kits, projects and protected resources were denied.
- Pergola Starter: full IDEA #001, one idempotent Pergola project, approved Pergola source/prospects/setup resources; IDEA #002-#005 remained preview-only and could not create projects.
- Full member: full IDEA #001-#005, protected Clinic source/finder/CSV/setup, Pergola resources and Accounting setup content worked. Clinic and Pergola ZIP response hashes matched the approved values. All checked protected responses used `Cache-Control: private, no-store`.
- Expired and revoked access lost protected routes immediately.
- Accounting demo and source remain unavailable; Resumi source returned the release-locked response; ZeroDebt source remains unavailable.
- A full-member disposable account created exactly one project for each of IDEA #001-#005 with plan versions `1, 1, 2, 2, 1`. Repeated starts returned the same IDs. Task updates, revisioned stage notes, pause/resume, listing and cross-user isolation passed.
- Direct Storage access did not bypass application authorization.
- Lookup-unavailable fail-closed behavior is covered by the passing route/policy tests; production privileges were not deliberately broken to manufacture an outage.

External read-only checks returned HTTP 200 for Pergola, Clinic, ZeroDebt and Resumi demos. Accounting continues to have no approved public demo URL.

## QA cleanup

Only random, clearly labelled disposable hosted users were created. Each verifier deleted its exact recorded user IDs in `finally` cleanup. Final production counts after all smoke tests:

- `auth.users = 0`
- `auth.identities = 0`
- profiles, entitlements, IDEA grants, bookmarks, projects, project stages, project tasks and project notes = `0`

No unrelated identity or data was modified.

## Advisors and local release verification

Supabase Advisors returned no errors at warning-or-higher level. It returned six warnings for authenticated `SECURITY DEFINER` RPCs: project start/pause/task/note and preference save/skip. These are intentional public RPC boundaries with fixed search paths, narrow execute grants and internal identity/ownership/access validation; hosted cross-user and access-transition tests passed. No out-of-scope advisor remediation was applied.

Local verification on the release branch:

- `pnpm run lint` — passed.
- `pnpm run typecheck` — passed.
- `pnpm test` — passed: 49 files passed, 1 skipped; 210 tests passed, 2 skipped.
- `pnpm run test:db` — passed: 8 pgTAP files, 267 assertions.
- `pnpm run test:plan-sync` — passed: 66 stages, 135 tasks.
- `pnpm run build` — passed with Next.js 16.3.5.

## Remaining deployment actions

- IncomeNow itself was intentionally not deployed. The approved release commit must be deployed only after separate owner approval.
- Before that deployment, configure production server-only `SUPABASE_SECRET_KEY` and `PRIVATE_RESOURCE_BUCKET=member-resources`; never expose the secret through a `NEXT_PUBLIC_*` variable. A redeployment is required for new server environment values to take effect.
- Run one owner-controlled real-inbox confirmation/recovery delivery check after a dedicated QA inbox is available. The handlers and hosted Auth tokens passed; only external email delivery remains unexercised.
- Keep Stripe/payments and Google OAuth disabled.

## Final status

`PRODUCTION BACKEND READY FOR APPLICATION DEPLOYMENT`
