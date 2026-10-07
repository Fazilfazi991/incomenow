/** Approved product presentation. This configuration never grants entitlement. */
const fullMembershipAmountMinor = 1499;
const fullMembershipPrice = (fullMembershipAmountMinor / 100).toFixed(2);
const fullMembership = {
  code: "full-membership-monthly",
  name: "IncomeNow Membership",
  amountMinor: fullMembershipAmountMinor,
  currency: "USD",
  priceLabel: `$${fullMembershipPrice}`,
  priceLabelUsd: `US$${fullMembershipPrice}`,
  interval: "month",
  billingInterval: "Monthly",
  capacity: 600,
  availabilityMode: "registration-open",
  checkoutAvailable: false,
  waitlistMode: "not-connected",
  status: "checkout-not-connected",
} as const;

const starter = {
  code: "starter-pergola-v1",
  name: "IncomeNow Starter Pass",
  marketingAction: "Try IncomeNow for US$1",
  amountMinor: 100,
  currency: "USD",
  priceLabel: "US$1",
  proposedBillingModel: "one-time",
  boundIdeaId: "idea-001",
  maximumDistinctStarterIdeas: 1,
  maximumProjectsForStarterIdea: 1,
  accessDuration: "unconfigured",
  checkoutAvailable: false,
  status: "unconfigured",
} as const;

export const membershipConfig = { fullMembership, starter } as const;
