"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import type { FaqItem } from "./public-faq";

export function PublicFaqSelector({ items }: { items: readonly FaqItem[] }) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  return (
    <div className="public-faq-selector">
      <div className="public-faq-questions" aria-label="Frequently asked questions">
        {items.map((item, index) => (
          <button
            aria-controls={`public-faq-answer-${index}`}
            aria-expanded={selectedIndex === index}
            className={selectedIndex === index ? "is-active" : ""}
            id={`public-faq-question-${index}`}
            key={item.question}
            onClick={() => setSelectedIndex(index)}
            type="button"
          >
            <span>{item.question}</span>
            <ArrowRight aria-hidden="true" size={18} />
          </button>
        ))}
      </div>
      <div className="public-faq-answer-stage">
        {items.map((item, index) => (
          <div
            aria-labelledby={`public-faq-question-${index}`}
            className="public-faq-answer"
            hidden={selectedIndex !== index}
            id={`public-faq-answer-${index}`}
            key={item.question}
            role="region"
          >
            <span>QUESTION {String(index + 1).padStart(2, "0")}</span>
            <h3>{item.question}</h3>
            <p>{item.answer}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
