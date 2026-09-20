import { describe, expect, it, vi } from "vitest";
import { ideas } from "@/content/ideas";
import {
  DEFAULT_SAVED_IDS,
  KNOWN_PREVIEW_IDEA_IDS,
  PREVIEW_STORAGE_KEY,
  addSavedId,
  readPreviewState,
  removeSavedId,
  writePreviewState,
} from "./preview-storage";

describe("preview bookmark persistence", () => {
  it("keeps the browser-safe identifier allowlist aligned with the catalogue", () => {
    expect([...KNOWN_PREVIEW_IDEA_IDS].sort()).toEqual(ideas.map((idea) => idea.id).sort());
  });

  it("falls back safely for malformed values", () => {
    const storage = { getItem: vi.fn(() => "{bad"), setItem: vi.fn() };
    expect(readPreviewState(storage).savedIdeaIds).toEqual(DEFAULT_SAVED_IDS);
  });

  it("drops unknown idea ids", () => {
    const storage = {
      getItem: vi.fn(() => JSON.stringify({ version: 1, savedIdeaIds: ["idea-001", "idea-999"] })),
      setItem: vi.fn(),
    };
    expect(readPreviewState(storage).savedIdeaIds).toEqual(["idea-001"]);
  });

  it("handles unavailable storage", () => {
    const storage = {
      getItem: vi.fn(() => {
        throw new Error("blocked");
      }),
      setItem: vi.fn(() => {
        throw new Error("blocked");
      }),
    };
    expect(readPreviewState(storage).savedIdeaIds).toEqual(DEFAULT_SAVED_IDS);
    expect(writePreviewState(storage, ["idea-001"])).toBe(false);
  });

  it("removes and restores a saved idea", () => {
    const removed = removeSavedId(DEFAULT_SAVED_IDS, "idea-003");
    expect(removed).toEqual(["idea-001", "idea-004"]);
    expect(addSavedId(removed, "idea-003")).toEqual(expect.arrayContaining(DEFAULT_SAVED_IDS));
  });

  it("writes only versioned, known preview state", () => {
    const storage = { getItem: vi.fn(), setItem: vi.fn() };
    expect(writePreviewState(storage, ["idea-001", "idea-999"])).toBe(true);
    expect(storage.setItem).toHaveBeenCalledWith(
      PREVIEW_STORAGE_KEY,
      JSON.stringify({ version: 1, savedIdeaIds: ["idea-001"] }),
    );
  });
});
