# Stripe membership audit — 7 October 2026

Historical pre-authorization audit. The owner's later rollout request supersedes the approval limits below. See [stripe-membership-rollout.md](stripe-membership-rollout.md) for current execution status.

Starting commit: `94ef8a35c7e2ec41bf49400df2a586497f70f770`. Branch: `codex/stripe-membership`.

The starting working tree includes homepage/design changes, auth attribution hooks, acquisition/admin routes and migrations, shared membership configuration, and an uncommitted capacity foundation. Preserve all of these. No commits, pushes, deployments, hosted database edits or live Stripe changes are authorized.

## Existing architecture

- Authentication: Supabase SSR cookie client, `auth.getUser()`, verified account context and request-scoped React cache. Signup creates a profile only. Provider credentials stay environment-managed.
- Full access: `public.membership_entitlements`, read-own RLS, no ordinary-user writes. Application and database project/resource checks evaluate enabled, start, expiry and revocation on each operation.
- Starter: `idea_access_grants`, `starter-pergola-v1`, IDEA #001, one account-owned project. No signup promotion and no configured starter payment/duration.
- Acquisition: visit and locked user attribution, operational admin allowlist, service-only `record_acquisition_payment_event`, payment and webhook ledgers. Test payments are excluded from production revenue metrics.
- Migrations: ordered local SQL, pgTAP regression tests, local integration scripts. Existing uncommitted capacity foundation uses private subscriptions, numbered claims (1–600), waitlist and billing-event inbox. Feature flags default closed.
- Homepage: approved carbon/lime vault, shared $14.99/month and 600 capacity; 200-member fixture only in development/preview. `/membership` already shares price but says checkout unavailable. Account area is sage/emerald.
- Server architecture: route handlers and server actions; fresh authorization at each mutation. No Stripe dependency or webhook endpoint at audit time.
- Admin: `/admin/race` uses database-backed `is_acquisition_admin()`, which can guard billing overview without introducing metadata-based roles.
- Environment: `.env.example` names public Supabase URL/key, application origin, acquisition toggle and analytics/canonical origin. `.env.local` is ignored. No Stripe or service key is present there at audit time; secret values were not printed.
- Hosting: Next 16.3.5; Node route handlers; no project Vercel cron configuration. Local runtime dependency discovery is necessary because Node/npm are not on the shell PATH.
- Tests: Vitest/jsdom, server-only alias, access-policy/offer/workspace tests; Supabase pgTAP and local SSR integration scripts. Docker and local Supabase exist; isolate billing DB tests from existing customer/fixture data.

## Conflicts and implementation decisions

1. Private foundation RPCs cannot be invoked via the currently exposed PostgREST schemas. Add narrowly scoped public wrappers, explicitly revoke PUBLIC/anon/authenticated execution, require service-role claims and keep private tables inaccessible.
2. A wall-clock reservation cleanup is unsafe when Checkout succeeded but webhook delivery is delayed. Keep every unresolved checkout claim occupied until provider-confirmed expiry. Unknown API timeouts fail closed and remain visible for reconciliation.
3. A normal renewal may be paid while its webhook is delayed. Hold the existing claim through uncertain renewal state; distinguish current paid entitlements from temporarily held slots. Cancel-at-period-end releases only after actual entitlement expiry.
4. Legacy manual/complimentary full grants must be accounted for before checkout cutover. Preserve the existing reconciliation gate; do not rewrite customer grants or silently claim production capacity is zero.
5. Webhook delivery ordering alone cannot establish current entitlement. Fetch current Stripe subscription and paid invoice under a per-local-subscription lease, then apply with a fencing token in a database transaction. Duplicate event processing and entitlement/payment projection commit together.
6. No additional grace: past-due access lasts only through the last confirmed paid invoice period. No trial access, browser redirect grants, client-supplied price, or starter conversion.
7. Billing UI reuses existing route styles; no new animation or redesign is needed. The account task is review access/manage billing; the owner task is review allocation, reservations and payment issues. Capacity is the signature instrument.
8. Waitlist initially accepts verified accounts using the server-verified email. Persist deduplicated enrollment and future invitation fields; no mail is sent and no queue position is invented. Invitation delivery requires a separately authorized channel.

Documentation basis: [Stripe webhooks](https://docs.stripe.com/webhooks), [Checkout session expiry](https://docs.stripe.com/api/checkout/sessions/create), [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security). Local Next route-handler and server-action guides were read before implementation. Current Supabase changelog was checked; no relevant breaking change affects this existing SSR architecture.
