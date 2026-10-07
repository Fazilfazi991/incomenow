import { membershipConfig } from "./membership-config";

export type BillingConfig = { mode: "test" | "live"; livemode: boolean; secretKey: string; webhookSecret: string; productId: string; priceId: string; portalConfigurationId: string; origin: string };

/** Mode and credentials are server owned; database enrollment remains a separate gate. */
export function readBillingConfig(env: Record<string, string | undefined> = process.env): BillingConfig {
  const secretKey = env.STRIPE_SECRET_KEY ?? "";
  const mode = env.STRIPE_BILLING_MODE;
  const origin = new URL(env.APP_ORIGIN ?? "http://localhost:3000");
  if ((mode !== "test" && mode !== "live") || !new RegExp(`^(sk|rk)_${mode}_`).test(secretKey)
    || (env.VERCEL_ENV === "production" && mode !== "live") || (mode === "live" && origin.protocol !== "https:")
    || !env.STRIPE_INCOMENOW_MEMBERSHIP_PRICE_ID?.startsWith("price_")
    || !env.STRIPE_INCOMENOW_MEMBERSHIP_PRODUCT_ID?.startsWith("prod_")
    || !env.STRIPE_WEBHOOK_SECRET?.startsWith("whsec_")
    || !(env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SECRET_KEY) || !env.NEXT_PUBLIC_SUPABASE_URL
    || (origin.protocol !== "https:" && !(origin.protocol === "http:" && ["localhost", "127.0.0.1"].includes(origin.hostname)))
    || origin.username || origin.password || origin.pathname !== "/" || origin.search || origin.hash) {
    throw new Error("Billing is not configured safely.");
  }
  return { mode, livemode:mode === "live", secretKey, webhookSecret: env.STRIPE_WEBHOOK_SECRET, priceId: env.STRIPE_INCOMENOW_MEMBERSHIP_PRICE_ID,
    productId: env.STRIPE_INCOMENOW_MEMBERSHIP_PRODUCT_ID, portalConfigurationId: env.STRIPE_BILLING_PORTAL_CONFIGURATION_ID ?? "", origin: origin.origin };
}

export function matchesMembershipPrice(price: { active: boolean; livemode: boolean; currency: string; unit_amount: number | null;
  type: string; recurring: { interval: string; interval_count: number; usage_type: string } | null; product: string | { id: string } }, config: Pick<BillingConfig,"productId"|"livemode">) {
  const offer = membershipConfig.fullMembership;
  return price.active && price.livemode === config.livemode && price.currency === offer.currency.toLowerCase() && price.unit_amount === offer.amountMinor
    && price.type === "recurring" && price.recurring?.interval === offer.interval && price.recurring.interval_count === 1
    && price.recurring.usage_type === "licensed" && (typeof price.product === "string" ? price.product : price.product.id) === config.productId;
}
