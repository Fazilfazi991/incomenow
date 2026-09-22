"use client";

import { useMemo, useState } from "react";
import { calculateResumiScenario, normaliseScenarioNumber, type ResumiScenarioInputs } from "@/lib/resumi-scenario-planner";

type Draft = Record<keyof ResumiScenarioInputs, string>;

const emptyDraft: Draft = {
  monthlyActiveUsers: "",
  freeToPaidPercent: "",
  premiumPrice: "",
  lifetimePurchases: "",
  lifetimePrice: "",
  monetisedPageviewsPerUser: "",
  advertisingRpm: "",
  aiProviderCost: "",
  hostingCost: "",
  databaseCost: "",
  emailStorageCost: "",
  otherOperatingCosts: "",
};

const fields: Array<{ key: keyof ResumiScenarioInputs; label: string; group: "audience" | "revenue" | "cost" }> = [
  { key: "monthlyActiveUsers", label: "Monthly active users", group: "audience" },
  { key: "freeToPaidPercent", label: "Free-to-paid conversion %", group: "audience" },
  { key: "premiumPrice", label: "Premium price per period", group: "revenue" },
  { key: "lifetimePurchases", label: "Lifetime purchases", group: "revenue" },
  { key: "lifetimePrice", label: "Lifetime price", group: "revenue" },
  { key: "monetisedPageviewsPerUser", label: "Monetised page views per user", group: "revenue" },
  { key: "advertisingRpm", label: "Advertising RPM", group: "revenue" },
  { key: "aiProviderCost", label: "AI / provider cost", group: "cost" },
  { key: "hostingCost", label: "Hosting cost", group: "cost" },
  { key: "databaseCost", label: "Database cost", group: "cost" },
  { key: "emailStorageCost", label: "Email / storage cost", group: "cost" },
  { key: "otherOperatingCosts", label: "Other operating costs", group: "cost" },
];

function format(value: number) {
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(value);
}

export function ResumiScenarioPlanner() {
  const [draft, setDraft] = useState(emptyDraft);
  const result = useMemo(() => calculateResumiScenario(Object.fromEntries(
    (Object.keys(draft) as Array<keyof ResumiScenarioInputs>).map((key) => [key, normaliseScenarioNumber(draft[key])]),
  ) as ResumiScenarioInputs), [draft]);

  const group = (name: "audience" | "revenue" | "cost", legend: string) => (
    <fieldset>
      <legend>{legend}</legend>
      {fields.filter((field) => field.group === name).map((field) => (
        <label key={field.key}>
          <span>{field.label}</span>
          <input
            inputMode="decimal"
            min="0"
            onChange={(event) => setDraft((current) => ({ ...current, [field.key]: event.target.value }))}
            step={field.key === "freeToPaidPercent" ? "0.1" : "0.01"}
            type="number"
            value={draft[field.key]}
          />
        </label>
      ))}
    </fieldset>
  );

  return <div className="pricing-planner resumi-scenario-planner">
    <div className="pricing-planner-note"><strong>Scenario based on your assumptions. Not a revenue forecast or guarantee.</strong><span>Blank inputs remain zero. Use one currency and one consistent billing period.</span></div>
    <div className="pricing-planner-grid">{group("audience", "Audience assumptions")}{group("revenue", "Revenue assumptions")}{group("cost", "Operating-cost assumptions")}</div>
    <div className="resumi-scenario-results" aria-live="polite">
      <article><span>Scenario paid users</span><strong>{format(result.paidUsers)}</strong><small>MAU × your conversion assumption</small></article>
      <article><span>Subscription revenue</span><strong>{format(result.subscriptionRevenue)}</strong><small>Excludes lifetime purchases</small></article>
      <article><span>Lifetime revenue</span><strong>{format(result.lifetimeRevenue)}</strong><small>Purchases × entered lifetime price</small></article>
      <article><span>Advertising revenue</span><strong>{format(result.advertisingRevenue)}</strong><small>Entered page views × RPM</small></article>
      <article><span>Operating cost</span><strong>{format(result.operatingCost)}</strong><small>Entered provider and operating costs</small></article>
      <article className={result.grossMargin < 0 ? "negative" : ""}><span>Scenario gross margin</span><strong>{format(result.grossMargin)}</strong><small>Total modelled revenue minus entered costs</small></article>
    </div>
  </div>;
}
