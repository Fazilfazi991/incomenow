import { ChevronDown } from "lucide-react";

export type FaqItem = { question: string; answer: string };

export function PublicFaq({ items }: { items: readonly FaqItem[] }) {
  return (
    <div className="public-faq-list">
      {items.map((item) => (
        <details key={item.question} className="public-faq-item">
          <summary>
            <span>{item.question}</span>
            <ChevronDown aria-hidden="true" size={20} />
          </summary>
          <p>{item.answer}</p>
        </details>
      ))}
    </div>
  );
}
