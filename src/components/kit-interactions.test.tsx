import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SalesTemplateWorkbench, type SalesTemplate } from "./kit-interactions";

const templates: SalesTemplate[] = [
  { title: "Research email", detail: "Ask for context.", kind: "email", subject: "Hello [Company]", template: "Hi [Name]" },
  { title: "Discovery call", detail: "Use a real workflow.", kind: "call", template: "Opening notes" },
  { title: "Follow-up", detail: "Confirm the next step.", kind: "follow-up", subject: "Next step", template: "Thanks [Name]" },
];

describe("SalesTemplateWorkbench", () => {
  afterEach(cleanup);

  it("keeps template edits local and copies the edited message without claiming it was sent", async () => {
    const user = userEvent.setup();
    const writeText = vi.spyOn(navigator.clipboard, "writeText");
    render(<SalesTemplateWorkbench templates={templates} />);

    const editor = screen.getByLabelText("Editable template");
    fireEvent.change(editor, { target: { value: "Edited for [Company]" } });
    await user.click(screen.getByRole("button", { name: "Copy template" }));

    expect(writeText).toHaveBeenCalledWith("Subject: Hello [Company]\n\nEdited for [Company]");
    expect(screen.getByRole("button", { name: "Copied to clipboard" })).toBeInTheDocument();
    expect(screen.getByText(/Copying does not send a message/i)).toBeInTheDocument();
  });

  it("switches among email, call, and follow-up templates", async () => {
    const user = userEvent.setup();
    render(<SalesTemplateWorkbench templates={templates} />);
    await user.click(screen.getByRole("tab", { name: "Discovery call" }));
    expect(screen.getByLabelText("Editable template")).toHaveValue("Opening notes");
    expect(screen.queryByLabelText("Subject")).not.toBeInTheDocument();
  });
});
