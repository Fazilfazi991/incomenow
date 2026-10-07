import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database, Json } from "@/types/database";
import { membershipConfig } from "./membership-config";

export type BillingSubscription = {
  id: string; user_id: string; state: "pending" | "active" | "cancel_at_period_end" | "expired" | "cancelled";
  checkout_idempotency_key: string; provider_customer_id: string | null; provider_subscription_id: string | null;
  provider_checkout_session_id: string | null; provider_price_id: string | null; provider_status: string | null;
  entitlement_starts_at: string | null; entitlement_ends_at: string | null; checkout_expires_at: string; checkout_origin: string;
  checkout_attempt_state:"not_started"|"in_flight"|"attached"|"terminal";
};
export type BillingCapacity = { active: number; reserved: number; capacity: number; allocatable: number; checkout_enabled: boolean;
  waitlist_enabled: boolean; cancelling: number; issues: number; waitlist: number; paid_monthly: number; checkout_reservations?:number; renewal_holds?:number };
export type BillingAccount = { subscription: BillingSubscription | null; customer_id: string | null; waitlist_state: string | null; invitation_active:boolean };
export class BillingStoreError extends Error {
  constructor(public code: string) { super("Billing operation unavailable."); }
}

export async function billingCommand<T>(operation: string, input: Record<string, Json | undefined> = {}): Promise<T> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) throw new BillingStoreError("configuration");
  const client = createClient<Database>(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data, error } = await client.rpc("membership_billing_command", { p_operation: operation, p_input: {...input,livemode:process.env.STRIPE_BILLING_MODE === "live"} as Json });
  if (error) throw new BillingStoreError(error.code);
  return data as T;
}

export async function getBillingCapacity(): Promise<BillingCapacity | null> {
  try {
    const value = await billingCommand<BillingCapacity>("capacity");
    if (![value.active,value.reserved,value.allocatable,value.paid_monthly].every(n=>Number.isInteger(n)&&n>=0)
    || value.capacity !== membershipConfig.fullMembership.capacity || value.active>value.capacity || value.active+value.reserved>value.capacity) return null;
    return value;
  } catch { return null; }
}

export async function getBillingAccount(userId: string): Promise<BillingAccount | null> {
  try { return await billingCommand<BillingAccount>("account", { user_id: userId }); } catch { return null; }
}
