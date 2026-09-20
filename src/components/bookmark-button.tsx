"use client";

import { Bookmark } from "lucide-react";
import { useBookmarks } from "./bookmark-provider";

type BookmarkButtonProps = {
  ideaId: string;
  compact?: boolean;
  onToggle?: () => void;
};

export function BookmarkButton({ ideaId, compact = false, onToggle }: BookmarkButtonProps) {
  const { isSaved, toggle } = useBookmarks();
  const saved = isSaved(ideaId);

  return (
    <button
      type="button"
      className={compact ? "bookmark-button compact" : "bookmark-button"}
      onClick={() => onToggle ? onToggle() : toggle(ideaId)}
      aria-pressed={saved}
      aria-label={saved ? "Remove idea from saved" : "Save idea"}
    >
      <Bookmark aria-hidden="true" size={compact ? 18 : 19} fill={saved ? "currentColor" : "none"} />
      {!compact ? <span>{saved ? "Saved" : "Save idea"}</span> : null}
    </button>
  );
}
