import { describe, expect, it } from "vitest";
import { fullMembershipOffer, starterOffer } from "./membership-offer";

describe("IncomeNow offer configuration", () => {
  it("binds the US$1 one-time starter to the canonical Pergola idea", () => {
    expect(starterOffer).toMatchObject({
      name: "IncomeNow Starter Pass",
      marketingAction: "Try IncomeNow for US$1",
      amountMinor: 100,
      currency: "USD",
      proposedBillingModel: "one-time",
      boundIdeaId: "idea-001",
      maximumDistinctStarterIdeas: 1,
      maximumProjectsForStarterIdea: 1,
      checkoutAvailable: false,
    });
  });

  it("keeps starter duration unresolved and approved monthly pricing separate from checkout", () => {
    expect(starterOffer.accessDuration).toBe("unconfigured");
    expect(fullMembershipOffer.billingInterval).toBe("Monthly");
    expect(fullMembershipOffer.amountMinor).toBe(1499);
    expect(fullMembershipOffer.currency).toBe("USD");
    expect(fullMembershipOffer.checkoutAvailable).toBe(false);
  });
});
