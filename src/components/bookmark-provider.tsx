"use client";

import { createContext, useCallback, useContext, useMemo, useState, useSyncExternalStore } from "react";
import {
  DEFAULT_SAVED_IDS,
  PREVIEW_STORAGE_KEY,
  addSavedId,
  readPreviewState,
  removeSavedId,
  writePreviewState,
} from "@/lib/preview-storage";

type BookmarkContextValue = {
  savedIds: string[];
  storageAvailable: boolean;
  isSaved: (ideaId: string) => boolean;
  save: (ideaId: string) => void;
  remove: (ideaId: string) => void;
  toggle: (ideaId: string) => void;
};

const BookmarkContext = createContext<BookmarkContextValue | null>(null);
const BOOKMARK_EVENT = "incomenow:bookmarks";
const DEFAULT_SNAPSHOT = "__default__";
const UNAVAILABLE_SNAPSHOT = "__unavailable__";

function subscribe(callback: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key === PREVIEW_STORAGE_KEY) callback();
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(BOOKMARK_EVENT, callback);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(BOOKMARK_EVENT, callback);
  };
}

function getClientSnapshot() {
  try {
    return window.localStorage.getItem(PREVIEW_STORAGE_KEY) ?? DEFAULT_SNAPSHOT;
  } catch {
    return UNAVAILABLE_SNAPSHOT;
  }
}

function getServerSnapshot() {
  return DEFAULT_SNAPSHOT;
}

export function BookmarkProvider({ children }: { children: React.ReactNode }) {
  const [memoryIds, setMemoryIds] = useState<string[]>(DEFAULT_SAVED_IDS);
  const snapshot = useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);
  const savedIds = useMemo(() => {
    if (snapshot === UNAVAILABLE_SNAPSHOT) return memoryIds;
    if (snapshot === DEFAULT_SNAPSHOT) return [...DEFAULT_SAVED_IDS];
    return readPreviewState({ getItem: () => snapshot, setItem: () => undefined }).savedIdeaIds;
  }, [memoryIds, snapshot]);
  const storageAvailable = snapshot !== UNAVAILABLE_SNAPSHOT;

  const update = useCallback((next: string[]) => {
    try {
      if (!writePreviewState(window.localStorage, next)) setMemoryIds(next);
    } catch {
      setMemoryIds(next);
    }
    window.dispatchEvent(new Event(BOOKMARK_EVENT));
  }, []);

  const save = useCallback((ideaId: string) => update(addSavedId(savedIds, ideaId)), [savedIds, update]);
  const remove = useCallback((ideaId: string) => update(removeSavedId(savedIds, ideaId)), [savedIds, update]);
  const toggle = useCallback(
    (ideaId: string) => (savedIds.includes(ideaId) ? remove(ideaId) : save(ideaId)),
    [remove, save, savedIds],
  );

  const value = useMemo<BookmarkContextValue>(
    () => ({
      savedIds,
      storageAvailable,
      isSaved: (ideaId) => savedIds.includes(ideaId),
      save,
      remove,
      toggle,
    }),
    [remove, save, savedIds, storageAvailable, toggle],
  );

  return <BookmarkContext.Provider value={value}>{children}</BookmarkContext.Provider>;
}

export function useBookmarks() {
  const context = useContext(BookmarkContext);
  if (!context) throw new Error("useBookmarks must be used inside BookmarkProvider");
  return context;
}
