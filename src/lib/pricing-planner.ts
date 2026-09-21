export type ClinicPricingInputs = {
  domain: number;
  hosting: number;
  backend: number;
  email: number;
  paidApis: number;
  otherSoftware: number;
  customisationHours: number;
  dataImportHours: number;
  testingHours: number;
  trainingHours: number;
  supportHours: number;
  hourlyCost: number;
  setupFee: number;
  additionalCustomisation: number;
  ongoingMaintenance: number;
  managedHosting: number;
};

export function normalisePlannerNumber(value: string | number) {
  const parsed = typeof value === "number" ? value : Number.parseFloat(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

export function calculateClinicPricing(input: ClinicPricingInputs) {
  const directCosts = input.domain + input.hosting + input.backend + input.email + input.paidApis + input.otherSoftware;
  const hours = input.customisationHours + input.dataImportHours + input.testingHours + input.trainingHours + input.supportHours;
  const labourCost = hours * input.hourlyCost;
  const deliveryCost = directCosts + labourCost;
  const modelledFees = input.setupFee + input.additionalCustomisation + input.ongoingMaintenance + input.managedHosting;
  const grossMargin = modelledFees - deliveryCost;
  const grossMarginPercent = modelledFees > 0 ? (grossMargin / modelledFees) * 100 : 0;
  return { directCosts, hours, labourCost, deliveryCost, modelledFees, grossMargin, grossMarginPercent };
}
