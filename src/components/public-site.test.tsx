import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import { PublicAccountActions, StarterOfferCopy } from "./public-site";

describe("public account actions", () => {
  afterEach(cleanup);

  it("offers registration and login only to signed-out visitors", () => {
    render(<PublicAccountActions state="signed-out" />);
    expect(screen.getByRole("link", { name: "Create account" })).toHaveAttribute("href", "/register");
    expect(screen.getByRole("link", { name: "Log in" })).toHaveAttribute("href", "/login");
  });

  it("sends full members to the protected library", () => {
    render(<PublicAccountActions state="full" />);
    expect(screen.getByRole("link", { name: "Open idea library" })).toHaveAttribute("href", "/app/explore");
    expect(screen.queryByRole("link", { name: "Create account" })).not.toBeInTheDocument();
  });

  it("keeps registered, starter, and unavailable states distinct", () => {
    const { rerender } = render(<PublicAccountActions state="registered" />);
    expect(screen.getByRole("link", { name: "Browse idea library" })).toHaveAttribute("href", "/app/explore");

    rerender(<PublicAccountActions state="starter" />);
    expect(screen.getByText(/Starter access includes/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Open starter idea" })).toHaveAttribute("href", "/app/ideas/pergola-quotation-follow-up-crm");

    rerender(<PublicAccountActions state="unavailable" />);
    expect(screen.getByText("Account status is temporarily unavailable")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Check account access" })).toHaveAttribute("href", "/account/access");
    expect(screen.queryByText(/payment failed/i)).not.toBeInTheDocument();
  });

  it("links every public navigation item and opens the mobile menu", async () => {
    const user = userEvent.setup();
    const { PublicShell } = await import("./public-site");
    render(<PublicShell state="signed-out" page="home"><p>Public content</p></PublicShell>);

    expect(screen.getByRole("navigation", { name: "Main navigation" })).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: "Membership" })[0]).toHaveAttribute("href", "/membership");
    const menu = screen.getByRole("group");
    expect(menu).not.toHaveAttribute("open");
    await user.click(screen.getByLabelText("Open navigation"));
    expect(menu).toHaveAttribute("open");
    expect(screen.getByLabelText("Close navigation")).toBeInTheDocument();
    await user.click(within(screen.getByRole("navigation", { name: "Mobile navigation" })).getByRole("link", { name: "How it works" }));
    expect(menu).not.toHaveAttribute("open");
  });
});

describe("starter offer copy", () => {
  afterEach(cleanup);

  it("invites signed-out and registered visitors to consider the starter offer", () => {
    const { rerender } = render(<StarterOfferCopy state="signed-out" defaultHeading="Try IncomeNow for US$1" defaultBody="Starter details" />);
    expect(screen.getByRole("heading", { name: "Try IncomeNow for US$1" })).toBeInTheDocument();

    rerender(<StarterOfferCopy state="registered" defaultHeading="Try IncomeNow for US$1" defaultBody="Starter details" />);
    expect(screen.getByRole("heading", { name: "Try IncomeNow for US$1" })).toBeInTheDocument();
  });

  it("gives starter accounts a continue message without another purchase prompt", () => {
    render(<StarterOfferCopy state="starter" defaultHeading="Try IncomeNow for US$1" defaultBody="Starter details" />);
    expect(screen.getByRole("heading", { name: "Open your Pergola starter" })).toBeInTheDocument();
    expect(screen.queryByText(/US\$1/)).not.toBeInTheDocument();
  });

  it("gives full members a library message without a redundant starter offer", () => {
    render(<StarterOfferCopy state="full" defaultHeading="Try IncomeNow for US$1" defaultBody="Starter details" />);
    expect(screen.getByRole("heading", { name: "Explore your full idea library" })).toBeInTheDocument();
    expect(screen.queryByText(/US\$1/)).not.toBeInTheDocument();
  });
});
