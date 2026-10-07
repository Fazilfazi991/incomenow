import "server-only";
import { randomUUID } from "node:crypto";
import type Stripe from "stripe";
import { billingCommand, type BillingAccount, type BillingSubscription } from "./billing-store.server";
import { getStripe, verifyStripeOffer } from "./stripe.server";

export async function createMembershipCheckout(user: { id: string; email?: string }) {
  const stripe = getStripe();
  const config = await verifyStripeOffer(stripe);
  const reservation = await billingCommand<BillingSubscription>("reserve", { user_id: user.id, request_id: randomUUID(), origin: config.origin });
  const account = await billingCommand<BillingAccount>("account", { user_id: user.id });
  const customer = account.customer_id ?? (await stripe.customers.create({ metadata: { incomenow_user_id: user.id } },
    { idempotencyKey: `incomenow-customer-${user.id}` })).id;
  await billingCommand("customer", { user_id: user.id, customer_id: customer });
  let session: Stripe.Checkout.Session;
  if (reservation.provider_checkout_session_id) {
    session = await stripe.checkout.sessions.retrieve(reservation.provider_checkout_session_id);
  } else {
    // The persisted expiration/origin/customer make retries byte-for-byte stable.
    // Unknown timeouts keep the claim; they never create another checkout key.
    if(reservation.provider_price_id && reservation.provider_price_id!==config.priceId) throw new Error("Pending checkout price changed.");
    await billingCommand("start_checkout", { id: reservation.id, user_id: user.id,customer_id:customer,price_id:config.priceId });
    session = await stripe.checkout.sessions.create({
      mode: "subscription", customer, allowed_payment_method_types: ["card"],
      line_items: [{ price: config.priceId, quantity: 1 }],
      client_reference_id: reservation.id,
      metadata: { incomenow_reservation_id: reservation.id },
      subscription_data: { metadata: { incomenow_reservation_id: reservation.id } },
      success_url: `${reservation.checkout_origin}/membership/return`,
      cancel_url: `${reservation.checkout_origin}/membership?billing=cancelled`,
      expires_at: Math.floor(Date.parse(reservation.checkout_expires_at)/1000),
      allow_promotion_codes: false, adaptive_pricing: { enabled: false },
    }, { idempotencyKey: `incomenow-checkout-${reservation.id}` });
    await billingCommand("bind_checkout", { id: reservation.id, user_id: user.id, customer_id: customer, session_id: session.id, price_id: config.priceId });
  }
  if (session.livemode !== config.livemode || session.customer !== customer || session.client_reference_id !== reservation.id) throw new Error("Checkout identity mismatch.");
  if (session.status !== "open" || !session.url) throw new Error("This checkout has ended. Refresh membership access.");
  return session.url;
}
