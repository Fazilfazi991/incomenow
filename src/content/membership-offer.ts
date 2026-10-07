import { membershipConfig } from "@/lib/membership-config";

export const STARTER_OFFER_CODE = membershipConfig.starter.code;
export const STARTER_IDEA_ID = membershipConfig.starter.boundIdeaId;

export const starterOffer = membershipConfig.starter;
export const fullMembershipOffer = membershipConfig.fullMembership;
export const incomeNowOffers = membershipConfig;

// Compatibility name for existing imports while the public offer UI moves to two offers.
export const membershipOffer = fullMembershipOffer;
