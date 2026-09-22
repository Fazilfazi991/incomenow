export type ZeroDebtScenarioInputs = {
  monthlyActiveUsers: number;
  premiumConversionPercent: number;
  monthlyPremiumPrice: number;
  adRpm: number;
  averageMonthlySessionsPerUser: number;
  hostingCost: number;
  databaseCost: number;
  emailCost: number;
  aiApiCost: number;
  otherTechnicalCost: number;
};

const MAX_INPUT = 1_000_000_000;

export function normaliseScenarioNumber(value: string | number) {
  const parsed = typeof value === "number" ? value : Number.parseFloat(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return 0;
  return Math.min(parsed, MAX_INPUT);
}

export function calculateZeroDebtScenario(input: ZeroDebtScenarioInputs) {
  const conversionRate = Math.min(input.premiumConversionPercent, 100) / 100;
  const premiumCustomers = input.monthlyActiveUsers * conversionRate;
  const premiumRevenue = premiumCustomers * input.monthlyPremiumPrice;
  const monthlyAdImpressions = input.monthlyActiveUsers * input.averageMonthlySessionsPerUser;
  const advertisingRevenue = (monthlyAdImpressions / 1_000) * input.adRpm;
  const estimatedTechnicalCost = input.hostingCost + input.databaseCost + input.emailCost + input.aiApiCost + input.otherTechnicalCost;
  const totalRevenue = premiumRevenue + advertisingRevenue;
  const grossMargin = totalRevenue - estimatedTechnicalCost;
  const grossMarginPercent = totalRevenue > 0 ? (grossMargin / totalRevenue) * 100 : 0;

  return {
    premiumCustomers,
    premiumRevenue,
    monthlyAdImpressions,
    advertisingRevenue,
    estimatedTechnicalCost,
    totalRevenue,
    grossMargin,
    grossMarginPercent,
  };
}
