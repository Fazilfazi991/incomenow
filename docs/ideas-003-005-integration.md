# IDEA #003–#005 controlled integration

Date: 2026-09-22

## Integration result

The reviewed Accounting, ZeroDebt, and Resumi work was combined additively on `integration/ideas-003-004-005` from main commit `94ef8a35c7e2ec41bf49400df2a586497f70f770`.

Integrated source history:

- Accounting evidence and implementation: `31f2f554887259c77f92780472d30dbd789131ef`, `6f09bb73fcf923c58ded702cfeac86631db8ecc5`
- ZeroDebt implementation and demo state: `70cbf2f`, `865d79d`, `ee67e6f8365e91b2b72df272c1f7febd8e03e32`
- Resumi implementation: `25499e5e6122871ccfec95c06757704508439ae9`

Conflicts were resolved by preserving the newer Clinic source/prospect work and shared starter access model, then adding the three new published kits. No unrelated work was reset or reverted.

Canonical publication state:

| Idea | State | Current plan |
| --- | --- | --- |
| IDEA #001 Pergola | Published | v1 — 6 stages / 14 tasks |
| IDEA #002 Clinic | Published | v1 — 10 stages / 20 tasks |
| IDEA #003 Accounting | Published | v2 — 12 stages / 24 tasks |
| IDEA #004 ZeroDebt | Published | v2 — 13 stages / 26 tasks |
| IDEA #005 Resumi | Published | v1 — 14 stages / 28 tasks |
| IDEA #034 | Unpublished | none |

All stored versions total 7 plan rows, 66 stages, and 135 tasks. Current versions total 55 stages and 112 tasks.

## Access and member experience

- Signed-out visitors receive public-safe projections only.
- Verified free accounts can browse and bookmark all five safe previews but cannot open protected kit content or start a project.
- Pergola Starter remains bound to IDEA #001 and at most one IDEA #001 project.
- Active full members can open and start projects for all five published ideas.
- Expired, revoked, disabled, unauthenticated, and access-lookup-unavailable states fail closed.
- Bookmarks, project uniqueness, owner isolation, task state, stage notes, pause/resume, and version pinning continue through the shared server-authorized workspace model.
- Accounting, ZeroDebt, and Resumi source redistribution remains unapproved. No new source download was enabled.
- Clinic retains its separately approved, full-member-only sanitised package route.

The public homepage and authenticated catalogue now describe and render five kits consistently. The reusable kit shell dispatches the bespoke Accounting, ZeroDebt, Resumi, and Clinic activity sets without weakening common authorization.

## Local migration verification

Final ordered migration set:

1. `20260920112114_phase_2a_auth_membership.sql`
2. `20260920134950_phase_2b_workspace.sql`
3. `20260920160524_phase_3b_account_preferences.sql`
4. `20260920175336_starter_offer_per_idea_access.sql`
5. `20260921105604_clinic_plan_v1.sql`
6. `20260921160723_accounting_kit_plan_v2.sql`
7. `20260921161658_resumi_plan_v1.sql`
8. `20260921161811_zerodebt_plan_v2.sql`
9. `20260922113000_backfill_existing_auth_profiles.sql`

The ninth migration is an idempotent compatibility migration for a production bootstrap where Auth users predate the application schema. It inserts only missing minimal `public.profiles` rows and never overwrites an existing profile.

Two disposable Supabase projects on non-default ports were used:

- Fresh database from zero: all nine migrations applied in timestamp order; 8 pgTAP files / 267 assertions passed; database lint reported no schema errors.
- Upgrade path: the Clinic/main state was verified before applying Accounting, Resumi, and ZeroDebt. The later 8→9 replay restored a deliberately missing profile for a pre-existing Auth identity. The final 8 pgTAP files / 267 assertions passed and database lint reported no schema errors.

Both paths finished with IDEA #001–#005 published, IDEA #034 unpublished, and 7 plan versions / 66 stages / 135 tasks. Repository-to-database plan synchronization passed.

## Hosted Supabase assessment

### Environment and linkage

- Environment type: intended production
- Project name: `incomenow`
- Project reference: `imwiqfmafuamcgqswcfy`
- Dashboard branch label: `main` / `PRODUCTION`
- Region/compute: Northeast Asia (Tokyo), `ap-northeast-1`, Nano on the Free plan
- Repository linked to Supabase: no; no local `supabase/.temp/project-ref` exists and the dashboard has no connected Git repository
- Supabase branches: none
- Current hosted migration version: none; the migration page offers the first migration
- Hosted public schema: no tables or views
- Hosted Storage: no buckets
- Hosted Edge Functions: none
- Hosted backups: none shown in the dashboard

### Auth configuration

- Ten existing hosted Auth users were observed. Their identities were not copied into this report.
- New signups are allowed.
- Email/password is enabled and email confirmation is required.
- Anonymous sign-in and manual identity linking are disabled.
- Google and all other OAuth providers are disabled.
- Site URL is still `http://localhost:3000`; no redirect URLs are configured.

The application expects Google sign-in in addition to email/password, so production OAuth credentials, callback URLs, and the final site URL remain launch blockers. No hosted Auth smoke account was created because this is production and migration approval has not been given.

### Configured repository environment names

The repository contains only `.env.example` with:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `APP_ORIGIN`

No environment or service-role value is recorded here. Service-role credentials remain server-only and must never use a `NEXT_PUBLIC_` name.

## Hosted migration comparison

Hosted migration history is empty while the reconciled local history contains the nine migrations listed above. Therefore a future production bootstrap would apply all nine migrations, not only the three idea-plan migrations.

Dry review findings:

- No timestamp conflicts or duplicate migration versions were found.
- The idea-plan migrations use stable identifiers, preserve historical Accounting/ZeroDebt plan versions, and make only their intended versions current.
- Final publication state is deterministic: IDEA #001–#005 published; IDEA #034 unpublished.
- No table drop, column drop, truncate, or destructive data reset is present.
- RLS and grants are created or tightened for account-owned profiles, entitlements, bookmarks, projects, stages, tasks, notes, preferences, and per-idea grants.
- Ordinary authenticated users cannot create or mutate paid entitlements or per-idea grants.
- The production-only compatibility concern—ten Auth users existing before the profile trigger—was addressed by the new idempotent profile backfill.

The repository remains deliberately unlinked. No `supabase db push`, hosted dry-run, migration repair, or remote SQL was executed.

## Auth, RLS, and browser smoke results

- Local email/password sign-in succeeded with a disposable confirmed full-member account.
- Optional onboarding skipped successfully and routed to the authenticated library.
- The full-member library rendered five published kits with correct access/resource labels and no browser console errors.
- Signed-out public Chrome verification rendered the five-card homepage and account-aware starter CTA without a framework overlay.
- Database suites cover free, Pergola Starter, active full, expired, revoked, unavailable, publication, project uniqueness, project plan, task, note, pause/resume, and cross-user RLS behavior.
- All disposable local QA accounts and stacks were removed or stopped after verification. No hosted user was changed.

## Production migration plan

**READY FOR HOSTED PRODUCTION MIGRATION**

Do not apply yet. Owner approval is still required.

Before approval:

1. Create and independently verify a logical backup/export. The current Free-plan dashboard shows no backups.
2. Confirm the ten existing Auth identities are intentional and decide which, if any, should receive full or starter entitlement. The migrations grant no paid access.
3. Set the production Site URL and allowed redirect URLs.
4. Configure approved Google OAuth credentials only if Google sign-in is intended at launch.
5. Link the repository or run an authenticated `supabase db push --dry-run` against the exact project ref, then confirm the nine-file plan is unchanged.

Rollback considerations:

- Prefer a verified pre-migration backup and forward fixes. The migrations create interrelated RLS-protected tables, functions, triggers, policies, and plan definitions; a blind down migration would risk workspace and entitlement data.
- If a bootstrap migration fails, stop, preserve logs and database state, restore the verified backup when necessary, and reconcile migration history before retrying.
- Do not delete existing Auth users. The profile backfill is intentionally idempotent and contains no entitlement grant.

Post-approval smoke plan:

1. Verify email signup/confirmation/login and Google only if configured.
2. Use disposable accounts for free, Pergola Starter, active full, expired, and revoked states.
3. Verify IDEA #001–#005 previews and full access, bookmark isolation, one-project-per-user-per-idea uniqueness, task/note ownership, pause/resume, Clinic protected download headers/hash, and failure-closed lookup behavior.
4. Delete only the disposable test accounts and confirm their application rows cascade cleanly.

## Storage and remaining production actions

No source ZIP, prospect workbook, or research file was moved to hosted Storage. Existing private server-side resources remain outside `public/` and Git. If serverless production later requires object storage, design a private bucket and signed, freshly authorized download policy separately; never use a public bucket for protected packages.

Remaining work is owner-authorized production migration, backup verification, final Auth URLs/providers, hosted environment values, hosted smoke tests, domain/Google verification, and any separately approved private-Storage design. Payment processing, final commercial terms, automatic renewal, push, and deployment remain deferred.
