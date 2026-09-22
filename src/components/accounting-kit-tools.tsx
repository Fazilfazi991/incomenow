"use client";

import { useMemo, useState } from "react";
import { calculateAccountingPricing, normaliseAccountingPlannerNumber, type AccountingPricingInputs } from "@/lib/accounting-pricing-planner";

type Draft = Record<keyof AccountingPricingInputs, string>;

const defaultInputs: Draft = {
  hosting: "", database: "", domain: "", email: "", aiProvider: "", monitoring: "",
  discoveryHours: "", configurationHours: "", migrationHours: "", testingHours: "", trainingHours: "", handoverHours: "",
  hourlyCost: "", implementationFee: "", migrationFee: "", trainingFee: "", recurringSupportFee: "",
};

const recurringFields: Array<[keyof AccountingPricingInputs, string]> = [
  ["hosting", "Application hosting"], ["database", "Database, Auth and backups"], ["domain", "Domain and DNS"],
  ["email", "Transactional email"], ["aiProvider", "Optional AI provider"], ["monitoring", "Monitoring and recovery tools"],
];

const hourFields: Array<[keyof AccountingPricingInputs, string]> = [
  ["discoveryHours", "Discovery and requirements"], ["configurationHours", "Configuration and customisation"],
  ["migrationHours", "Data mapping and migration"], ["testingHours", "Testing and reconciliation"],
  ["trainingHours", "Training"], ["handoverHours", "Deployment and handover"],
];

const feeFields: Array<[keyof AccountingPricingInputs, string]> = [
  ["implementationFee", "Implementation fee"], ["migrationFee", "Data-migration fee"],
  ["trainingFee", "Training fee"], ["recurringSupportFee", "Optional recurring support fee"],
];

function formatNumber(value: number) {
  return new Intl.NumberFormat(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
}

export function AccountingPricingPlanner() {
  const [values, setValues] = useState(defaultInputs);
  const result = useMemo(() => calculateAccountingPricing(Object.fromEntries(
    (Object.keys(values) as Array<keyof AccountingPricingInputs>).map((key) => [key, normaliseAccountingPlannerNumber(values[key])]),
  ) as AccountingPricingInputs), [values]);
  const update = (key: keyof AccountingPricingInputs, raw: string) => setValues((current) => ({ ...current, [key]: raw }));

  return (
    <div className="pricing-planner accounting-pricing-planner">
      <div className="pricing-planner-note"><strong>Planning estimate—not a recommended price or earnings claim.</strong><span>Choose one currency and one recurring-cost period. Values stay in this browser view.</span></div>
      <div className="pricing-planner-grid">
        <fieldset><legend>Recurring technical costs</legend>{recurringFields.map(([key, label]) => <label key={key}><span>{label}</span><input aria-label={label} inputMode="decimal" min="0" onChange={(event) => update(key, event.target.value)} step="0.01" type="number" value={values[key]} /></label>)}</fieldset>
        <fieldset><legend>Delivery hours and internal cost</legend>{hourFields.map(([key, label]) => <label key={key}><span>{label}</span><input aria-label={label} inputMode="decimal" min="0" onChange={(event) => update(key, event.target.value)} step="0.25" type="number" value={values[key]} /></label>)}<label><span>Hourly internal cost</span><input aria-label="Hourly internal cost" inputMode="decimal" min="0" onChange={(event) => update("hourlyCost", event.target.value)} step="0.01" type="number" value={values.hourlyCost} /></label></fieldset>
        <fieldset><legend>Customer fee assumptions</legend>{feeFields.map(([key, label]) => <label key={key}><span>{label}</span><input aria-label={label} inputMode="decimal" min="0" onChange={(event) => update(key, event.target.value)} step="0.01" type="number" value={values[key]} /></label>)}</fieldset>
      </div>
      <div className="pricing-results" aria-live="polite">
        <article><span>Delivery hours</span><strong>{formatNumber(result.deliveryHours)}</strong><small>From the work estimates entered above</small></article>
        <article><span>Total modelled cost</span><strong>{formatNumber(result.totalCost)}</strong><small>Labour plus one entered period of recurring technical costs</small></article>
        <article><span>Modelled fees</span><strong>{formatNumber(result.modelledFees)}</strong><small>Implementation plus optional services entered above</small></article>
        <article className={result.grossMargin < 0 ? "negative" : ""}><span>Projected gross margin</span><strong>{formatNumber(result.grossMargin)}</strong><small>{formatNumber(result.grossMarginPercent)}% from assumptions—not a forecast</small></article>
      </div>
    </div>
  );
}
