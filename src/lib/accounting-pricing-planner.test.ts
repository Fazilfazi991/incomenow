import { describe, expect, it } from "vitest";
import { calculateAccountingPricing, normaliseAccountingPlannerNumber, type AccountingPricingInputs } from "./accounting-pricing-planner";

const input: AccountingPricingInputs = {
  hosting: 25, database: 30, domain: 5, email: 10, aiProvider: 20, monitoring: 10,
  discoveryHours: 4, configurationHours: 12, migrationHours: 8, testingHours: 6, trainingHours: 3, handoverHours: 2,
  hourlyCost: 40, implementationFee: 1800, migrationFee: 500, trainingFee: 250, recurringSupportFee: 150,
};

describe("accounting pricing planner", () => {
  it("models costs, delivery hours, fees, and projected gross margin without inventing a currency", () => {
    expect(calculateAccountingPricing(input)).toEqual({
      recurringTechnicalCosts: 100,
      deliveryHours: 35,
      labourCost: 1400,
      totalCost: 1500,
      modelledFees: 2700,
      grossMargin: 1200,
      grossMarginPercent: (1200 / 2700) * 100,
    });
  });

  it("normalises empty, negative, and invalid values to zero while retaining decimals", () => {
    expect(normaliseAccountingPlannerNumber("")).toBe(0);
    expect(normaliseAccountingPlannerNumber("-7")).toBe(0);
    expect(normaliseAccountingPlannerNumber("abc")).toBe(0);
    expect(normaliseAccountingPlannerNumber("12.75")).toBe(12.75);
  });

  it("avoids division by zero when no fee assumptions are entered", () => {
    const zeroFees = { ...input, implementationFee: 0, migrationFee: 0, trainingFee: 0, recurringSupportFee: 0 };
    expect(calculateAccountingPricing(zeroFees).grossMarginPercent).toBe(0);
  });
});
