"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getAccountAccessContext } from "@/lib/membership.server";
import { createMembershipCheckout } from "@/lib/billing-checkout.server";
import { billingCommand, BillingStoreError, type BillingAccount } from "@/lib/billing-store.server";
import { getStripe } from "@/lib/stripe.server";
import { readBillingConfig } from "@/lib/billing-config";

async function verifiedBillingUser() {
  const context=await getAccountAccessContext();
  if (context.authentication==="signed-out") redirect("/login?next=%2Fmembership");
  if (!context.user || context.authentication!=="verified" || !context.user.email_confirmed_at || context.user.is_anonymous) redirect("/membership?billing=verify");
  return context;
}

export async function joinMembership() {
  const context=await verifiedBillingUser();
  if (context.fullMembership==="active") redirect("/account/access");
  if (context.fullMembership==="unavailable") redirect("/membership?billing=unavailable");
  let url:string;
  try { url=await createMembershipCheckout(context.user!); }
  catch(error) { redirect(`/membership?billing=${error instanceof BillingStoreError && error.code==="P0001" ? "full" : "unavailable"}`); }
  redirect(url);
}

export async function joinMembershipWaitlist() {
  const context=await verifiedBillingUser();
  if (context.fullMembership==="active") redirect("/account/access");
  try { await billingCommand("waitlist",{user_id:context.user!.id,email:context.user!.email!}); }
  catch { redirect("/membership?billing=unavailable"); }
  revalidatePath("/membership");
  redirect("/membership?billing=waitlisted");
}

export async function manageMembershipBilling() {
  const context=await verifiedBillingUser();
  let url:string;
  try {
    const config=readBillingConfig();
    if (!config.portalConfigurationId.startsWith("bpc_")) throw new Error("Portal configuration required.");
    const account=await billingCommand<BillingAccount>("account",{user_id:context.user!.id});
    if (!account.customer_id) throw new Error("Billing customer unavailable.");
    const stripe=getStripe();
    const portalConfig=await stripe.billingPortal.configurations.retrieve(config.portalConfigurationId);
    if (portalConfig.livemode !== config.livemode || !portalConfig.active || !portalConfig.features.payment_method_update.enabled || !portalConfig.features.subscription_cancel.enabled
      || portalConfig.features.subscription_cancel.mode!=="at_period_end" || portalConfig.features.subscription_update.enabled) throw new Error("Unsafe portal configuration.");
    const portal=await stripe.billingPortal.sessions.create({customer:account.customer_id,configuration:config.portalConfigurationId,return_url:`${config.origin}/account/access`});
    url=portal.url;
  } catch { redirect("/membership?billing=unavailable"); }
  redirect(url);
}

export async function cancelMembershipAtPeriodEnd() {
  const context=await verifiedBillingUser();
  try {
    const account=await billingCommand<BillingAccount>("account",{user_id:context.user!.id});
    const row=account.subscription;
    if (!row?.provider_subscription_id || row.provider_customer_id!==account.customer_id) throw new Error("Subscription unavailable.");
    const stripe=getStripe();
    const config=readBillingConfig();
    const subscription=await stripe.subscriptions.retrieve(row.provider_subscription_id);
    if (subscription.livemode !== config.livemode || subscription.customer!==account.customer_id || subscription.metadata.incomenow_reservation_id!==row.id) throw new Error("Subscription mismatch.");
    await stripe.subscriptions.update(subscription.id,{cancel_at_period_end:true},{idempotencyKey:`incomenow-cancel-${row.id}-${subscription.items.data[0]?.current_period_end}`});
    // The signed webhook projects cancellation. An ordinary request never grants access.
  } catch { redirect("/membership?billing=unavailable"); }
  redirect("/account/access?notice=cancellation-requested");
}
