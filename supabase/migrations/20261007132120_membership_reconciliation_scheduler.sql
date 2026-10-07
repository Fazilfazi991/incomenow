-- Vercel Hobby cannot schedule five-minute calls. Use the hosted database's
-- supported scheduler; the bearer remains encrypted in Vault, outside Git.
create extension if not exists pg_cron;
create extension if not exists pg_net with schema extensions;
create extension if not exists supabase_vault with schema vault;

create table private.membership_reconciliation_requests(
  request_id bigint primary key,
  requested_at timestamptz not null default now()
);
alter table private.membership_reconciliation_requests enable row level security;
revoke all on private.membership_reconciliation_requests from public,anon,authenticated;
grant select on private.membership_reconciliation_requests to service_role;

create function private.call_membership_reconciliation()
returns bigint language plpgsql security definer set search_path='' as $$
declare v_secret text;v_request bigint;
begin
  select decrypted_secret into v_secret from vault.decrypted_secrets where name='incomenow_billing_reconciliation';
  if v_secret is null or length(v_secret)<32 then raise exception 'Billing scheduler secret unavailable';end if;
  select net.http_get(url:='https://www.millionmonk.com/api/billing/reconcile',
    headers:=jsonb_build_object('Authorization','Bearer '||v_secret),timeout_milliseconds:=180000) into v_request;
  insert into private.membership_reconciliation_requests(request_id) values(v_request);
  delete from private.membership_reconciliation_requests where requested_at<now()-interval '30 days';
  return v_request;
end;
$$;
revoke all on function private.call_membership_reconciliation() from public,anon,authenticated;
grant execute on function private.call_membership_reconciliation() to service_role;
-- Configure Vault and enable a single */5 job only after the application smoke
-- test. A schema migration must never contact an unprepared deployment.
