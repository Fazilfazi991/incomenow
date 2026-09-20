"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { ArrowRight, LoaderCircle, Rocket, X } from "lucide-react";
import { startProjectAction } from "@/app/app/actions";

export function StartIdeaControl({ ideaId, existingProjectId, mode = "preview" }: { ideaId?: string; existingProjectId?: string | null; mode?: "preview" | "member" }) {
  const [visible, setVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (mode === "member" && existingProjectId) {
    return <Link className="secondary-button" href={`/app/projects/${existingProjectId}`}>My checklist <ArrowRight size={17} /></Link>;
  }

  return (
    <div className="start-control">
      <button
        type="button"
        className={mode === "member" ? "secondary-button" : "primary-button"}
        disabled={pending}
        onClick={() => {
          if (mode === "preview") return setVisible(true);
          if (!ideaId) return setError("This project plan is unavailable.");
          setError(null);
          startTransition(async () => {
            const result = await startProjectAction(ideaId);
            if (!result.ok) setError(result.error);
          });
        }}
      >
        {pending ? <LoaderCircle className="control-spinner" size={17} /> : <Rocket size={17} />} {pending ? "Starting…" : mode === "member" ? "Start my checklist" : "Start this idea"}
      </button>
      {visible && mode === "preview" ? (
        <div className="inline-unavailable" role="status">
          <span><strong>Preview only.</strong> Sign in with active membership to create a private project. Nothing has been created here.</span>
          <button type="button" aria-label="Dismiss message" onClick={() => setVisible(false)}><X size={16} /></button>
        </div>
      ) : null}
      {error ? <p className="control-error" role="alert">{error}</p> : null}
    </div>
  );
}
