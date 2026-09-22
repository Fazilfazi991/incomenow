export type ResumiScenarioInputs = {
  monthlyActiveUsers: number;
  freeToPaidPercent: number;
  premiumPrice: number;
  lifetimePurchases: number;
  lifetimePrice: number;
  monetisedPageviewsPerUser: number;
  advertisingRpm: number;
  aiProviderCost: number;
  hostingCost: number;
  databaseCost: number;
  emailStorageCost: number;
  otherOperatingCosts: number;
};

export function calculateResumiScenario(input: ResumiScenarioInputs) {
  const paidUsers = input.monthlyActiveUsers * (input.freeToPaidPercent / 100);
  const subscriptionRevenue = paidUsers * input.premiumPrice;
  const lifetimeRevenue = input.lifetimePurchases * input.lifetimePrice;
  const monetisedPageviews = input.monthlyActiveUsers * input.monetisedPageviewsPerUser;
  const advertisingRevenue = (monetisedPageviews / 1_000) * input.advertisingRpm;
  const operatingCost = input.aiProviderCost + input.hostingCost + input.databaseCost + input.emailStorageCost + input.otherOperatingCosts;
  const totalRevenue = subscriptionRevenue + lifetimeRevenue + advertisingRevenue;
  const grossMargin = totalRevenue - operatingCost;
  return { paidUsers, subscriptionRevenue, lifetimeRevenue, advertisingRevenue, operatingCost, totalRevenue, grossMargin };
}

export function normaliseScenarioNumber(value: string | number) {
  const parsed = typeof value === "number" ? value : Number.parseFloat(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}
