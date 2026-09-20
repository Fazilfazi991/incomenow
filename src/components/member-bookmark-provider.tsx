"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { setBookmarkAction } from "@/app/app/actions";

type MemberBookmarkContextValue = {
  savedIds: string[];
  count: number;
  isSaved: (ideaId: string) => boolean;
  isPending: (ideaId: string) => boolean;
  setSaved: (ideaId: string, saved: boolean) => Promise<boolean>;
  feedback: string | null;
  clearFeedback: () => void;
};

const MemberBookmarkContext = createContext<MemberBookmarkContextValue | null>(null);

export function MemberBookmarkProvider({ userId, initialSavedIds, children }: { userId: string; initialSavedIds: string[]; children: React.ReactNode }) {
  return <MemberBookmarkState key={userId} initialSavedIds={initialSavedIds}>{children}</MemberBookmarkState>;
}

function MemberBookmarkState({ initialSavedIds, children }: { initialSavedIds: string[]; children: React.ReactNode }) {
  const router = useRouter();
  const [savedIds, setSavedIds] = useState(initialSavedIds);
  const [pendingIds, setPendingIds] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<string | null>(null);
  const operation = useRef(new Map<string, number>());

  const setSaved = useCallback(async (ideaId: string, saved: boolean) => {
    const sequence = (operation.current.get(ideaId) ?? 0) + 1;
    operation.current.set(ideaId, sequence);
    setFeedback(null);
    setPendingIds((current) => current.includes(ideaId) ? current : [...current, ideaId]);
    setSavedIds((current) => saved ? (current.includes(ideaId) ? current : [ideaId, ...current]) : current.filter((id) => id !== ideaId));

    const result = await setBookmarkAction(ideaId, saved);
    if (operation.current.get(ideaId) !== sequence) return result.ok;
    setPendingIds((current) => current.filter((id) => id !== ideaId));
    if (!result.ok) {
      setSavedIds((current) => saved ? current.filter((id) => id !== ideaId) : (current.includes(ideaId) ? current : [ideaId, ...current]));
      setFeedback(result.error);
      return false;
    }
    router.refresh();
    return true;
  }, [router]);

  const value = useMemo<MemberBookmarkContextValue>(() => ({
    savedIds,
    count: savedIds.length,
    isSaved: (ideaId) => savedIds.includes(ideaId),
    isPending: (ideaId) => pendingIds.includes(ideaId),
    setSaved,
    feedback,
    clearFeedback: () => setFeedback(null),
  }), [feedback, pendingIds, savedIds, setSaved]);

  return (
    <MemberBookmarkContext.Provider value={value}>
      {children}
      <p className="sr-only" aria-live="polite">{feedback}</p>
    </MemberBookmarkContext.Provider>
  );
}

export function useMemberBookmarks() {
  const value = useContext(MemberBookmarkContext);
  if (!value) throw new Error("useMemberBookmarks must be used inside MemberBookmarkProvider");
  return value;
}

export function useOptionalMemberBookmarks() {
  return useContext(MemberBookmarkContext);
}
