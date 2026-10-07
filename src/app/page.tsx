import type { Metadata } from "next";
import { Barlow_Condensed } from "next/font/google";
import { publicPageMetadata } from "@/lib/site-config";
import { getPublicIdeas } from "@/content/public-content.server";
import { getPublicAccountState } from "@/lib/public-account.server";
import { membershipLaunch } from "@/lib/membership-capacity";
import { getMembershipBillingView } from "@/lib/billing-view.server";
import { VaultHomepage } from "@/components/homepage/vault-home";

const vaultDisplay = Barlow_Condensed({ subsets: ["latin"], weight: ["600", "700"], variable: "--font-vault-display", display: "swap" });

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  ...publicPageMetadata("/"),
  title: "Your next business is inside",
  description: `Explore the IncomeNow opportunity vault: practical business kits, execution resources, and a personal workspace. Membership is limited to ${membershipLaunch.capacity} active members.`,
};

export default async function HomePage() {
  const [state, billing, ideas] = await Promise.all([
    getPublicAccountState(),
    getMembershipBillingView(),
    getPublicIdeas(),
  ]);
  return <VaultHomepage state={state} ideas={ideas} stats={billing.stats} billingAvailable={billing.checkoutAvailable} fontClass={vaultDisplay.variable} />;
}
