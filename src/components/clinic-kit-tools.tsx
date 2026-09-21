"use client";

import { useMemo, useState } from "react";
import { Check, Clipboard, Download } from "lucide-react";
import { calculateClinicPricing, normalisePlannerNumber, type ClinicPricingInputs } from "@/lib/pricing-planner";

type ClinicPricingDraft = Record<keyof ClinicPricingInputs, string>;

const defaultInputs: ClinicPricingDraft = {
  domain: "", hosting: "", backend: "", email: "", paidApis: "", otherSoftware: "",
  customisationHours: "", dataImportHours: "", testingHours: "", trainingHours: "", supportHours: "",
  hourlyCost: "", setupFee: "", additionalCustomisation: "", ongoingMaintenance: "", managedHosting: "",
};

const costFields: Array<[keyof ClinicPricingInputs, string]> = [
  ["domain", "Domain"], ["hosting", "Hosting"], ["backend", "Database / backend"],
  ["email", "Transactional email"], ["paidApis", "Paid APIs"], ["otherSoftware", "Other software"],
];

const hourFields: Array<[keyof ClinicPricingInputs, string]> = [
  ["customisationHours", "Customisation hours"], ["dataImportHours", "Data-import hours"],
  ["testingHours", "Testing hours"], ["trainingHours", "Training hours"], ["supportHours", "Support hours"],
];

const feeFields: Array<[keyof ClinicPricingInputs, string]> = [
  ["setupFee", "Setup fee"], ["additionalCustomisation", "Additional customisation"],
  ["ongoingMaintenance", "Optional ongoing maintenance"], ["managedHosting", "Optional managed hosting"],
];

function formatNumber(value: number) {
  return new Intl.NumberFormat(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
}

export function ClinicPricingPlanner() {
  const [values, setValues] = useState(defaultInputs);
  const result = useMemo(() => calculateClinicPricing(Object.fromEntries(
    (Object.keys(values) as Array<keyof ClinicPricingInputs>).map((key) => [key, normalisePlannerNumber(values[key])]),
  ) as ClinicPricingInputs), [values]);
  const update = (key: keyof ClinicPricingInputs, raw: string) => setValues((current) => ({ ...current, [key]: raw }));

  return (
    <div className="pricing-planner">
      <div className="pricing-planner-note"><strong>Planning estimate — not a market-price recommendation.</strong><span>Use one currency consistently. Values stay in this browser view and are not saved.</span></div>
      <div className="pricing-planner-grid">
        <fieldset><legend>Direct costs</legend>{costFields.map(([key, label]) => <label key={key}><span>{label}</span><input inputMode="decimal" min="0" onChange={(event) => update(key, event.target.value)} step="0.01" type="number" value={values[key]} /></label>)}</fieldset>
        <fieldset><legend>Time and internal cost</legend>{hourFields.map(([key, label]) => <label key={key}><span>{label}</span><input inputMode="decimal" min="0" onChange={(event) => update(key, event.target.value)} step="0.25" type="number" value={values[key]} /></label>)}<label><span>Hourly internal cost</span><input inputMode="decimal" min="0" onChange={(event) => update("hourlyCost", event.target.value)} step="0.01" type="number" value={values.hourlyCost} /></label></fieldset>
        <fieldset><legend>Modelled customer fees</legend>{feeFields.map(([key, label]) => <label key={key}><span>{label}</span><input inputMode="decimal" min="0" onChange={(event) => update(key, event.target.value)} step="0.01" type="number" value={values[key]} /></label>)}</fieldset>
      </div>
      <div className="pricing-results" aria-live="polite">
        <article><span>Estimated delivery cost</span><strong>{formatNumber(result.deliveryCost)}</strong><small>{formatNumber(result.hours)} hours + {formatNumber(result.directCosts)} direct costs</small></article>
        <article><span>Modelled fees</span><strong>{formatNumber(result.modelledFees)}</strong><small>From your setup and optional-service assumptions</small></article>
        <article className={result.grossMargin < 0 ? "negative" : ""}><span>Projected gross margin</span><strong>{formatNumber(result.grossMargin)}</strong><small>{formatNumber(result.grossMarginPercent)}% of modelled fees</small></article>
      </div>
    </div>
  );
}

export function ClinicQuestionnaireActions({ questions }: { questions: string[] }) {
  const [copyState, setCopyState] = useState<"idle" | "copied" | "error">("idle");
  const text = `CLINIC OPERATIONS DISCOVERY QUESTIONNAIRE\n\nDo not include sensitive patient information.\n\n${questions.map((question, index) => `${index + 1}. ${question}\nAnswer:`).join("\n\n")}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyState("copied");
      window.setTimeout(() => setCopyState("idle"), 2200);
    } catch {
      setCopyState("error");
    }
  };

  const download = () => {
    const url = URL.createObjectURL(new Blob([text], { type: "text/plain;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "clinic-operations-discovery-questionnaire.txt";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="questionnaire-actions">
      <button className={copyState === "copied" ? "secondary-button confirmed" : "secondary-button"} onClick={copy} type="button">{copyState === "copied" ? <Check aria-hidden="true" size={16} /> : <Clipboard aria-hidden="true" size={16} />}{copyState === "copied" ? "Copied" : copyState === "error" ? "Copy failed" : "Copy questionnaire"}</button>
      <button className="secondary-button" onClick={download} type="button"><Download aria-hidden="true" size={16} />Download .txt</button>
      <span aria-live="polite" className="sr-only">{copyState === "copied" ? "Questionnaire copied." : copyState === "error" ? "Copy failed. Use the download instead." : ""}</span>
    </div>
  );
}
