import { describe, expect, it } from "vitest";
import { calculateResumiScenario, normaliseScenarioNumber } from "./resumi-scenario-planner";

describe("Resumi monetisation scenario planner", () => {
  it("calculates subscription, lifetime, advertising, operating cost and gross margin", () => {
    expect(calculateResumiScenario({
      monthlyActiveUsers: 10_000,
      freeToPaidPercent: 2,
      premiumPrice: 8,
      lifetimePurchases: 10,
      lifetimePrice: 40,
      monetisedPageviewsPerUser: 3,
      advertisingRpm: 5,
      aiProviderCost: 200,
      hostingCost: 100,
      databaseCost: 80,
      emailStorageCost: 20,
      otherOperatingCosts: 50,
    })).toEqual({
      paidUsers: 200,
      subscriptionRevenue: 1_600,
      lifetimeRevenue: 400,
      advertisingRevenue: 150,
      operatingCost: 450,
      totalRevenue: 2_150,
      grossMargin: 1_700,
    });
  });

  it("keeps blank, invalid and negative assumptions conservative", () => {
    expect(normaliseScenarioNumber("")).toBe(0);
    expect(normaliseScenarioNumber("not-a-number")).toBe(0);
    expect(normaliseScenarioNumber("-2")).toBe(0);
    expect(normaliseScenarioNumber("2.75")).toBe(2.75);
  });
});
