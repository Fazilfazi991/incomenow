import { ArrowRight, Check, Info } from "lucide-react";
import type { Idea } from "@/content/idea-schema";

export function SafeIdeaPreview({ preview }: { preview: NonNullable<Idea["safePreview"]> }) {
  return <div className="safe-preview">
    <section className="safe-preview-intro"><span>Product preview</span><h2>{preview.headline}</h2><p>{preview.supportingCopy}</p></section>
    <section className="safe-preview-problem"><div><span>Problem to investigate</span><ul>{preview.problemBullets.map((item) => <li key={item}><Check aria-hidden="true" size={15} />{item}</li>)}</ul></div><blockquote>{preview.question}</blockquote></section>
    <div className="safe-preview-flows"><section><span>Product flow</span><ol>{preview.productFlow.map((step, index) => <li key={step}><b>{String(index + 1).padStart(2, "0")}</b><p>{step}</p>{index < preview.productFlow.length - 1 ? <ArrowRight aria-hidden="true" size={14} /> : null}</li>)}</ol></section><section><span>Possible business flow</span><ol>{preview.businessFlow.map((step, index) => <li key={step}><b>{String(index + 1).padStart(2, "0")}</b><p>{step}</p>{index < preview.businessFlow.length - 1 ? <ArrowRight aria-hidden="true" size={14} /> : null}</li>)}</ol></section></div>
    <section className="safe-preview-differentiators"><span>What makes the concept distinct</span><div>{preview.differentiators.map((item) => <article key={item.title}><h3>{item.title}</h3><p>{item.detail}</p></article>)}</div></section>
    <section className="safe-preview-teasers"><div><span>Member-kit preview</span><h2>What the protected kit covers</h2></div><ul>{preview.resourceTeasers.map((item) => <li key={item}><Check aria-hidden="true" size={14} />{item}</li>)}</ul></section>
    <p className="safe-preview-notice"><Info aria-hidden="true" size={16} />{preview.notice}</p>
  </div>;
}
