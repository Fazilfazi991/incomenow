"use client";

import { useId, useState } from "react";
import { ArrowRight, Check } from "lucide-react";

const stages = [
  { name: "Discover", title: "Find the business worth your attention.", body: "Compare the customer, problem, and technical requirements in each public opportunity. Choose a direction that fits your market and experience.", outputs: ["Business opportunity", "Customer context", "Technical requirements"] },
  { name: "Understand", title: "Know what you are actually building.", body: "Go deeper into the model, intended customer, and scope. Separate the useful starting point from the assumptions you still need to validate.", outputs: ["Market & offer", "Business model", "Scope and constraints"] },
  { name: "Set up", title: "Turn the kit into your starting system.", body: "Use the guides, templates, and tools published for your opportunity. Resource types vary by kit; the library shows what is available.", outputs: ["Templates & tools", "Setup guidance", "Resource availability"] },
  { name: "Sell", title: "Take a clear offer to a real customer.", body: "Use relevant sales guidance and templates to prepare outreach, define a bounded offer, and test whether the market needs your solution.", outputs: ["Sales approach", "Offer preparation", "Your own validation"] },
  { name: "Track", title: "Make the next step visible.", body: "Keep your implementation checklist and private notes in a personal project. Return to the work without losing the decisions you made.", outputs: ["Execution tasks", "Project progress", "Private notes"] },
  { name: "Grow", title: "Improve from what you learn.", body: "Revisit your offer, delivery, and customer feedback. Build on published kit improvements as they become available, with no promised release cadence.", outputs: ["Customer feedback", "Better delivery", "Published updates"] },
] as const;

export function ExecutionFlow() {
  const [selected, setSelected] = useState(0);
  const id = useId();
  const stage = stages[selected];
  return (
    <div className="vault-execution">
      <div className="vault-stage-tabs" role="tablist" aria-label="Explore the IncomeNow execution system">
        {stages.map((item, index) => <button key={item.name} type="button" role="tab" id={`${id}-tab-${index}`} aria-controls={`${id}-panel`} aria-selected={selected === index} tabIndex={selected === index ? 0 : -1} onClick={() => setSelected(index)} onKeyDown={(event) => {
          const next = event.key === "ArrowRight" ? (index + 1) % stages.length : event.key === "ArrowLeft" ? (index + stages.length - 1) % stages.length : event.key === "Home" ? 0 : event.key === "End" ? stages.length - 1 : null;
          if (next !== null) { event.preventDefault(); setSelected(next); document.getElementById(`${id}-tab-${next}`)?.focus(); }
        }}><span>{String(index + 1).padStart(2, "0")}</span>{item.name}<ArrowRight size={16} aria-hidden="true" /></button>)}
      </div>
      <div className="vault-stage-panel" id={`${id}-panel`} role="tabpanel" aria-labelledby={`${id}-tab-${selected}`} tabIndex={0}>
        <div className="vault-stage-detail" key={stage.name}><h3>{stage.title}</h3><p>{stage.body}</p></div>
        <ul>{stage.outputs.map((output) => <li key={output}><Check size={16} aria-hidden="true" />{output}</li>)}</ul>
      </div>
    </div>
  );
}
