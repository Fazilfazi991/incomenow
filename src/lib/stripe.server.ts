import "server-only";
import Stripe from "stripe";
import { matchesMembershipPrice, readBillingConfig } from "./billing-config";

export function getStripe() {
  const config = readBillingConfig();
  return new Stripe(config.secretKey, { timeout: 15_000, maxNetworkRetries: 2 });
}

export async function verifyStripeOffer(stripe: Stripe) {
  const config = readBillingConfig();
  const [price,product] = await Promise.all([stripe.prices.retrieve(config.priceId),stripe.products.retrieve(config.productId)]);
  if (!matchesMembershipPrice(price, config) || !product.active || product.livemode !== config.livemode) throw new Error("Membership product or price does not match the approved offer.");
  return config;
}
