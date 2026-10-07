import "server-only";
import type Stripe from "stripe";
import { readBillingConfig } from "./billing-config";
import { billingCommand, type BillingSubscription } from "./billing-store.server";
import { eventMembershipReference, membershipWebhookEvents, paidInvoiceWindow, stripeId } from "./billing-projection";
import { getStripe } from "./stripe.server";

type Command = typeof billingCommand;
export async function reconcileMembership(row: BillingSubscription, event: { id: string; type: string; created: number; expectedSubscriptionId?:string; paidInvoiceId?:string },
  stripe: Stripe = getStripe(), command: Command = billingCommand) {
  const config = readBillingConfig();
  const lease = await command<{ token?: string; duplicate?: boolean }>("lease", { id: row.id, event_id: event.id });
  if (lease.duplicate) return { duplicate: true };
  if (!lease.token) throw new Error("Reconciliation lease unavailable.");
  try {
    if (!row.provider_checkout_session_id) {
      if (!row.provider_customer_id) throw new Error("Checkout binding requires recovery.");
      // Recover a session created during a network timeout before the local
      // binding committed. Never free a claim solely because this list is empty.
      let recovered:Stripe.Checkout.Session|null=null;
      await stripe.checkout.sessions.list({customer:row.provider_customer_id,limit:100}).autoPagingEach(candidate=>{
        if(candidate.client_reference_id===row.id&&candidate.metadata?.incomenow_reservation_id===row.id){recovered=candidate;return false;}
      });
      if(!recovered) throw new Error("Checkout outcome remains unknown.");
      const recoveredId=(recovered as Stripe.Checkout.Session).id;
      await command("bind_checkout",{id:row.id,user_id:row.user_id,customer_id:row.provider_customer_id,price_id:config.priceId,session_id:recoveredId});
      row={...row,provider_checkout_session_id:recoveredId};
    }
    const sessionId=row.provider_checkout_session_id;
    if(!sessionId) throw new Error("Checkout binding unavailable.");
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.livemode !== config.livemode || session.mode !== "subscription" || session.client_reference_id !== row.id
      || session.metadata?.incomenow_reservation_id !== row.id || stripeId(session.customer) !== row.provider_customer_id
      || row.provider_price_id !== config.priceId) throw new Error("Checkout binding mismatch.");
    const subscriptionId = stripeId(session.subscription);
    if(event.expectedSubscriptionId && event.expectedSubscriptionId!==subscriptionId) throw new Error("Event subscription mismatch.");
    let subscription: Stripe.Subscription | null = null;
    let invoice: Stripe.Invoice | null = null;
    if (subscriptionId) {
      subscription = await stripe.subscriptions.retrieve(subscriptionId, { expand: ["latest_invoice"] });
      if (subscription.livemode !== config.livemode || stripeId(subscription.customer) !== row.provider_customer_id
        || subscription.metadata.incomenow_reservation_id !== row.id
        || (row.provider_subscription_id && row.provider_subscription_id !== subscription.id)
        || subscription.items.has_more || subscription.items.data.length !== 1
        || subscription.items.data[0].price.id !== config.priceId || subscription.items.data[0].quantity !== 1
        || subscription.items.data[0].price.livemode !== config.livemode) {
        throw new Error("Subscription binding mismatch.");
      }
      const latest = subscription.latest_invoice;
      invoice = typeof latest === "string" ? await stripe.invoices.retrieve(latest) : latest;
    }
    const paid = subscription && row.provider_customer_id ? paidInvoiceWindow(invoice,subscription.id,row.provider_customer_id,config.priceId,config.livemode) : null;
    // Entitlement uses current Stripe state; acquisition records the actual paid
    // invoice event, including a delayed invoice from an earlier billing period.
    const captureInvoice=event.paidInvoiceId && invoice?.id!==event.paidInvoiceId ? await stripe.invoices.retrieve(event.paidInvoiceId) : invoice;
    const capturedPaid=subscription && row.provider_customer_id ? paidInvoiceWindow(captureInvoice,subscription.id,row.provider_customer_id,config.priceId,config.livemode) : null;
    return await command("sync", { id: row.id, token: lease.token, user_id: row.user_id,
      customer_id: row.provider_customer_id, session_id: session.id, price_id: config.priceId,livemode:config.livemode,
      provider_subscription_id: subscription?.id ?? null, provider_status: subscription?.status ?? null,
      // Portal cancellation can set an explicit cancel_at while leaving the
      // legacy boolean false. Both retain the last verified paid window.
      checkout_status: session.status, cancel_at_period_end: !!subscription && (subscription.cancel_at_period_end || subscription.cancel_at != null),
      paid_start: paid?.start ?? null, paid_end: paid?.end ?? null,
      invoice_id: capturedPaid?.invoiceId ?? null, invoice_amount: capturedPaid?.amount ?? null, invoice_paid_at: capturedPaid?.paidAt ?? null,
      event_id: event.id, event_type: event.type, event_created_at: new Date(event.created*1000).toISOString() });
  } catch (error) {
    await command("unlock", { id: row.id, token: lease.token }).catch(()=>undefined);
    throw error;
  }
}

export async function processMembershipEvent(event: Stripe.Event, stripe: Stripe = getStripe(), command: Command = billingCommand) {
  if (event.livemode !== readBillingConfig().livemode) throw new Error("Webhook mode mismatch.");
  if (!(membershipWebhookEvents as readonly string[]).includes(event.type)) return { ignored: true };
  const ref = eventMembershipReference(event);
  if (!ref || !Object.values(ref).some(Boolean)) return { ignored: true };
  // Metadata can locate a candidate only. Stored checkout/customer/price IDs are
  // independently reconciled against Stripe before anything is projected.
  if (ref.id && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(ref.id)) throw new Error("Invalid reservation reference.");
  const row = await command<BillingSubscription | null>("lookup", ref);
  if (!row) {
    if (ref.id) throw new Error("Unknown IncomeNow reservation.");
    return { ignored: true }; // unrelated products in the same account
  }
  if("session_id" in ref && ref.session_id!==row.provider_checkout_session_id) throw new Error("Event checkout mismatch.");
  return reconcileMembership(row,{...event,expectedSubscriptionId:"provider_subscription_id" in ref?ref.provider_subscription_id??undefined:undefined,
    paidInvoiceId:event.type==="invoice.paid"&&event.data.object.object==="invoice"?event.data.object.id:undefined},stripe,command);
}
