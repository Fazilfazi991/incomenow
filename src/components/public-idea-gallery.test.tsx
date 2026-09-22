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
    resourceTypes: [{ label: "Setup guide", type: "guide", availability: "available" }],
    previewVariant: "pipeline",
    coverArt: { src: "/artwork/ideas/pergola-business-kit.webp", alt: "Pergola plans and materials", position: "50% 50%" },
  },
  {
    id: "idea-003",
    displayNumber: "003",
    title: "AI Accounting & Finance Operations Kit",
    summary: "Another public summary.",
    solutionType: "Web tool",
    technicalRequirements: ["Finance-workflow testing"],
    intendedCustomer: "Small service businesses",
    problemStatement: "Finance records and approvals are difficult to review across disconnected tools.",
    resourceTypes: [{ label: "Accounting setup guide", type: "guide", availability: "available" }],
    previewVariant: "scorecard",
    coverArt: { src: "/artwork/ideas/quotation-follow-up-automation.webp", alt: "Finance operations workflow", position: "50% 50%" },
  },
];

describe("public idea quick preview", () => {
  afterEach(cleanup);

  it("opens the selected idea, closes with Escape, and restores focus", async () => {
    const user = userEvent.setup();
    render(<PublicIdeaGallery ideas={ideas} accountState="signed-out" />);
    const triggers = screen.getAllByRole("button", { name: "Quick preview" });

    await user.click(triggers[1]);
    const dialog = screen.getByRole("dialog", { name: "AI Accounting & Finance Operations Kit" });
    expect(dialog).toHaveTextContent("Small service businesses");
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
