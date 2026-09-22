export type AccountingPricingInputs = {
  hosting: number;
  database: number;
  domain: number;
  email: number;
  aiProvider: number;
  monitoring: number;
  discoveryHours: number;
  configurationHours: number;
  migrationHours: number;
  testingHours: number;
  trainingHours: number;
  handoverHours: number;
  hourlyCost: number;
  implementationFee: number;
  migrationFee: number;
  trainingFee: number;
  recurringSupportFee: number;
};

export function normaliseAccountingPlannerNumber(value: string | number) {
  const parsed = typeof value === "number" ? value : Number.parseFloat(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

export function calculateAccountingPricing(input: AccountingPricingInputs) {
  const recurringTechnicalCosts = input.hosting + input.database + input.domain + input.email + input.aiProvider + input.monitoring;
  const deliveryHours = input.discoveryHours + input.configurationHours + input.migrationHours + input.testingHours + input.trainingHours + input.handoverHours;
  const labourCost = deliveryHours * input.hourlyCost;
  const modelledFees = input.implementationFee + input.migrationFee + input.trainingFee + input.recurringSupportFee;
  const totalCost = recurringTechnicalCosts + labourCost;
  const grossMargin = modelledFees - totalCost;
  const grossMarginPercent = modelledFees > 0 ? (grossMargin / modelledFees) * 100 : 0;

  return { recurringTechnicalCosts, deliveryHours, labourCost, totalCost, modelledFees, grossMargin, grossMarginPercent };
}
