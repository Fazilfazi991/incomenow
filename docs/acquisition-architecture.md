# Acquisition race architecture

## Existing system

- Next.js 16 App Router with a root `proxy.ts` for Supabase SSR session refresh.
- Supabase authentication supports email/password and Google OAuth. `profiles` is the minimal account record; paid access is represented separately by `membership_entitlements` and `idea_access_grants`.
- There is currently no checkout provider, payment ledger, payment webhook, GA4 integration, or admin route. The public membership UI explicitly says checkout is not connected.

## Attribution hook points

```text
Incoming host or ?src key
  -> /api/acquisition/visit validates the source against acquisition_sources
  -> random HttpOnly first-party visitor/session cookies
  -> immutable acquisition_visitors first touch + deduplicated sessions/pageviews
  -> successful registration/login/OAuth confirmation calls lock_acquisition_user_attribution
  -> one immutable acquisition_user_attribution row per account
  -> future trusted payment webhook records idempotent acquisition_payments + webhook events
  -> service-role function snapshots the account's locked source
  -> admin-only get_acquisition_race RPC
  -> /admin/race leaderboard, funnel, series, and anonymous activity feed
```

The database is authoritative. Browser tracking never records revenue, callers cannot choose a source UUID, and later visits cannot replace an existing visitor or account first touch. Existing accounts are backfilled as locked/unattributed so a later campaign visit cannot fabricate historical attribution.

## Payment boundary

No payment provider exists in this repository, so this change does not invent checkout or a provider webhook. It adds a provider-neutral, RLS-closed payment event table and a service-role-only recording function. A future verified provider webhook must call that function only after confirming a successful or refunded transaction. Provider and transaction identifiers form the idempotency boundary.

## Privacy and traffic quality

The cookies contain random UUIDs only. The tracker stores host, landing path, referrer origin/path, timestamps, and a one-way user-agent hash; it does not store names, email addresses, payment credentials, or raw user-agent strings. Requests for static assets/API routes, common bots, health checks, admin pages, and rapid duplicate pageviews are excluded from competition traffic.

## Domain and admin setup

Apply `supabase/migrations/20260923120000_acquisition_race.sql`, then configure the three placeholder rows in the database. Use lowercase hostnames without a scheme, port, path, or trailing slash:

```sql
update public.acquisition_sources
set team_member_name = 'PERSON NAME', display_name = 'TEAM LABEL', domain = 'domain.example'
where source_key = 'team_a';

update public.acquisition_sources
set team_member_name = 'PERSON NAME', display_name = 'TEAM LABEL', domain = 'domain.example'
where source_key = 'team_b';

update public.acquisition_sources
set team_member_name = 'PERSON NAME', display_name = 'TEAM LABEL', domain = 'domain.example'
where source_key = 'team_c';
```

After the migration is applied and the source rows are configured, enable capture in the application environment:

```text
NEXT_PUBLIC_ACQUISITION_TRACKING_ENABLED=true
```

It defaults to off so application code can be released without sending capture calls to a database that has not received the migration yet.

For redirecting domains, redirect to `https://PRIMARY_HOST/?src=team_a` (or `team_b` / `team_c`). The tracker removes `src` from the visible URL after capture.

Grant dashboard access to an already verified account through a privileged migration or Supabase SQL operation:

```sql
insert into public.acquisition_admins (user_id)
select id from auth.users where email = 'ADMIN_EMAIL';
```

The protected dashboard is `/admin/race`. Ordinary authenticated accounts receive a not-found response and all underlying acquisition tables remain RLS-closed.

### Values still required

```text
Team A domain → ______
Team B domain → ______
Team C domain → ______
Admin account email → ______
```
