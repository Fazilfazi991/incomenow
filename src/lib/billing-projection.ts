import type Stripe from "stripe";
import { membershipConfig } from "./membership-config";

export const membershipWebhookEvents = ["checkout.session.completed", "checkout.session.expired", "customer.subscription.created",
  "customer.subscription.updated", "customer.subscription.deleted", "invoice.paid", "invoice.payment_failed"] as const;

export function stripeId(value: string | { id: string } | null | undefined): string | null {
  return typeof value === "string" ? value : value?.id ?? null;
}

/** Only a paid invoice for our sole recurring item can extend entitlement. */
export function paidInvoiceWindow(invoice: Stripe.Invoice | null, subscriptionId: string, customerId: string, priceId: string, livemode = false) {
  if (!invoice) return null;
  if (invoice.livemode !== livemode) throw new Error("Invoice mode mismatch.");
  if (invoice.status !== "paid") return null;
  if (stripeId(invoice.customer) !== customerId || stripeId(invoice.parent?.subscription_details?.subscription) !== subscriptionId
    || invoice.currency !== "usd" || invoice.lines.has_more || invoice.lines.data.length !== 1
    || invoice.amount_paid !== membershipConfig.fullMembership.amountMinor) throw new Error("Paid invoice identity or terms mismatch.");
  const line = invoice.lines.data[0];
  if (stripeId(line.pricing?.price_details?.price) !== priceId || line.quantity !== 1
    || line.parent?.subscription_item_details?.proration || line.period.end <= line.period.start) throw new Error("Paid invoice item mismatch.");
  return { start: new Date(line.period.start*1000).toISOString(), end: new Date(line.period.end*1000).toISOString(),
    invoiceId: invoice.id, amount: invoice.amount_paid, paidAt: new Date((invoice.status_transitions.paid_at ?? invoice.created)*1000).toISOString() };
}

export function eventMembershipReference(event: Stripe.Event) {
  const object = event.data.object;
  if (object.object === "checkout.session") return { id: object.client_reference_id, session_id: object.id };
  if (object.object === "subscription") return { provider_subscription_id: object.id, id: object.metadata.incomenow_reservation_id };
  if (object.object === "invoice") return { provider_subscription_id: stripeId(object.parent?.subscription_details?.subscription),
    id: object.parent?.subscription_details?.metadata?.incomenow_reservation_id };
  return null;
}
