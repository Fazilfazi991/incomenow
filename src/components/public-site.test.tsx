import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import { PublicAccountActions } from "./public-site";

describe("public account actions", () => {
  afterEach(cleanup);

  it("offers registration and login only to signed-out visitors", () => {
    render(<PublicAccountActions state="signed-out" />);
    expect(screen.getByRole("link", { name: "Create account" })).toHaveAttribute("href", "/register");
    expect(screen.getByRole("link", { name: "Log in" })).toHaveAttribute("href", "/login");
  });

  it("sends active members to the protected library", () => {
    render(<PublicAccountActions state="active" />);
    expect(screen.getByRole("link", { name: "Open idea library" })).toHaveAttribute("href", "/app/explore");
    expect(screen.queryByRole("link", { name: "Create account" })).not.toBeInTheDocument();
  });

  it("keeps inactive and unavailable states distinct", () => {
    const { rerender } = render(<PublicAccountActions state="inactive" />);
    expect(screen.getByText(/Membership access is inactive/)).toHaveTextContent("checkout is not available yet");
    expect(screen.getByRole("link", { name: "View account access" })).toHaveAttribute("href", "/account/access");

    rerender(<PublicAccountActions state="unavailable" />);
    expect(screen.getByText("Account status is temporarily unavailable")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Check account access" })).toHaveAttribute("href", "/account/access");
    expect(screen.queryByText(/inactive/i)).not.toBeInTheDocument();
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
