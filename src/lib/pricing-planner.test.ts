import { describe, expect, it } from "vitest";
import { calculateClinicPricing, normalisePlannerNumber, type ClinicPricingInputs } from "./pricing-planner";

const base: ClinicPricingInputs = {
  domain: 10.5, hosting: 20, backend: 30, email: 4.5, paidApis: 5, otherSoftware: 10,
  customisationHours: 10, dataImportHours: 2.5, testingHours: 3, trainingHours: 1.5, supportHours: 3,
  hourlyCost: 25, setupFee: 900, additionalCustomisation: 100, ongoingMaintenance: 50, managedHosting: 25,
};

describe("Clinic pricing planner", () => {
  it("calculates direct costs, labour, delivery cost, and projected gross margin", () => {
    expect(calculateClinicPricing(base)).toEqual({
      directCosts: 80,
      recurringTechnicalCosts: 80,
      hours: 20,
      labourCost: 500,
      oneTimeDeliveryCost: 500,
      deliveryCost: 580,
      modelledFees: 1075,
      grossMargin: 495,
      grossMarginPercent: expect.closeTo(46.0465, 3),
    });
  });

  it("handles zero, empty, negative, and decimal values safely", () => {
    expect(normalisePlannerNumber("")).toBe(0);
    expect(normalisePlannerNumber("-4")).toBe(0);
    expect(normalisePlannerNumber("2.75")).toBe(2.75);
    expect(calculateClinicPricing({ ...base, setupFee: 0, additionalCustomisation: 0, ongoingMaintenance: 0, managedHosting: 0 }).grossMarginPercent).toBe(0);
  });
});
