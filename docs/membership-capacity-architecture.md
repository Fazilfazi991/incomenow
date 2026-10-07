# Membership consistency and capacity preparation

Prepared locally on 7 October 2026 from commit `94ef8a35c7e2ec41bf49400df2a586497f70f770`. The starting tree already contained the reviewed homepage and unrelated acquisition/auth/analytics work. No commit, push, deployment, hosted Supabase mutation, payment processing, or Stripe activation was performed by this task.

## Product and application configuration

`src/lib/membership-config.ts` is the authoritative application product configuration. `membershipConfig.fullMembership` defines 1499 USD minor units, derived dollar labels, monthly interval, capacity 600, registration-open positioning, disabled checkout, and an unconnected waitlist. `membershipConfig.starter` preserves every existing US$1 Pergola starter field, scope, project limit, and unresolved duration.

`src/content/membership-offer.ts` exports compatibility aliases to these same objects. `membershipLaunch` in `src/lib/membership-capacity.ts` is also an alias, not another price/capacity definition. Homepage and membership pricing therefore share object identity. Database capacity is separately fixed by a migration constraint at exactly 600; changing that invariant requires an explicit future migration and corresponding product decision, not a client configuration edit.

The membership page now presents INCOMENOW MEMBERSHIP, US$14.99/month, and maximum 600 active members. It explains historical accounts versus concurrent full memberships, closure at capacity, and reopening only after paid entitlement ends. The separate starter offer remains visible without claiming full access. Checkout and waitlist submission are explicitly unconnected. Product copy covers the opportunity library, published execution kits and resources, personal projects, tasks, and updates as published, with no earnings promise.

| Account state | Full-membership action | Access truth |
| --- | --- | --- |
| Anonymous | Create account / Log in, preserving `/account/access` destination | Signup does not activate paid membership |
| Registered | Review membership access | Paid checkout is disconnected |
| Starter | Review full membership upgrade | Starter access remains separate |
| Full | Open your library | No purchase CTA or redundant starter purchase |
| Unavailable | Check account access | Do not infer entitlement |

`src/lib/full-membership-action.ts` specifies this account navigation. It neither reserves capacity nor grants access. The reviewed homepage composition remains intact; its pricing and cap text now read shared configuration, and cancellation copy names actual entitlement end.

## Existing schema inspected

The repository migrations and running **local** `supabase_db_IncomeNow` schema catalog were inspected before schema design. Full access is already projected into `public.membership_entitlements` with enabled/start/expiry/revocation fields. Starter grants live separately in `public.idea_access_grants`. Ordinary accounts have read-own RLS and no grant writes. Current server and project/resource database functions check those entitlement windows freshly. Signup creates a profile only.

This phase does not replace those checks, alter their policies, backfill grants, or apply the new migration to the existing local or hosted application database. The connected Supabase tool listed a different inactive project; it was not used to query customer records. Foundation verification uses an independently created, network-isolated, disposable PostgreSQL container.

## Local migration and model

`supabase/migrations/20261007102952_full_membership_capacity_foundation.sql` was created with the installed Supabase CLI. It adds:

| Private table | Purpose |
| --- | --- |
| `membership_capacity_policy` | Singleton allocation lock; capacity constrained to 600; checkout/waitlist flags default false |
| `membership_subscriptions` | Account-owned lifecycle, paid entitlement window, payment condition, provider customer/subscription/session references, persistent checkout idempotency key, provider event version |
| `membership_slot_claims` | Unique numbered slot 1–600; one claim per subscription/account; reservation versus allocated membership |
| `membership_waitlist` | Normalized unique email, optional account, joined timestamp/UUID order, waiting/invited/converted/withdrawn/expired state, hashed invitation token and expiry, converted subscription |
| `membership_billing_events` | Unique verified-provider event inbox, private payload, received/provider timestamps, attempt/processing state, error code |

Every new table enables RLS. No ordinary-user policy or privilege is added. New functions are security invoker with empty search path and explicit schema references; PUBLIC/anon/authenticated execution is revoked and service-role execution is granted. Existing entitlement write permissions are granted only to the trusted service role. There is no public browser RPC or waitlist endpoint in this preparation task.

Lifecycle states are explicit enums: `pending`, `active`, `cancel_at_period_end`, `expired`, `cancelled`. Payment condition is separate (`pending`, `paid`, `past_due`, `failed`). The TypeScript specification in `src/lib/membership-lifecycle.ts` is pure and used for tests/architecture; it is not substituted for current server authorization.

## What consumes capacity

An **active member** is an allocated full-membership claim whose authoritative subscription is active or cancelling at period end and whose paid window satisfies `starts_at <= now < entitlement_ends_at`. Pending checkout reservations consume allocatable capacity but are not presented as paid members. The future activation RPC writes the subscription, claim, and existing billing-provider entitlement projection in the same transaction.

`available = 600 - active`; `allocatable = 600 - active - reserved`. Paid membership is open only when the trusted checkout flag is enabled, existing grants have been reconciled, and allocatable capacity is positive. The public UI must never treat this boolean as sufficient payment authorization.

`cancel_full_membership_at_period_end` records the cancellation request and leaves the claim and entitlement intact. `release_ended_membership_slots` expires the paid window and disables only its matching billing-provider entitlement before deleting the claim. `end_full_membership` supports a verified actual immediate end, preserves the cancelled/expired terminal state, disables its projection, and releases the claim in one transaction. It rejects future end times; a request to cancel later is not an actual end.

No expiry job is scheduled here. Existing application authorization already checks expiry independently. The future worker must call release during reconciliation and maintenance; reservation allocation performs cleanup before choosing a free slot.

## Concurrency and checkout uncertainty

Every mutating capacity RPC first locks the singleton policy row with `FOR UPDATE`, then updates subscriptions/claims. Lock order is consistent and transactions stay short. Provider network calls and email delivery must occur outside the transaction. Slot numbers have a primary key and a database constraint restricting them to 1–600; subscription/account/idempotency uniqueness supplies additional protection.

The reservation RPC locks, cleans safe ended claims, verifies the feature/cutover gate, handles persistent same-account idempotency, selects a free numbered slot, and inserts the pending subscription and claim atomically. A second request waits for the first commit and then observes no final slot. This is not an unlocked count followed by an insert. Expired request keys remain recorded and cannot silently start a new purchase. Cross-account replay fails.

Initial unsubmitted reservations have a 30-minute timeout. **Wall-clock expiry alone does not release a potentially paid checkout.** Before making a provider call, the future worker must persist `checkout_attempt_state = in_flight`; attaching a returned session changes it to `attached`. Both hold their claim even beyond reservation time. An uncertain API response or delayed webhook therefore fails closed. Only a provider-confirmed unsuccessful terminal outcome, with a confirmation timestamp, permits timed cleanup. A late verified paid outcome may activate its still-held claim. Never free that claim and subsequently grant a 601st membership.

The database race test uses two real concurrent connections with 599 synthetic test memberships. Exactly one final-slot reservation succeeds and one fails; claims remain at 600. Fixtures exist only inside the disposable test database and are never used as public occupancy.

## Existing full grants and cutover

Legacy manual, complimentary, migrated, and billing-provider full grants cannot disappear from capacity accounting. Reservation fails closed while any currently active full grant has no allocated claim. The snapshot exposes `unreconciled_full_grants` and `count_verified`; the application must not publish the new ledger count until reconciliation is approved and complete. Activation refuses to overwrite a non-billing-provider grant.

The next phase needs an explicit adoption/backfill plan for existing grants, including open-ended grants, any over-capacity condition, and one claim per full account. All future full-grant issuance, including manual/complimentary grants, must use the serialized allocation path. Existing direct operator writes are not silently brought under enforcement by this migration. The new private foundation is not a claim that today's application already enforces the cap.

## Waitlist and admin readiness

Waitlist ordering is `(joined_at, id)`; do not advertise a stable queue number from a mutable count. Enrollment is intentionally deferred. A future server endpoint must verify the account/email, normalize and deduplicate, rate-limit, check policy/capacity, and accept only permitted fields. Invitations store token hashes, issuance and expiry; conversion must validate account ownership, obtain a real atomic reservation, and mark the converted subscription transactionally. Invited status alone does not grant access. No emails, tokens, invitations, fake entries, or working-looking join button are created here.

The private snapshot exposes active/600, available, allocatable, reserved, cancelling-at-period-end count, full/open state, waitlist enabled/count and reconciliation status. MRR is deliberately null until authoritative provider billing data exists. No major admin UI is added. Existing operational admin authorization should guard any future server-only aggregate endpoint; private customer/event records must never reach a public bundle.

## Stripe boundaries for the next phase

No Stripe integration is part of this task. A separate, explicitly authorized phase must implement:

1. Environment-managed Product and recurring Price IDs for approved USD 1499/month, validating amount/currency/interval server-side and separating test/live environments.
2. Verified account → atomic reservation → persisted provider-call attempt → Customer/Checkout Session. Persist customer, session, subscription IDs and a stable request key; never accept client price or subscription state.
3. Idempotent external Checkout creation tied to the persistent local checkout request. Reconcile unknown responses before releasing a claim; disable asynchronous payment methods until delayed-settlement capacity handling is implemented.
4. Webhook endpoint verifying the signature against the **raw** body with an environment-managed signing secret. Insert provider event ID uniquely; validate livemode/account and keep payloads private.
5. Serialized subscription reconciliation, current provider subscription/paid-invoice retrieval, stale-event ordering/fencing, and transactionally committed event processing plus local entitlement/claim updates. Event-ID uniqueness prevents replay but is not sufficient for out-of-order delivery.
6. Successful activation only after verified paid entitlement, with actual confirmed billing-period boundaries; a browser `success_url` never grants access.
7. Failed-payment/past-due handling without extending unpaid access. Any grace period is a separate approved policy; absent one, keep only the last confirmed paid window and expire at its end.
8. Immediate cancellation versus cancellation at period end, subscription deletion, renewal reconciliation, entitlement expiry, actual slot release and waitlist reopening. Do not overwrite a paid-through date merely because cancellation was requested.
9. Scheduled maintenance, checkout reconciliation, webhook retries/dead letters and operator recovery for uncertain payments, expired reservations, stale provider state and missing events.
10. Verified waitlist enrollment/invitation conversion and later email delivery only under separately authorized messaging scope.

Provider event storage and RPCs are scaffolding, not a running webhook handler. The database remains the application's trusted entitlement/capacity projection, synchronized by verified provider events. Core transaction/security references: [PostgreSQL row locking](https://www.postgresql.org/docs/current/explicit-locking.html), [Supabase database function privileges](https://supabase.com/docs/guides/database/functions).

## Changed files and validation

Application: `src/lib/membership-config.ts`, `membership-capacity.ts`, `membership-lifecycle.ts`, `full-membership-action.ts`; `src/content/membership-offer.ts`; homepage entry/metadata and capacity/offer text in existing homepage components; `src/app/membership/page.tsx` and narrowly scoped `membership.css`.

Tests: config/lifecycle/offer/public-page assertions; existing capacity/homepage regression tests. Database: the local foundation migration, `scripts/verify-membership-capacity-local.mjs`, and its fixture under `scripts/fixtures/` (not automatically executed by the Supabase pgTAP test directory). `package.json` adds `test:membership-capacity`. Product/design documentation now records shared pricing consistently.

- Full suite: 47 files, 190 tests passed with two workers. An initial parallel build run produced one unrelated settings-test timeout; the complete rerun passed without changing that test.
- Typecheck passed after the build. An earlier simultaneous typecheck encountered generated Next files being recreated; sequential rerun passed.
- ESLint and production webpack build passed.
- A final targeted ESLint check also passed using a temporary root `NODE_PATH` after the concurrent next-phase dependency install affected peer-module resolution. No dependency files were repaired or overwritten by this task.
- Isolated PostgreSQL migration/lifecycle/privilege/idempotency/reconciliation tests and two-connection final-slot race passed. Test container is removed automatically; no existing application database is changed.
- Browser homepage and membership checks at 1440, 768, 430, 390, and 320 pixels: consistent price, clear starter/full distinction, 600 wording, no horizontal overflow, no public protected-resource links, and no fake production occupancy.
- Anonymous browser UI verified. Registered/starter/full/unavailable variants are covered by rendered account-state tests; no hosted sign-in or account mutation was attempted.

Local review: http://localhost:3200/membership. Capture evidence is under `.impeccable/review/membership-foundation/`.

## Outstanding decisions and concurrent phase

Before billing activation: approve legacy-grant adoption, provider Product/Price/environment, maintenance cadence, unknown-payment recovery, failed-payment/grace policy, waitlist invitation delivery, tax/refund/resource terms and the existing starter's still-unconfigured duration. No current checkout or waitlist form is promised to work.

While this task was running, the owner's separate chat **Implement Stripe memberships** began additive next-phase changes in the same checkout. The owner authorized coordination; file ownership and preview isolation were communicated. Its Stripe dependency, billing migration/routes/tests/env changes and audit are preserved and excluded from this preparation task's validation claim. This report describes the checked preparation snapshot; the combined next-phase tree needs that chat's own full validation before activation or deployment.
