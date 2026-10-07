# IncomeNow Stripe membership rollout — 7 October 2026

Real Stripe TEST E2E and production database preparation are complete. **The membership launch is not complete: the LIVE API credential is unavailable, so production integration/deployment and checkout activation are pending.** Both production enrollment gates are closed. The owner-authorized rollout has been executed as far as the available credentials permit.

| # | Delivery item | Verified result |
| --- | --- | --- |
| 1 | Original starting commit | `94ef8a35c7e2ec41bf49400df2a586497f70f770` |
| 2 | Implementation commit | `654c6c8ea8a97a8dcefe236fd22264d87744d62d`; the delivery response reports the subsequent report commit/branch HEAD. |
| 3 | Branch / merge | `codex/stripe-membership-launch`, based on sanitized `origin/main` at `949eadb10c132dcf336b01aed555236aa808ae13`. Production merge remains pending. The older local branch was preserved and must not be pushed because its ancestry contains protected resource payloads. |
| 4 | Production deployment | Existing site [www.millionmonk.com](https://www.millionmonk.com); existing [Vercel deployment](https://incomenow-nugty11yz-faziils-projects.vercel.app), ID `dpl_3JtxGPspfJDrEdejb2cU3VEjLGF2`, READY, commit `949eadb...`. This is the previous deployment, not the billing rollout. |
| 5 | TEST E2E | Passed actual application Checkout, official declined/success cards, real subscription/invoices/webhooks, paid access, Portal cancellation, retained access, confirmed expiry and slot release, renewal, failed invoice, application final-slot competition, waitlist/invitation conversion and expiry, authenticated reconciliation. |
| 6 | TEST Product / Price | `prod_VOfiAYZA57kAGz` / `price_1UNsMbPDKvZxI4vzbTOtIxee` |
| 7 | LIVE Product | [`prod_VOiDw50D4IG8h2`](https://dashboard.stripe.com/acct_1Tt7qJPDKvZxI4vz/products/prod_VOiDw50D4IG8h2), active |
| 8 | LIVE Price | `price_1UNun6PDKvZxI4vz8OHXKqQC`, the single default recurring price |
| 9 | LIVE terms | USD 14.99/month, no trial, annual option, extra currency, discount or promotion configured |
| 10 | Billing Portal | LIVE `bpc_1UNv0MPDKvZxI4vznQddVPGU`, saved. Payment method management and invoice history enabled; cancellation at paid-period end; plan and quantity changes disabled. TEST `bpc_1UNu5CPDKvZxI4vzk7kvnjOF` exercised through a real Portal session. LIVE API validation awaits the LIVE key. |
| 11 | Production webhook | `we_1UNv6HPDKvZxI4vzokHHjVrS`, URL `https://www.millionmonk.com/api/stripe/webhook`, created with signing secret stored as encrypted Vercel production configuration. Temporarily disabled until the new application is deployed. Other destinations were preserved. |
| 12 | Webhook events | Exactly `checkout.session.completed`, `checkout.session.expired`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.paid`, `invoice.payment_failed`. Snapshot API `2026-08-26.dahlia`, matching actual TEST CLI event delivery. SDK 23.0.0 API requests independently verified as `2026-09-30.endive`. |
| 13 | Hosted migrations | Six reviewed migrations applied to `imwiqfmafuamcgqswcfy`; the previous nine retained. Project healthy. New private tables use RLS; billing/scheduler RPCs deny ordinary roles. Hosted error-level security advisor passed. |
| 14 | Existing grants | One verified account, one valid permanent complimentary full grant, zero starter grants, zero provider subscriptions/payments. Existing full grant adopted into one real legacy entitlement claim; access/source/window unchanged. No invented subscription, customer or payment. |
| 15 | Active capacity | 1 / 600 from production database |
| 16 | Available capacity | 599; zero checkout reservations and renewal holds |
| 17 | Checkout gate | OFF |
| 18 | Waitlist gate | OFF |
| 19 | Reconciliation | Vault bearer provisioned; one inactive `incomenow-billing-reconciliation` job at every five minutes. Service-only function calls authenticated GET to the canonical endpoint. Activation and actual scheduled HTTP success await deployment smoke. Vercel Hobby cannot provide the required five-minute Cron cadence. |
| 20 | Vercel configuration | Added encrypted production names: `STRIPE_BILLING_MODE`, `STRIPE_INCOMENOW_MEMBERSHIP_PRODUCT_ID`, `STRIPE_INCOMENOW_MEMBERSHIP_PRICE_ID`, `STRIPE_BILLING_PORTAL_CONFIGURATION_ID`, `STRIPE_WEBHOOK_SECRET`, `BILLING_RECONCILIATION_SECRET`. Existing `APP_ORIGIN`, `SITE_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY`, `PRIVATE_RESOURCE_BUCKET` and analytics settings preserved. `STRIPE_SECRET_KEY` remains unavailable. No secret values in this report. |
| 21 | Tests | Full merged suite: 63 files / 300 tests passed, two Storage integration tests initially skipped. Both were then run against the actual production private Storage provider and passed read-only. Final copy regression: 2 files / 12 tests passed. |
| 22 | Database assertions | 40 isolated PostgreSQL billing assertions passed, including actual concurrent final-slot race; separate foundation harness passed. Scheduler migration also applied successfully to the isolated Supabase stack and hosted production. |
| 23 | TypeScript | Standalone `tsc --noEmit` and final build TypeScript validation passed |
| 24 | ESLint | Passed |
| 25 | Production build | Final `next build --webpack` passed, all billing/admin/auth/resource routes compiled |
| 26 | Security scan | Tracked source scan passed; sanitized candidate ancestry scan passed across 23 predecessor commits / 630 unique text blobs. Final release ancestry rechecked before push. No actual Stripe keys, signing secrets, Supabase secret/service JWTs, private keys or protected resource payloads. Runtime secrets, sessions, captures and paid artifacts stay ignored. |
| 27 | Browser checks | Merged local TEST homepage and membership visually inspected at 1440, 768, 430, 390 and 320 pixels; no horizontal overflow. All five ideas retained. Real protected-resource expiry denied access. New production browser smoke remains pending deployment. |
| 28 | Admin verification | Real isolated TEST admin action reserved an account-bound invitation and successful TEST payment converted it. Production aggregate metrics verified via service RPC: one complimentary member and zero paid run rate. Production has no admin role; owner identity and authenticated production admin browser verification remain pending. |
| 29 | Remaining blockers / risks | Existing LIVE secret is permanently masked in Stripe. Dedicated LIVE key creation awaits action-time confirmation, or the owner may securely supply an existing key. Need a real owner admin identity and an eligible verified real non-member for non-charging LIVE Checkout smoke. Main integration, billing deployment, LIVE API validation, webhook/scheduler activation, production smoke and enrollment activation remain pending. |
| 30 | Artificial LIVE payment | None. No artificial LIVE customer, subscription, invoice or payment was created. All test purchases used official TEST cards and isolated TEST accounts. |

## Actual TEST evidence and limits

The isolated project `incomenow-stripe-e2e-20261007` uses local API port 59321 and app origin port 3220. Existing local databases and production users were not used for test fixtures. It started with zero full/starter grants and both gates disabled, then enabled TEST enrollment only.

Actual provider events activated exactly one paid entitlement and one allocated claim. Visiting the return URL before payment did not grant access. A real Portal cancellation used `cancel_at` without `cancel_at_period_end`; the implementation was corrected and a regression test added. The paid period was retained until its actual end, after which protected access returned 403 and the slot reopened. Paid-window timestamps were not edited to fake expiry.

At 599 occupied/held slots, two concurrent real application Checkout actions produced exactly one Stripe TEST Checkout and never slot 601. The losing verified account entered the actual waitlist once. Admin allocation reserved an account-owned invitation, allowed its Checkout at otherwise-full capacity, converted waitlist state on real payment, and released an unused expired invitation.

A real test-clock renewal finalized a new paid invoice, extended access and created exactly one additional payment record. A subsequent official failing TEST payment method produced `invoice.payment_failed` and `past_due` without fabricating a payment or extending the last paid window. A separate attempted billing-anchor reset did not create a renewal and is not used as proof of renewal.

Duplicate/out-of-order behavior includes signed local replay of actual Stripe event data and unit/database assertions. The real listener returned retryable 503 for concurrent lease contention; later provider reconciliation completed correctly. Automatic Stripe redelivery to a deployed endpoint was not independently demonstrated. API timeout behavior is covered by automated tests, not a claimed Stripe outage.

## Production data and resource preservation

The restored database was inspected only after `ACTIVE_HEALTHY`. An initial transient restoration response looked empty; the migration transaction rejected duplicate history and rolled back. The healthy inventory then established the actual one-user/one-grant state before new migrations were applied.

Applied new migrations, in order:

1. `20260923120000_acquisition_race.sql`
2. `20261007102952_full_membership_capacity_foundation.sql`
3. `20261007103932_stripe_membership_billing.sql`
4. `20261007130611_stripe_membership_live_mode.sql`
5. `20261007131444_adopt_legacy_full_membership_claims.sql`
6. `20261007132120_membership_reconciliation_scheduler.sql`

Production database policy now expects LIVE mode. A real service request with LIVE mode succeeds; TEST mode is rejected, and anonymous execution is denied. Both gates remain false. No existing starter grants were present to migrate; starter/full isolation is exercised by the database and entitlement suites.

All seven approved private Storage artifacts were downloaded read-only and matched their fixed sizes and SHA-256 hashes. Ignored local copies restored the complete private-resource tests. Existing plan registries and all five published ideas remain intact. Four older private workspace registry tables have pre-existing RLS settings; they were not changed as unrelated billing work.

## Resume the authorized rollout

1. Resolve the pending LIVE key confirmation, or read the owner-supplied existing key from ignored `.sites-runtime/stripe-e2e/.env.live.local`. Keep credentials out of chat/source/process arguments.
2. Verify the Stripe account, actual LIVE Product/Price and saved Portal through the SDK. Configure encrypted production `STRIPE_SECRET_KEY`; compare existing settings before changes.
3. Resolve real admin/non-member account identities. Do not manufacture a LIVE customer or revoke the complimentary grant for testing.
4. Integrate the reviewed clean release branch into `main` without force pushing. Deploy with gates closed.
5. Verify anonymous/authenticated/complimentary/starter separation, current capacity, resource access, administration, webhook signature/mode rejection, and authenticated reconciliation in the new production deployment.
6. Enable the prepared IncomeNow webhook and five-minute job; observe actual successful scheduled HTTP execution before opening enrollment. Use existing request IDs, Cron history, net responses and Vercel billing logs without financial details.
7. Only after those checks, enable checkout/waitlist and verify the non-charging LIVE Checkout offer and final production layouts. Never submit a LIVE payment for smoke testing.

Scheduler follows [Supabase's documented Cron activation model](https://supabase.com/docs/guides/cron/quickstart). Portal policy follows [Stripe's portal configuration documentation](https://docs.stripe.com/customer-management/configure-portal).
