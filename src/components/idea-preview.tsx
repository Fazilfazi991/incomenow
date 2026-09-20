import type { Idea } from "@/content/idea-schema";
import { ArrowRight, Check, Clock3, MapPin, Send, Wrench } from "lucide-react";

export function IdeaPreview({ variant }: { variant: Idea["previewVariant"] }) {
  if (variant === "pipeline") {
    return (
      <div className="idea-preview pipeline-preview" role="img" aria-label="Illustrative pipeline preview">
        <div className="preview-heading"><span><i /> Pipeline workflow</span><small>v1.2</small></div>
        <div className="pipeline-columns">
          <div><span>New enquiries</span><b /><b className="short" /></div>
          <div><span>Site visits</span><b /><b className="short" /></div>
          <div><span>Won</span><b className="accent" /></div>
        </div>
      </div>
    );
  }

  if (variant === "automation") {
    return (
      <div className="idea-preview automation-preview" role="img" aria-label="Illustrative automation workflow">
        <div className="preview-heading"><span><i /> Flow architecture</span><small>3 steps</small></div>
        <div className="flow-row">
          <div><Send size={14} /><span>Quote sent</span></div><ArrowRight aria-hidden="true" size={13} />
          <div><Clock3 size={14} /><span>Day +3</span></div><ArrowRight aria-hidden="true" size={13} />
          <div><Check size={14} /><span>Task</span></div>
        </div>
      </div>
    );
  }

  if (variant === "website") {
    return (
      <div className="idea-preview website-preview" role="img" aria-label="Illustrative lead website wireframe">
        <div className="preview-heading"><span><i /> SEO funnel wireframe</span><small>local</small></div>
        <div className="wireframe-window">
          <div className="wireframe-top"><b /><i /><i /></div>
          <div className="wireframe-body"><MapPin size={15} /><span><b /><b className="short" /></span><em>CTA</em></div>
        </div>
      </div>
    );
  }

  if (variant === "dispatch") {
    return (
      <div className="idea-preview dispatch-preview" role="img" aria-label="Illustrative technician dispatch preview">
        <div className="preview-heading"><span><i /> Dispatch board</span><small>sample</small></div>
        <div className="dispatch-row"><Wrench size={14} /><span><b /><b className="short" /></span><Check size={14} /></div>
        <div className="dispatch-row"><Wrench size={14} /><span><b /><b className="short" /></span><Clock3 size={14} /></div>
      </div>
    );
  }

  if (variant === "scorecard") {
    return (
      <div className="idea-preview scorecard-preview" role="img" aria-label="Illustrative research scorecard">
        <div className="preview-heading"><span><i /> Diligence matrix</span><small>sample</small></div>
        {["Compliance", "Pricing", "Lead time"].map((label) => <div className="score-row" key={label}><span>{label}</span><Check size={14} /></div>)}
      </div>
    );
  }

  return (
    <div className="idea-preview property-preview" role="img" aria-label="Illustrative property dashboard">
      <div className="preview-heading"><span><i /> Unit ledger</span><small>sample</small></div>
      <div className="property-metrics"><div><span>Units</span><strong>42</strong><b /></div><div><span>Repairs</span><strong>2</strong><b className="short" /></div></div>
    </div>
  );
}
