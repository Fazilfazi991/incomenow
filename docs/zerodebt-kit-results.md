# IDEA #004 — ZeroDebt Personal Finance SaaS Kit

## Implemented scope

IDEA #004 replaces the Local-Service Lead Website placeholder with a published `Consumer SaaS` catalogue entry and a protected full-member ZeroDebt kit. The member hub contains thirteen independent activities:

1. Understand the opportunity
2. Explore ZeroDebt
3. Shape the product
4. Review the source
5. Rebrand the app
6. Configure Telegram
7. Evaluate Ask ZeroDebt AI
8. Model the business
9. Plan subscriptions
10. Evaluate advertising
11. Prepare the launch
12. Plan growth
13. Operate and improve

The current project plan is version `2`: thirteen immutable stages, twenty-six required tasks, and one private stage note per stage. Version `1` remains in the plan catalogue and database for historical Local-Service projects; it is no longer current.

## Access behaviour

- Signed-out visitors receive only the explicit `PublicIdea` projection and a structured safe preview.
- Verified free and Pergola Starter accounts can browse and bookmark the published idea.
- Free and Pergola Starter accounts cannot start a ZeroDebt project or receive full member sections.
- Active full members receive the full thirteen-activity kit and can start one account-owned ZeroDebt project through the existing server-side policy.
- Project starts are idempotent. Task progress, private stage notes, pause/resume, plan-version preservation, and cross-user isolation use the existing workspace model.
- Authentication, entitlement, publication, and source redistribution remain separate gates.

## Evidence and guardrails

- The catalogue and Explore view use a screenshot captured from the verified Phase 1 synthetic demo.
- The demo resource is `available` at `https://zerodebt-public-demo.vercel.app` after live verification of the separate synthetic Vercel deployment.
- The source resource remains `not-connected`; no archive or raw source link was exposed.
- Rebrand guidance uses inspected real paths and bounded copyable prompts.
- Telegram and AI activities document architecture, environment names, data/security/cost controls, and disable paths without configuring a live provider.
- Subscription and advertising activities are implementation guidance only. No payment or ad service was connected.
- The business-model planner starts empty, clamps unsafe input, and labels every output as a scenario rather than expected income.
- The full kit states that it is not financial advice and makes no earnings, demand, compatibility, or production-readiness guarantee.

## Verification record

- `pnpm run typecheck`: passed.
- `pnpm run lint`: passed with no reported issues.
- `pnpm test`: 40 files and 159 tests passed.
- `pnpm run build`: passed on Next.js 16.3.5; 14 static pages generated and the member/public routes compiled.
- `pnpm run test:plan-sync`: passed with 40 stages and 83 tasks across all stored plan versions.
- `pnpm run test:db`: 6 pgTAP files and 216 assertions passed.
- `supabase db lint --local --level warning --fail-on error`: no schema errors.

Browser verification used the local Supabase stack and a disposable confirmed full-member account, which was removed afterward:

- Public safe preview at 1280px and 390px: expected title, problem, product flow, business flow, differentiators, resource teasers, protected-content notice, and disconnected demo/source states rendered; no framework overlay, console warning/error, or horizontal overflow.
- Full-member Explore: IDEA #004 appeared as `Consumer SaaS` with full-member access and the verified screenshot.
- Full-member kit at desktop and mobile: all 13 activities rendered, source approval remained pending, and there was no horizontal overflow or framework overlay.
- Scenario planner: 10 inputs rendered. The test scenario (10,000 MAU, 4% conversion, 6 price, 3 RPM, 8 sessions, and 800 technical cost) produced 400 premium customers, 2,400 premium revenue, 240 advertising revenue, 1,840 gross margin, and 69.7% gross-margin rate.
- Project flow: a new version-2 project created 13 stages; one task saved, pause disabled edits, and resume restored the active state.
- Database role coverage: verified free and Pergola Starter accounts could bookmark IDEA #004 but could not start it; an active full member could start it idempotently; plan version, notes, task state, pause/resume, and cross-user isolation passed.

## Public-demo release addendum — 2026-09-22

The owner approved only the synthetic public demo. Source redistribution remains unapproved:

- The sanitised package, ownership/licence review, scan record, fresh-extraction verification, and owner approval packet are in `docs/zerodebt-distribution-readiness.md`.
- The accepted public deployment and responsive/browser results are in `docs/zerodebt-demo-results.md`.
- Package: `zerodebt-source-b0763b7-sanitised.zip`, SHA-256 `f8be17dc2291635876c744b9cc68a1ccc17df94630a1123284f447b979c6dfbc`, 3,671,384 bytes, 268 entries.
- The original repository has no project licence. Source redistribution remains blocked pending an explicit grant plus owner confirmation of code and asset provenance.
- The dedicated Vercel project `zerodebt-public-demo` is Ready at `https://zerodebt-public-demo.vercel.app`, deployed from approved commit `b0763b74ba5cbcdeb1b0450dbd1406d99111551e`.
- Its only application environment values are `NEXT_PUBLIC_DEMO_MODE=true`, the public canonical demo URL, and `AI_ASSISTANT_ENABLED=false`. No production database, auth, AI, Telegram, payment, advertising, or analytics credential is configured.
- Live checks passed for pages, Quick Entry and explicit confirmation, browser-local persistence, reset, fail-closed APIs, admin/auth redirects, non-live AI/Telegram wording, and 1440/1024/768/390/320 responsive layouts. Browser traffic used only the demo origin and the accepted deployment emitted no warning/error/fatal runtime log during QA.
- Canonical states are `redistributionApproved: false` and `publicDemoDeployed: true`. **Open ZeroDebt demo** is available with `Synthetic financial data · Changes reset`; **Download source** remains unavailable and the source resource says `Source release approval pending.`

Owner decisions recorded:

1. **Approve sanitised source redistribution? NO / NOT YET**
2. **Approve deployment of the synthetic ZeroDebt public demo? YES**

## IncomeNow demo-link verification — 2026-09-22

- `publicDemoDeployed: true` and the verified Vercel URL are canonical content state; `redistributionApproved: false` is unchanged.
- The demo resource is `available`, labelled **Open ZeroDebt demo**, opens in a new tab through the shared resource action with `rel="noopener noreferrer"`, and shows `Synthetic financial data · Changes reset`.
- The source resource remains `not-connected`, has no `externalUrl` or `downloadPath`, and states `Source release approval pending.`
- Signed-out browser checks at 1280×900 and 390×844 showed the ZeroDebt safe preview and the demo resource as Available with no horizontal overflow or page error. The public projection exposes only aggregate resource availability, not protected sections or source/download coordinates.
- Registered/free and Pergola Starter accounts remain limited to the safe catalogue/preview and cannot start an IDEA #004 project. The dedicated pgTAP test passed those denials; an active full member can create the version-2 ZeroDebt project and receive its 13 stages and 26 tasks. Cross-user isolation also passed.
- `pnpm run typecheck` and `pnpm run lint` passed against the tracked application tree. The ignored distribution verification trees were preserved outside the TypeScript scan during these two checks because the repository-wide glob otherwise treats their separate application sources as IncomeNow modules.
- `pnpm test`: 40 files and 159 tests passed.
- `pnpm run build`: passed on Next.js 16.3.5; 14 static pages generated and all member/public routes compiled.
- `pnpm run test:plan-sync`: passed with 40 stages and 83 tasks.
- `supabase test db supabase/tests/phase_5_zerodebt_kit_test.sql`: 24 assertions passed.
- The aggregate local pgTAP command ran the other suites successfully but stopped in the pre-existing Phase 2B fixture because the local database already contains `(idea-005, version 1)`. No local database reset or user-data mutation was performed; the isolated IDEA #004 suite above is the relevant release result.
