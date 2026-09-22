"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowRight, Check, Clock3, X } from "lucide-react";
import Link from "next/link";
import type { PublicIdea } from "@/content/public-idea";
import { STARTER_IDEA_ID } from "@/content/membership-offer";
import type { PublicAccountState } from "@/lib/public-account";
import { ArtworkImage } from "./artwork-image";
import { SafeIdeaPreview } from "./safe-idea-preview";

export function PublicIdeaGallery({ ideas, accountState }: { ideas: readonly PublicIdea[]; accountState: PublicAccountState }) {
  const [selected, setSelected] = useState<PublicIdea | null>(null);
  const lastTrigger = useRef<HTMLButtonElement | null>(null);
  const dialog = useRef<HTMLDivElement | null>(null);
  const closeButton = useRef<HTMLButtonElement | null>(null);

  const closePreview = useCallback(() => {
    setSelected(null);
    window.requestAnimationFrame(() => lastTrigger.current?.focus());
  }, []);

  const offerDestination = accountState === "signed-out"
    ? `/register?next=${encodeURIComponent("/membership?offer=starter")}`
    : accountState === "starter"
      ? "/app/ideas/pergola-quotation-follow-up-crm"
      : accountState === "full"
        ? "/app/explore"
        : accountState === "unavailable"
          ? "/membership"
          : "/membership?offer=starter#starter-offer";

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
            <ArtworkImage
              alt={idea.coverArt.alt}
              className="public-idea-art"
              position={idea.coverArt.position}
              sizes="(max-width: 767px) calc(100vw - 48px), (max-width: 980px) 46vw, 31vw"
              src={idea.coverArt.src}
            />
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
            <ArtworkImage
              alt={selected.coverArt.alt}
              className="public-dialog-art"
              position={selected.coverArt.position}
              sizes="(max-width: 767px) 100vw, (max-width: 1208px) 46vw, 534px"
              src={selected.coverArt.src}
            />
            <div className="public-dialog-copy">
              <div className="public-card-meta"><span>{selected.solutionType}</span><small>Idea {selected.displayNumber}</small></div>
              <h2 id="public-preview-title">{selected.title}</h2>
              <p>{selected.summary}</p>
              <dl>
                <div><dt>Problem this explores</dt><dd>{selected.problemStatement}</dd></div>
                <div><dt>Intended customer</dt><dd>{selected.intendedCustomer}</dd></div>
                <div><dt>Technical requirements</dt><dd>{selected.technicalRequirements.join(" · ")}</dd></div>
              </dl>
              {selected.safePreview ? <SafeIdeaPreview preview={selected.safePreview} /> : null}
              <div className="public-preview-resources">
                <strong>Resource status</strong>
                <ul>{selected.resourceTypes.map((resource) => <li className={resource.availability} key={`${resource.type}-${resource.label}`}>{resource.availability === "not-connected" ? <Clock3 size={14} /> : <Check size={14} />} <span>{resource.label}</span><em>{resource.availability === "available" ? "Available" : resource.availability === "sample" ? "Sample" : "Not connected"}</em></li>)}</ul>
              </div>
              <p className="public-dialog-note">This is a public summary only. Implementation plans and member resources stay inside the protected library.</p>
              <Link className="public-button public-button-primary public-dialog-membership" href={offerDestination}>
                {accountState === "full"
                  ? "Open idea library"
                  : accountState === "starter"
                    ? "Open your starter idea"
                    : accountState === "unavailable"
                      ? "See what membership includes"
                      : selected.id === STARTER_IDEA_ID
                        ? "Start with the Pergola kit for US$1"
                        : "Try IncomeNow for US$1 — the starter includes the Pergola kit"}
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
