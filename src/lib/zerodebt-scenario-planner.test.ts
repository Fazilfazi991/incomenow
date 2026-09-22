import { describe, expect, it } from "vitest";
import { calculateZeroDebtScenario, normaliseScenarioNumber, type ZeroDebtScenarioInputs } from "./zerodebt-scenario-planner";

const scenario: ZeroDebtScenarioInputs = {
  monthlyActiveUsers: 10_000,
  premiumConversionPercent: 4,
  monthlyPremiumPrice: 6,
  adRpm: 3,
  averageMonthlySessionsPerUser: 8,
  hostingCost: 250,
  databaseCost: 180,
  emailCost: 40,
  aiApiCost: 300,
  otherTechnicalCost: 30,
};

describe("ZeroDebt scenario planner", () => {
  it("calculates premium, advertising, cost, and gross-margin outputs", () => {
    expect(calculateZeroDebtScenario(scenario)).toEqual({
      premiumCustomers: 400,
      premiumRevenue: 2_400,
      monthlyAdImpressions: 80_000,
      advertisingRevenue: 240,
      estimatedTechnicalCost: 800,
      totalRevenue: 2_640,
      grossMargin: 1_840,
      grossMarginPercent: expect.closeTo(69.697, 3),
    });
  });

  it("normalises empty, negative, non-finite, decimal, and extreme inputs safely", () => {
    expect(normaliseScenarioNumber("")).toBe(0);
    expect(normaliseScenarioNumber("-12")).toBe(0);
    expect(normaliseScenarioNumber("2.75")).toBe(2.75);
    expect(normaliseScenarioNumber(Number.POSITIVE_INFINITY)).toBe(0);
    expect(normaliseScenarioNumber("9999999999")).toBe(1_000_000_000);
  });

  it("caps conversion at one hundred percent and avoids a zero-revenue division", () => {
    expect(calculateZeroDebtScenario({ ...scenario, premiumConversionPercent: 125 }).premiumCustomers).toBe(10_000);
    expect(calculateZeroDebtScenario({ ...scenario, monthlyActiveUsers: 0 }).grossMarginPercent).toBe(0);
  });
});
