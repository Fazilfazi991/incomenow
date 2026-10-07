import "server-only";
import { readBillingConfig } from "./billing-config";
import { getBillingCapacity } from "./billing-store.server";
import { resolveMembershipStats } from "./membership-capacity";

export async function getMembershipBillingView() {
  const capacity=await getBillingCapacity();
  let configured=false;
  let portalAvailable=false;
  let mode:"test"|"live"|null=null;
  try { const config=readBillingConfig(); configured=true;mode=config.mode;portalAvailable=config.portalConfigurationId.startsWith("bpc_"); } catch { /* Fail closed without credentials. */ }
  return { capacity, mode, billingConfigured:configured,portalAvailable,checkoutAvailable:configured && !!capacity?.checkout_enabled,
    stats:resolveMembershipStats({verifiedActive:capacity?.active,verifiedReserved:capacity?.reserved}), waitlistAvailable:!!capacity?.waitlist_enabled };
}
