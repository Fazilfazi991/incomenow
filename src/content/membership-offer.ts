export const STARTER_OFFER_CODE = "starter-pergola-v1";
export const STARTER_IDEA_ID = "idea-001";

export const starterOffer = {
  code: STARTER_OFFER_CODE,
  name: "IncomeNow Starter Pass",
  marketingAction: "Try IncomeNow for US$1",
  amountMinor: 100,
  currency: "USD",
  priceLabel: "US$1",
  proposedBillingModel: "one-time",
  boundIdeaId: STARTER_IDEA_ID,
  maximumDistinctStarterIdeas: 1,
  maximumProjectsForStarterIdea: 1,
  accessDuration: "unconfigured",
  checkoutAvailable: false,
  status: "unconfigured",
} as const;

export const fullMembershipOffer = {
  code: "full-membership-monthly",
  name: "IncomeNow full membership",
  billingInterval: "Monthly",
  amountMinor: null,
  currency: null,
  priceLabel: "Price to be confirmed",
  checkoutAvailable: false,
  status: "unconfigured",
} as const;

export const incomeNowOffers = {
  starter: starterOffer,
  fullMembership: fullMembershipOffer,
} as const;

// Compatibility name for existing imports while the public offer UI moves to two offers.
export const membershipOffer = fullMembershipOffer;
