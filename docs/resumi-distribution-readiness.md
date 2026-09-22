# Resumi distribution readiness

Date: 2026-09-21

## Canonical package

- Filename: `resumi-resume-builder-distribution.zip`
- SHA-256: `7059EB44A050C8BA28A30B265AAE9B4B76034DB584DFD769522D52849744B6A9`
- Size: 2,407,231 bytes
- Entries: 169
- Source commit: `3ed78e615e746cb9e7e70d3f53625532bfeda9bd`
- Local path: `private-resources/resumi/resumi-resume-builder-distribution.zip`

The package is technically prepared, narrowly gitignored and not tracked. It is outside `public/`. The protected route is implemented fail-closed, but canonical `redistributionApproved` is `false`; the catalogue exposes no download URL or button and the route returns a locked response even for an active full member.

## Included

- 164 source-controlled application files needed to inspect and build the product
- Blank `.env.example`
- An IncomeNow distribution notice recording source commit, setup expectations, licence uncertainty and production/security warnings

## Excluded

- `.git` history and metadata
- `node_modules`, `.next`, generated build output and package-manager artifacts created during inspection
- Environment files other than the blank example
- The nested owner-supplied brand ZIP and extracted brand/logo/mockup tree
- Browser/session state, logs, caches, database dumps and machine-specific files

Archive validation found no nested archive, extra environment file, Git entry, dependency/build directory or included brand-archive path. Pattern scans found no secret, key, credential URL, database dump or machine path. Microsoft Defender reported no threat. These checks reduce risk but are not an independent security or legal audit.

## Verification result

The inspected source passed direct ESLint, TypeScript and optimized Turbopack production-build checks. The exact ZIP was then extracted to a disposable directory and passed ESLint, TypeScript and an optimized webpack production build using the already-inspected dependency tree; the disposable directory was removed. The project does not define an automated application-test script. Dependency audit and security review did **not** pass a production-readiness threshold: the production dependency graph contains 25 advisories including 2 critical, and the privilege/privacy findings in `docs/resumi-source-inspection.md` remain unresolved.

## Approval and delivery state

- `technicalPackageReady: true`
- `redistributionApproved: false`
- Delivery eligibility if later approved: active full members only, using the existing fresh server-side access decision
- Current behavior for every account class, including full members: no package delivery

The route is already tested for signed-out, free, Starter, expired/revoked, lookup-unavailable and active-full-member states. A separately injected approved-state test verifies the fixed filename, private/no-store ZIP response and exact SHA-256. That test does not change canonical approval state.

## Owner decisions required

1. Obtain or document an adequate source redistribution licence. Public repository visibility is not permission to redistribute.
2. Decide whether to ship a patched/hardened source revision rather than this commit. The current critical dependency and authorization findings should normally block member delivery.
3. Confirm rights for logos, mockups, photography and other product assets. They are excluded from this package meanwhile.
4. If approving release later, approve the exact filename and SHA-256 above. Only then should `redistributionApproved` be changed and the existing protected action connected.

No archive is committed, publicly served, pushed or deployed.
