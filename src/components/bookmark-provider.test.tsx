import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { PREVIEW_STORAGE_KEY } from "@/lib/preview-storage";
import { BookmarkProvider, useBookmarks } from "./bookmark-provider";

function Probe({ name }: { name: string }) {
  const { isSaved, toggle } = useBookmarks();
  return (
    <div>
      <output aria-label={`${name} state`}>{isSaved("idea-001") ? "saved" : "not saved"}</output>
      {name === "first" ? <button type="button" onClick={() => toggle("idea-001")}>Toggle</button> : null}
    </div>
  );
}

describe("bookmark synchronisation", () => {
  beforeEach(() => window.localStorage.removeItem(PREVIEW_STORAGE_KEY));

  it("keeps multiple consumers and persisted state in sync", async () => {
    const user = userEvent.setup();
    render(<BookmarkProvider><Probe name="first" /><Probe name="second" /></BookmarkProvider>);

    expect(screen.getByLabelText("first state")).toHaveTextContent("saved");
    expect(screen.getByLabelText("second state")).toHaveTextContent("saved");

    await user.click(screen.getByRole("button", { name: "Toggle" }));

    expect(screen.getByLabelText("first state")).toHaveTextContent("not saved");
    expect(screen.getByLabelText("second state")).toHaveTextContent("not saved");
    expect(window.localStorage.getItem(PREVIEW_STORAGE_KEY)).toContain("idea-003");
    expect(window.localStorage.getItem(PREVIEW_STORAGE_KEY)).not.toContain("idea-001");
  });
});

