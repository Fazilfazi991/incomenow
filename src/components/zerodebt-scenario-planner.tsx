"use client";

import { useMemo, useState } from "react";
import { Calculator, Info } from "lucide-react";
import { calculateZeroDebtScenario, normaliseScenarioNumber, type ZeroDebtScenarioInputs } from "@/lib/zerodebt-scenario-planner";

const fields: ReadonlyArray<{ key: keyof ZeroDebtScenarioInputs; label: string; suffix?: string; group: "audience" | "revenue" | "cost" }> = [
  { key: "monthlyActiveUsers", label: "Monthly active users", group: "audience" },
  { key: "premiumConversionPercent", label: "Premium conversion", suffix: "%", group: "audience" },
  { key: "averageMonthlySessionsPerUser", label: "Average sessions / user", group: "audience" },
  { key: "monthlyPremiumPrice", label: "Monthly premium price", group: "revenue" },
  { key: "adRpm", label: "Advertising RPM", group: "revenue" },
  { key: "hostingCost", label: "Hosting", group: "cost" },
  { key: "databaseCost", label: "Database", group: "cost" },
  { key: "emailCost", label: "Email", group: "cost" },
  { key: "aiApiCost", label: "AI / API", group: "cost" },
  { key: "otherTechnicalCost", label: "Other technical cost", group: "cost" },
];

const emptyInputs = Object.fromEntries(fields.map((field) => [field.key, ""])) as Record<keyof ZeroDebtScenarioInputs, string>;
const number = new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 });

export function ZeroDebtScenarioPlanner() {
  const [values, setValues] = useState(emptyInputs);
  const inputs = useMemo(() => Object.fromEntries(Object.entries(values).map(([key, value]) => [key, normaliseScenarioNumber(value)])) as ZeroDebtScenarioInputs, [values]);
  const result = useMemo(() => calculateZeroDebtScenario(inputs), [inputs]);

  return (
    <section className="zerodebt-planner" aria-labelledby="zerodebt-planner-title">
      <div className="zerodebt-planner-heading">
        <span><Calculator aria-hidden="true" size={20} /></span>
        <div><small>Local arithmetic tool</small><h2 id="zerodebt-planner-title">Build your own monthly scenario</h2><p>Leave unknown assumptions empty. Money outputs use the same currency unit you enter; no exchange rate or tax is applied.</p></div>
      </div>
      <div className="zerodebt-planner-layout">
        <div className="zerodebt-planner-fields">
          {(["audience", "revenue", "cost"] as const).map((group) => (
            <fieldset key={group}>
              <legend>{group === "audience" ? "Audience assumptions" : group === "revenue" ? "Revenue assumptions" : "Monthly technical costs"}</legend>
              <div>{fields.filter((field) => field.group === group).map((field) => (
                <label key={field.key}><span>{field.label}</span><span className="zerodebt-input"><input inputMode="decimal" min="0" step="any" type="number" value={values[field.key]} onChange={(event) => setValues((current) => ({ ...current, [field.key]: event.target.value }))} />{field.suffix ? <em>{field.suffix}</em> : null}</span></label>
              ))}</div>
            </fieldset>
          ))}
        </div>
        <div className="zerodebt-scenario-results" aria-live="polite">
          <span>Scenario result</span>
          <dl>
            <div><dt>Premium customers</dt><dd>{number.format(result.premiumCustomers)}</dd></div>
            <div><dt>Premium revenue</dt><dd>{number.format(result.premiumRevenue)}</dd></div>
            <div><dt>Advertising revenue</dt><dd>{number.format(result.advertisingRevenue)}</dd></div>
            <div><dt>Estimated technical cost</dt><dd>{number.format(result.estimatedTechnicalCost)}</dd></div>
            <div className="primary"><dt>Gross margin</dt><dd>{number.format(result.grossMargin)}</dd></div>
            <div><dt>Gross margin rate</dt><dd>{number.format(result.grossMarginPercent)}%</dd></div>
          </dl>
          <p><Info aria-hidden="true" size={15} /> A scenario result is not expected income, a market forecast, or financial advice. Add payment fees, tax, support, salaries, marketing, refunds, and other real costs before making a decision.</p>
        </div>
      </div>
    </section>
  );
}
