import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import type { PublicIdea } from "@/content/public-idea";
import { PublicIdeaGallery } from "./public-idea-gallery";

const ideas: PublicIdea[] = [
  {
    id: "idea-001",
    displayNumber: "001",
    title: "Pergola Quotation & Follow-up CRM",
    summary: "A concise public summary.",
    solutionType: "Custom CRM",
    technicalRequirements: ["TypeScript", "Database configuration"],
    intendedCustomer: "Pergola installers",
    problemStatement: "Quotations lose momentum without clear follow-up.",
    resourceTypes: [{ label: "Setup guide", type: "guide" }],
    previewVariant: "pipeline",
  },
  {
    id: "idea-003",
    displayNumber: "003",
    title: "Quotation Follow-up Automation",
    summary: "Another public summary.",
    solutionType: "Automation",
    technicalRequirements: ["Workflow testing"],
    intendedCustomer: "Service businesses",
    problemStatement: "Manual review causes delayed follow-up.",
    resourceTypes: [{ label: "Workflow example", type: "workflow" }],
    previewVariant: "automation",
  },
];

describe("public idea quick preview", () => {
  afterEach(cleanup);

  it("opens the selected idea, closes with Escape, and restores focus", async () => {
    const user = userEvent.setup();
    render(<PublicIdeaGallery ideas={ideas} accountState="signed-out" />);
    const triggers = screen.getAllByRole("button", { name: "Quick preview" });

    await user.click(triggers[1]);
    const dialog = screen.getByRole("dialog", { name: "Quotation Follow-up Automation" });
    expect(dialog).toHaveTextContent("Service businesses");
    expect(dialog).not.toHaveTextContent("Pergola installers");
    expect(screen.getByRole("link", { name: "Try IncomeNow for US$1 — the starter includes the Pergola kit" })).toHaveAttribute("href", expect.stringContaining("/register?next="));
    expect(screen.getByRole("button", { name: "Close preview" })).toHaveFocus();

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    await waitFor(() => expect(triggers[1]).toHaveFocus());
  });

  it("closes from the visible close control", async () => {
    const user = userEvent.setup();
    render(<PublicIdeaGallery ideas={ideas} accountState="registered" />);
    await user.click(screen.getAllByRole("button", { name: "Quick preview" })[0]);
    await user.click(screen.getByRole("button", { name: "Close preview" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
