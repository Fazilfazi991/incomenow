"use client";

import { Bookmark, LoaderCircle } from "lucide-react";
import { useMemberBookmarks } from "./member-bookmark-provider";

export function MemberBookmarkButton({ ideaId, compact = false, onRemoved }: { ideaId: string; compact?: boolean; onRemoved?: () => void }) {
  const { isSaved, isPending, setSaved } = useMemberBookmarks();
  const saved = isSaved(ideaId);
  const pending = isPending(ideaId);

  return (
    <button
      type="button"
      className={compact ? "bookmark-button compact" : "bookmark-button"}
      onClick={async () => {
        const succeeded = await setSaved(ideaId, !saved);
        if (succeeded && saved) onRemoved?.();
      }}
      disabled={pending}
      aria-pressed={saved}
      aria-label={pending ? "Updating saved idea" : saved ? "Remove idea from saved" : "Save idea"}
    >
      {pending ? <LoaderCircle className="control-spinner" aria-hidden="true" size={compact ? 18 : 19} /> : <Bookmark aria-hidden="true" size={compact ? 18 : 19} fill={saved ? "currentColor" : "none"} />}
      {!compact ? <span>{pending ? "Saving…" : saved ? "Saved" : "Save idea"}</span> : null}
    </button>
  );
}
