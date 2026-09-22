# ZeroDebt distribution readiness

Review date: 2026-09-22

Status: **technical package prepared; redistribution not approved**.

Owner decision A is **NO / not approved yet**. `redistributionApproved` remains `false`; no source URL, archive route, or download action is exposed. Written redistribution permission or a project licence, plus logo, mascot, and asset provenance, still need confirmation.

Owner decision B is **YES** for deployment of the separate synthetic public demo only. The verified Vercel result is recorded below and in `docs/zerodebt-demo-results.md`; this approval does not grant source redistribution permission.

The original ZeroDebt checkout was preserved. Package preparation happened in the ignored `private-resources/zerodebt/` area and did not alter the source repository.

## Source and ownership review

- Source repository: `https://github.com/Fazilfazi991/FinancePublic.git`
- Inspected source commit: `e5d3b4f600993414a5a277f64bc6d0c95da02c3e`
- Local safe-demo/package base commit: `b0763b74ba5cbcdeb1b0450dbd1406d99111551e`
- Repository owner and principal upstream commit author: GitHub account `Fazilfazi991`.
- Local demo hardening commit author: `Codex <codex@local>`.

Repository ownership, public visibility, and commit authorship are evidence of control and contribution, not a redistribution licence.

### Licence state

No project-level `LICENSE`, `COPYING`, `NOTICE`, or package licence declaration was present at the reviewed commits. GitHub's licensing guidance states that, without a licence, default copyright applies. The current repository therefore provides no documented permission to IncomeNow to reproduce, sell, sublicense, or redistribute the project or derivatives.

Redistribution remains blocked until the owner:

1. confirms authority over the application code and visual assets;
2. supplies an explicit project licence or an IncomeNow member-distribution grant;
3. confirms that the selected terms are compatible with all third-party notices; and
4. approves this exact sanitised archive for release.

This is a release gate, not legal advice.

### Third-party code and assets

| Material | Identified terms | Readiness note |
| --- | --- | --- |
| `components/ui/*` shadcn/ui pattern | MIT | Included MIT text in `licenses/shadcn-ui-MIT.txt`; preserve notices. |
| `lucide-react` icons | ISC, with Feather attribution in the upstream licence | Preserve the installed dependency licence. |
| Radix UI primitives | MIT | Preserve installed dependency licences. |
| Inter through `next/font/google` | SIL Open Font License 1.1 | Next.js self-hosts the build output; preserve font terms. |
| JavaScript dependency tree | Mixed licences | `pnpm licenses list --json` reported 648 package/licence records: MIT 565, ISC 29, Apache-2.0 22, BSD-2-Clause 11, BSD-3-Clause 10, MPL-2.0 3, BlueOak-1.0.0 2, and six other records. Re-audit after dependency changes. |
| Optional OCR Python tree and OCR models | Mixed package and model terms | Package licences and any downloaded model licences require a separate review before OCR is enabled or redistributed as a service image. The Docker base uses the mutable `python:3.12-slim` tag. |
| ZeroDebt logos, favicons, application icons, and assistant mascot | No separate licence/provenance record found | The owner account committed the assets, but source design files, stock receipts, generation records, and a commercial redistribution declaration were not found. Owner confirmation is required. |

Unused starter `next.svg` and `vercel.svg` files were removed from the package. No vendored dependency directory or separately attributed copied application module was identified. That is a repository inspection result, not an originality determination.

## Sanitised source package

| Field | Value |
| --- | --- |
| Filename | `zerodebt-source-b0763b7-sanitised.zip` |
| SHA-256 | `f8be17dc2291635876c744b9cc68a1ccc17df94630a1123284f447b979c6dfbc` |
| Size | 3,671,384 bytes |
| ZIP entries | 268 |
| Uncompressed entry bytes | 4,450,517 |
| Storage | Ignored `private-resources/zerodebt/readiness-20260921/` area |

The ZIP contains the application source, `package.json`, `pnpm-lock.yaml`, safe `.env.example`, Supabase migrations and tests, setup/product/design documentation, package-specific licence status and third-party notices, the optional OCR service source, and synthetic demo fixtures. `PACKAGE-MANIFEST.txt` lists the other 267 entries; the manifest itself is entry 268.

Package-only release hardening pinned PostCSS 8.5.28, allowed the pnpm `unrs-resolver` install build required by a clean pnpm 11 install, updated vulnerable optional OCR dependencies, added the safe setup/licence documents, and made the demo disclosure exact. These changes did not modify the preserved source checkout.

Excluded material:

- `.git`, all real environment files, credentials, service-role secrets, Telegram tokens, AI keys, analytics credentials, and payment/advertising credentials;
- real user or financial data, browser/session state, machine-local paths, logs, caches, `node_modules`, build output, local databases, uploads, and backups;
- nested archives not required to operate the project;
- a duplicate npm lockfile, the machine-specific Phase 1 result document, and unused starter logo assets.

## Scan record

All scans were local. No proprietary source was uploaded to a third-party scanner.

| Check | Tool and exact result |
| --- | --- |
| Secret scan | Gitleaks 8.30.1, downloaded from its official GitHub release. The executable SHA-256 was `17157e2ee8b76fc8b1d8bee607a250e34b8a8023c8bc81822d4b5ee4d78fcb7c`. Final ZIP archive scan and pristine extracted-source scan both exited 0 with no findings. |
| Personal/financial-data scan | ripgrep 15.2.0 plus targeted PowerShell review. Strict Aadhaar, Indian PAN, IBAN, US SSN, and private-IP patterns returned zero. Fourteen email candidates were example/invalid addresses or dependency-author metadata. Numeric phone/payment candidates were migration timestamps, dates, UUID fragments, or validation limits. Demo records were explicitly synthetic. No machine-local path, forbidden artefact, credential pattern, or nested archive remained. Pattern scans are not proof that every possible sensitive value is absent. |
| JavaScript dependency audit | pnpm 11.19.0 `pnpm audit --prod --json`: 0 known advisories across 499 production/optional dependencies after the PostCSS override. The pre-remediation audit found four PostCSS advisories (two high and two moderate). `pnpm audit signatures`: all 783 audited packages had verified registry signatures. |
| Python dependency audit | pip-audit 2.10.1: 0 known advisories across 80 resolved requirements after updates. The pre-remediation audit found 31 unique advisories across Pillow, python-multipart, Starlette, and pytest. |
| Local malware scan | Microsoft Defender product 4.18.26080.4, engine 1.1.26080.3, signatures 1.459.317.0 updated 2026-09-21 07:17:10 +04:00. Final ZIP and pristine extraction both exited 0 with no threats found. |
| Archive inventory | PowerShell/.NET ZIP inventory: 268 entries, 4,450,517 uncompressed bytes, zero nested archives. The inventory is retained as `archive-inventory.tsv` in the ignored scan-results directory. |

Clean scan results do not establish that the software is secure, free of undisclosed code, legally redistributable, or suitable for production financial data.

## Fresh extraction verification

The final ZIP was extracted outside both source repositories into a new directory. Only files from the ZIP were used.

| Verification | Result |
| --- | --- |
| Manifest/hash comparison | Passed; 268 extracted files and zero manifest failures. |
| `pnpm install --frozen-lockfile` | Passed with Node.js 24.19.0 and pnpm 11.19.0; 699 packages installed. |
| `pnpm typecheck` | Passed. |
| `pnpm lint` | Passed. |
| `pnpm test` | Passed: 24 files passed, 1 skipped; 227 tests passed, 12 skipped (239 total). |
| Production build | Passed with Next.js 15.5.24 and demo-only environment values; 53 static pages generated/analyzed. |
| Local production start | Passed on port 3021. `/overview`, `/ai`, and `/telegram` returned 200; `/api/workspace` returned 403; `/admin` and `/auth` returned 307 to `/overview`. |
| Browser check | Passed at 1280×900 and 390×844. Meaningful content rendered, no framework error overlay or page error appeared, all resource origins stayed local, the exact demo disclosure was visible, and reset replaced an injected sentinel with the synthetic workspace. |
| Optional OCR installation | Requirements installed in a fresh Python 3.12 environment. Native Windows pytest could not load the `pyclipper` DLL. The included Dockerfile built with Docker 29.8.0 and both OCR API tests passed in Linux with three deprecation/cache warnings. The generated local image was removed after testing. OCR is not required for the public demo. |

## Owner approval packet

### SOURCE PACKAGE

- Filename: `zerodebt-source-b0763b7-sanitised.zip`
- SHA-256: `f8be17dc2291635876c744b9cc68a1ccc17df94630a1123284f447b979c6dfbc`
- Size: 3,671,384 bytes
- Entry count: 268
- Scans: Gitleaks, targeted PII/financial-data review, pnpm audit and signature audit, pip-audit, Microsoft Defender, and archive inventory.
- Build/test: clean install, typecheck, lint, 227 passing tests with 12 skipped, production build, local production start, desktop/mobile browser check, and Docker OCR tests passed as recorded above.
- Excluded: repository metadata, credentials/env files, real data, sessions, local paths, generated/runtime state, dependencies, builds, databases, uploads, backups, unnecessary archives, and unused starter assets.
- Caveats: the project has no licence; brand/mascot provenance needs owner confirmation; third-party terms remain applicable; OCR models need a separate licence review; scans do not prove security.

### PUBLIC DEMO

- Local demo commit: `b0763b74ba5cbcdeb1b0450dbd1406d99111551e`
- Public URL: `https://zerodebt-public-demo.vercel.app`
- Deployment: Vercel project `zerodebt-public-demo`, accepted deployment `dpl_C1RFes6Lv1KWp6v7A4D1UDiCqUMG`, status Ready.
- Verification: passed the package build, live HTTP, 1440/1024/768/390/320 browser checks, fail-closed, Quick Entry/confirmation, persistence/reset, AI-label, and Telegram-label checks documented in `zerodebt-demo-results.md`.
- Architecture: a separate Vercel project serving only the synthetic browser-local demo, with no database, authentication, or external integration credentials.
- External services: Vercel hosting only. Supabase, AI, Telegram, OCR, payments, advertising, and analytics remain disconnected.
- Remaining risks: public hosting and dependency supply-chain exposure, browser-storage privacy on shared devices, future configuration drift, and legal/asset authority that still needs owner confirmation. Live QA and targeted scans are not a general security certification.

## Owner decisions recorded

**A. Approve sanitised source redistribution? NO / NOT YET**

Current state: `redistributionApproved: false`. **Download source** remains unavailable. Reconsider only after written licence/permission and code plus logo/mascot/asset provenance are recorded.

**B. Approve deployment of the synthetic ZeroDebt public demo? YES**

Current state: `publicDemoDeployed: true`. **Open ZeroDebt demo** uses the verified public URL above and carries the note `Synthetic financial data · Changes reset`.
