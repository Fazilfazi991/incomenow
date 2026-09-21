"use client";

import { useRef, useState } from "react";
import { ArrowRight, Check, FileText, Layers3, Search, Send } from "lucide-react";

const stages = [
  { title: "Discover", body: "Compare focused opportunities by customer, problem, and likely delivery model.", icon: Search },
  { title: "Explore the kit", body: "Understand the workflow, included guidance, and the current state of each resource.", icon: Layers3 },
  { title: "Adapt your version", body: "Use the structure as a starting point, then shape the scope around what you learn.", icon: FileText },
  { title: "Prepare your offer", body: "Turn the evidence into a bounded first conversation, with claims and limits kept clear.", icon: Send },
] as const;

export function PublicHowItWorks() {
  const [active, setActive] = useState(0);
  const tabs = useRef<Array<HTMLButtonElement | null>>([]);

  const select = (index: number) => {
    setActive(index);
    tabs.current[index]?.focus();
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    let next = index;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") next = (index + 1) % stages.length;
    else if (event.key === "ArrowLeft" || event.key === "ArrowUp") next = (index - 1 + stages.length) % stages.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = stages.length - 1;
    else return;
    event.preventDefault();
    select(next);
  };

  const stage = stages[active];
  const StageIcon = stage.icon;

  return (
    <div className="digital-process">
      <div className="digital-process-tabs" role="tablist" aria-label="How IncomeNow works">
        {stages.map((item, index) => (
          <button
            aria-controls="digital-process-panel"
            aria-selected={active === index}
            className={active === index ? "is-active" : ""}
            key={item.title}
            onClick={() => select(index)}
            onKeyDown={(event) => onKeyDown(event, index)}
            ref={(node) => { tabs.current[index] = node; }}
            role="tab"
            tabIndex={active === index ? 0 : -1}
            type="button"
          >
            <span>0{index + 1}</span><strong>{item.title}</strong>{active === index && <Check aria-hidden="true" size={16} />}
          </button>
        ))}
      </div>
      <div className="digital-process-panel" id="digital-process-panel" role="tabpanel" tabIndex={0}>
        <div className="digital-process-copy" key={stage.title}>
          <span><StageIcon aria-hidden="true" size={20} /></span>
          <small>STAGE 0{active + 1}</small>
          <h3>{stage.title}</h3>
          <p>{stage.body}</p>
          <strong>This is guidance, not automatic project progress.</strong>
        </div>
        <div className="digital-process-map" aria-hidden="true">
          {stages.map((item, index) => (
            <div className={index === active ? "is-active" : index < active ? "is-complete" : ""} key={item.title}>
              <span>{index < active ? <Check size={15} /> : `0${index + 1}`}</span>
              <i />
            </div>
          ))}
          <div className="digital-process-card"><small>{stage.title}</small><strong>{active === 0 ? "Three public examples" : active === 1 ? "Guidance + resources" : active === 2 ? "Your scoped version" : "A clear first approach"}</strong><span>Review, adapt, continue <ArrowRight size={14} /></span></div>
        </div>
      </div>
    </div>
  );
}
