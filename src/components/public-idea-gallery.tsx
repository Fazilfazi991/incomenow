"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowRight, Check, X } from "lucide-react";
import Link from "next/link";
import type { PublicIdea } from "@/content/public-idea";
import { IdeaPreview } from "./idea-preview";

export function PublicIdeaGallery({ ideas }: { ideas: readonly PublicIdea[] }) {
  const [selected, setSelected] = useState<PublicIdea | null>(null);
  const lastTrigger = useRef<HTMLButtonElement | null>(null);
  const dialog = useRef<HTMLDivElement | null>(null);
  const closeButton = useRef<HTMLButtonElement | null>(null);

  const closePreview = useCallback(() => {
    setSelected(null);
    window.requestAnimationFrame(() => lastTrigger.current?.focus());
  }, []);

  useEffect(() => {
    if (!selected) return;
    closeButton.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closePreview();
      if (event.key !== "Tab" || !dialog.current) return;
      const focusable = Array.from(dialog.current.querySelectorAll<HTMLElement>('button, a[href], [tabindex]:not([tabindex="-1"])'));
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [closePreview, selected]);

  return (
    <>
      <div className="public-idea-grid">
        {ideas.map((idea) => (
          <article className="public-idea-card" key={idea.id}>
            <div className="public-idea-art"><IdeaPreview variant={idea.previewVariant} /></div>
            <div className="public-idea-copy">
              <div className="public-card-meta"><span>{idea.solutionType}</span><small>Idea {idea.displayNumber}</small></div>
              <h3>{idea.title}</h3>
              <p>{idea.summary}</p>
              <button
                className="public-card-action"
                type="button"
                onClick={(event) => {
                  lastTrigger.current = event.currentTarget;
                  setSelected(idea);
                }}
                aria-haspopup="dialog"
              >
                Quick preview <ArrowRight aria-hidden="true" size={16} />
              </button>
            </div>
          </article>
        ))}
      </div>

      {selected && (
        <div className="public-dialog-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && closePreview()}>
          <div ref={dialog} className="public-preview-dialog" role="dialog" aria-modal="true" aria-labelledby="public-preview-title">
            <button ref={closeButton} className="public-dialog-close" type="button" onClick={closePreview} aria-label="Close preview"><X size={20} /></button>
            <div className="public-dialog-art"><IdeaPreview variant={selected.previewVariant} /></div>
            <div className="public-dialog-copy">
              <div className="public-card-meta"><span>{selected.solutionType}</span><small>Idea {selected.displayNumber}</small></div>
              <h2 id="public-preview-title">{selected.title}</h2>
              <p>{selected.summary}</p>
              <dl>
                <div><dt>Problem this explores</dt><dd>{selected.problemStatement}</dd></div>
                <div><dt>Intended customer</dt><dd>{selected.intendedCustomer}</dd></div>
                <div><dt>Technical requirements</dt><dd>{selected.technicalRequirements.join(" · ")}</dd></div>
              </dl>
              <div className="public-preview-resources">
                <strong>Sample resource types</strong>
                <ul>{selected.resourceTypes.map((resource) => <li key={`${resource.type}-${resource.label}`}><Check size={14} /> {resource.label}</li>)}</ul>
              </div>
              <p className="public-dialog-note">This is a public summary only. Implementation plans and member resources stay inside the protected library.</p>
              <Link className="public-button public-button-primary public-dialog-membership" href="/membership">View membership information <ArrowRight size={15} /></Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
