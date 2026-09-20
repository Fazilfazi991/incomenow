export const PREVIEW_STORAGE_KEY = "incomenow.preview.v1";
export const DEFAULT_SAVED_IDS = ["idea-001", "idea-003", "idea-004"];
export const KNOWN_PREVIEW_IDEA_IDS = ["idea-001", "idea-002", "idea-003", "idea-004", "idea-005", "idea-034"] as const;

export type PreviewState = {
  version: 1;
  savedIdeaIds: string[];
};

export type StorageLike = Pick<Storage, "getItem" | "setItem">;

// Keep the device-local preview store on an explicit public identifier allowlist.
// Importing the detailed idea records here would place protected plans and resource
// identifiers in every browser chunk that mounts the preview bookmark provider.
const knownIdeaIds = new Set<string>(KNOWN_PREVIEW_IDEA_IDS);

export function sanitiseSavedIds(ids: unknown): string[] {
  if (!Array.isArray(ids)) return [...DEFAULT_SAVED_IDS];
  return [...new Set(ids.filter((id): id is string => typeof id === "string" && knownIdeaIds.has(id)))];
}

export function readPreviewState(storage?: StorageLike | null): PreviewState {
  if (!storage) return { version: 1, savedIdeaIds: [...DEFAULT_SAVED_IDS] };

  try {
    const raw = storage.getItem(PREVIEW_STORAGE_KEY);
    if (!raw) return { version: 1, savedIdeaIds: [...DEFAULT_SAVED_IDS] };
    const parsed = JSON.parse(raw) as { version?: unknown; savedIdeaIds?: unknown };
    if (parsed.version !== 1) return { version: 1, savedIdeaIds: [...DEFAULT_SAVED_IDS] };
    return { version: 1, savedIdeaIds: sanitiseSavedIds(parsed.savedIdeaIds) };
  } catch {
    return { version: 1, savedIdeaIds: [...DEFAULT_SAVED_IDS] };
  }
}

export function writePreviewState(storage: StorageLike | null | undefined, savedIdeaIds: string[]) {
  if (!storage) return false;
  try {
    const state: PreviewState = { version: 1, savedIdeaIds: sanitiseSavedIds(savedIdeaIds) };
    storage.setItem(PREVIEW_STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

export function addSavedId(savedIdeaIds: string[], ideaId: string) {
  return sanitiseSavedIds([...savedIdeaIds, ideaId]);
}

export function removeSavedId(savedIdeaIds: string[], ideaId: string) {
  return savedIdeaIds.filter((id) => id !== ideaId);
}
