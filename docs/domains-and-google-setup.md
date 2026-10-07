# Domains, search, and analytics setup

Updated 6 October 2026.

## Live domains

Vercel project: `incomenow` (`prj_qOLwMmt4VGQkRFHTen2PucPminsK`), team `faziils-projects`.

Both domains remain attached to the same production deployment. Each apex redirects with HTTP 308 to its own `www` hostname. All four HTTPS addresses were checked and return the existing live website, with successful TLS validation.

GoDaddy DNS was corrected for both `millionmonk.com` and `millionvault.com`:

| Record | Name | Value |
| --- | --- | --- |
| A | @ | 216.198.79.1 |
| CNAME | www | c285d2b975c9e4db.vercel-dns-017.com. |

Public DNS caches can retain the previous `www` CNAME until its TTL expires. Vercel reports all four project domains as ownership verified. HTTPS checks confirm the live site is reachable through each hostname.

## Google Search Console

`millionmonk.com` was added as a Domain property, and Google's **Ownership verified** success was observed. Proof: `artifacts/screenshots/search-console-millionmonk.png`.

Both domains now publish Google verification TXT records. MillionVault's TXT became visible after browser control stopped responding. The user subsequently reported Search Console connected and verified; its final ownership screen could not be independently inspected.

Sitemap submission remains pending deployment of the new sitemap route. Use `https://www.millionmonk.com/sitemap.xml` in the primary property. The sitemap lists only the public homepage, membership, and privacy pages. MillionVault shares the same application; canonical URLs point to MillionMonk to avoid indexing duplicate pages.

## Google Analytics

Created a separate **IncomeNow** Analytics account under the signed-in `zorxdxb@gmail.com` Google account, after explicit approval to accept Google's terms. Existing unrelated Analytics properties were preserved.

- Property: **IncomeNow — MillionMonk & MillionVault**
- Web stream: **IncomeNow public website — both domains**
- Stream ID: `16051500881`
- Measurement ID: `G-XJEJTKLZL6`
- Website: `https://www.millionmonk.com`
- Reporting timezone: United Arab Emirates, GMT+04
- Currency: USD
- Optional account data sharing and enhanced measurement disabled.

Vercel production environment variables are saved:

- `SITE_URL=https://www.millionmonk.com`
- `NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XJEJTKLZL6`

The code integration is prepared locally and has not been deployed. Live collection has not been confirmed. The final onboarding screen remains open because Chrome's tab-control connection stopped responding after stream creation.

## Code behavior and checks

Google scripts load only on `/`, `/membership`, and `/privacy` in production. Explicit pageviews exclude query strings and fragments, and referrers are reduced to their origin. Google signals and advertising personalization are disabled. Tracking is disabled when navigating to an authentication or member route. Development and Vercel previews do not enable Google tracking.

Public production pages receive explicit canonical URLs and indexing metadata when `SITE_URL` is valid. Other pages inherit `noindex, nofollow`. Robots excludes authentication, member, account, admin, API, and preview routes. Preview search files block indexing.

Validation completed:

- TypeScript and ESLint pass.
- Existing complete test suite: 162 tests passed; the subsequent two Analytics privacy tests also passed.
- Production webpack build passes.
- Production HTTP checks confirm sitemap and robots output, and authentication pages have `noindex, nofollow`.
- Default Turbopack build encounters a local dependency-layout issue: `node_modules/next` is a junction into another worktree outside the project root. No production config was changed to work around this local layout.
- Responsive browser review was unavailable after Chrome stopped permitting tab control; no layout or motion was redesigned.

## Remaining work

1. Obtain explicit deployment approval, as required by this project's `AGENTS.md`. The workspace contains pre-existing acquisition/admin changes; review deployment scope so unrelated work is not unintentionally published.
2. Deploy the reviewed Google Analytics and search metadata changes.
3. Submit the sitemap in Search Console and confirm the final MillionVault ownership status from Google's UI.
4. Complete Analytics onboarding, inspect live collection, and verify public-page tracking and private-page exclusions on the deployed site.

Supabase hosted authentication configuration, private resources, customer data, nameservers, and mail records were not changed.
