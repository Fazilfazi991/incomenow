# Clinic CRM distribution readiness

Date: 2026-09-21

Status: **OWNER-APPROVED FOR PROTECTED FULL-MEMBER DISTRIBUTION**

Technical sanitisation is complete. On 2026-09-21, the owner approved only the exact sanitised distribution package identified below for delivery to authorised IncomeNow full members. The preserved original archive remains excluded.

## Preserved original

- Exact local path: `C:\Users\USER\Downloads\besmile-production-readiness.zip`
- Size: 14,202,553 bytes.
- ZIP entries: 920.
- Uncompressed content: 17,683,048 bytes.
- SHA-256: `7958426B74F454EE0A346FBB18D968ED56A3063AC6B2E3BD7D1302070D731662`.
- The original was read and freshly extracted for this audit but was not modified, replaced, moved, committed, published, or used as the member download.
- The archive contains no `.git` directory, so source-project Git history and historical credential exposure could not be inspected.

## Sanitised distribution package

- Local ignored path: `private-resources/clinic/clinic-operations-crm-distribution.zip`.
- Size: 1,687,530 bytes.
- ZIP entries: 705.
- Uncompressed content: 4,239,161 bytes.
- SHA-256: `58600C10281677E528625F0E3B17EBB981352BFFB30366A0E5903E4DED836CDE`.
- Packaging is deterministic in ordering and uses a fixed archive timestamp.
- The archive is not in `public/`, is ignored by an exact Git rule, and is not tracked.

## Original versus distribution

The distribution copy preserves application source, pnpm lockfile, migrations, tests, safe example configuration, setup documentation, dependency notices, synthetic fixtures, and the font licence required by document generation.

Excluded or replaced:

- All QA artifact batches, screenshots, generated reports, and the test upload executable.
- Staff portraits, employee demo photos, organisation-chart portraits, and branded letterhead assets.
- Personal staff/owner/source-author emails, phone numbers, names, user UUIDs, hosted QA project references, and the private workstation workbook path.
- One hard-coded temporary staff password that was encoded as character codes; the affected operational scripts now require an environment-managed QA password.
- Real environment files, local databases, uploads, exports, browser state, logs, coverage, caches, dependency trees, build output, secondary npm lockfile, and nested archives.
- The branded letterhead image dependency was replaced with a generated neutral document frame; document-generation tests continue to pass.
- Vulnerable dependency resolutions were updated to non-major patched versions. No major dependency upgrade was performed.

## Health and personal-data audit

### SAFE SYNTHETIC DATA

- Explicit demo-patient and restricted-access fixtures marked with `is_demo`, demo identifiers, or `.test` addresses.
- QA and E2E records contained only in test or seed code and consistently converted to synthetic identities.
- Placeholder environment names and empty/example values.

### POTENTIALLY REAL DATA

- Original migrations, scripts, configuration, and tests contained staff-shaped identities and operational references. Every detected instance was replaced consistently with synthetic role fixtures in the distribution copy.
- General product branding, icons, and four residual public image/icon assets have not been independently proven owner-created; their rights remain part of the owner approval decision.

### CONFIRMED PRIVATE DATA

- Identifiable staff and organisation-chart portrait assets.
- Real-looking staff emails and phone numbers, release-author identifiers, hosted project references, hard-coded user identifiers, and a machine-local workbook path.
- An encoded temporary staff password used by operational scripts.

All confirmed private material was excluded or replaced. Values are intentionally not reproduced in this document.

### UNKNOWN

- No real patient record, appointment record, medical history, diagnosis, prescription, treatment note, insurance record, lab result, imaging record, uploaded customer document, CSV export, SQL dump, or local database was found in the distribution copy.
- The application code still implements sensitive patient, clinical-note, prescription/document, insurance, and private-upload workflows. This is capability, not included customer data, and still requires independent privacy, security, legal, architecture, retention, backup, and customer-acceptance review before real use.

## Secret and credential result

The final staged package contains:

- No `.env`, `.env.local`, production environment file, private-key marker, JWT-shaped value, AWS access key, database URL, hosted Supabase URL, forbidden personal email domain, original hosted project reference, or original workstation path.
- Two example environment files containing placeholder or blank values only.
- No hard-coded password or encoded credential marker.

The source archive did not contain Git history, so historical secret scanning is unavailable. No credential rotation was attempted.

## Dependency result

- Tool: `pnpm audit` using pnpm 11.19.0 on 2026-09-21.
- Original lockfile result: seven advisories — three high and four moderate; zero critical.
- Affected dependency families: `js-yaml`, `postcss`, `vitest`, and `@vitest/mocker`.
- Distribution result after non-major patched resolutions: zero reported advisories across 611 dependency metadata entries; the clean install materialised 502 packages.
- This scanner result does not establish that the application is secure.

## Malware and suspicious-file result

- Scanner: Microsoft Defender Antivirus custom scan.
- Signature version: `1.459.317.0`, updated 2026-09-21 07:17 local time.
- Exact staged distribution tree: zero new detections.
- Final ZIP: zero new detections.
- No executable, dynamic library, script-host binary, local database, nested archive, or long base64-like payload is included.
- Manual execution-primitive review found a Markdown PowerShell code-fence label and the release-gate script spawning this project's own local Next server. Neither was classified as malware.
- A zero-detection scan is not a security or production-readiness guarantee.

## Licence and redistribution inventory

- **Owner authorization:** on 2026-09-21 the owner explicitly approved the sanitised package with SHA-256 `58600C10281677E528625F0E3B17EBB981352BFFB30366A0E5903E4DED836CDE` for delivery to authorised IncomeNow full members. The approval does not cover the original archive or grant unrestricted resale/redistribution rights. The project remains marked `private` and `UNLICENSED`.
- **Open-source dependencies:** `pnpm licenses list --json` reported 486 installed package licence records. Groups include MIT, ISC, Apache-2.0, BSD, MPL-2.0, Python-2.0, Creative Commons, BlueOak, 0BSD, Zlib, and combined expressions; no unknown/unlicensed dependency group was reported.
- **Font:** the bundled Manjari files include `src/assets/fonts/OFL-Manjari.txt`.
- **Icons:** Lucide is installed as an ISC-licensed dependency.
- **Third-party or unknown-rights assets:** project branding plus the remaining icons/images require owner confirmation. Personal portraits and branded letterhead were excluded.

This inventory is technical evidence, not a legal conclusion. Owner approval is recorded for the fixed sanitised package and stated member-delivery scope; no independent legal review of retained project-specific asset rights was performed.

## Fresh-package verification

The final ZIP was extracted to a new temporary directory with no `node_modules` or `.next` directory. Only the packaged README was used.

- `pnpm --version` — 11.19.0.
- `pnpm install --frozen-lockfile` — passed; 502 packages installed and the lockfile supply-chain policy check passed.
- `pnpm run typecheck` — passed.
- `pnpm run lint` — passed with 25 pre-existing warnings and no errors.
- `pnpm test` — passed: 831 tests across 192 files.
- `pnpm run build` — passed: 88 routes/pages generated with isolated local placeholder configuration.
- `pnpm start -p 3400` — started successfully; `GET /sign-in` returned 200. The temporary server was stopped.
- No migration, seed, smoke, release, upload, email, push, cron, or hosted-service command was run.

## IncomeNow release gate

Canonical application state:

- `technicalPackageReady: true`
- `redistributionApproved: true`
- `approvalDate: 2026-09-21`
- `approvedPackageSha256: 58600C10281677E528625F0E3B17EBB981352BFFB30366A0E5903E4DED836CDE`
- `approvedPackageSizeBytes: 1,687,530`

The protected `/app/resources/clinic-source` handler performs a fresh verified-account and IDEA #002 access check, additionally requires the decision source to be `full-membership`, and fails closed when access is unavailable. It can serve only `clinic-operations-crm-distribution.zip` from the ignored private-resource path. Before returning bytes, it verifies the exact approved size and SHA-256. Successful responses retain `application/zip`, the fixed attachment filename, `Cache-Control: private, no-store`, and `X-Content-Type-Options: nosniff`.

Signed-out, registered/free, Pergola Starter, active non-membership grant, expired/revoked, unavailable-access, approved full-member, hash-mismatch, and missing-file behavior are covered by route and local integration tests. The original archive is never read by the route.

## Remaining technical and legal boundaries

Approval changes the narrow delivery gate only. The package is not represented as healthcare compliant, production certified, production ready, or independently security audited. Customer-specific production configuration, privacy/security/legal review, retention and deletion decisions, attachment scanning, hosted acceptance, backup/recovery rehearsal, monitoring, and operational ownership remain required.

No push, deployment, hosted Supabase mutation, credential rotation, or original-archive publication was performed. The approved sanitised source route is enabled only in the local implementation pending owner review.
