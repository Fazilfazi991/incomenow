import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import { resolveMembershipStats } from "@/lib/membership-capacity";
import { MembershipCapacity } from "./membership-capacity";
import { ExecutionFlow } from "./execution-flow";
import { VaultHomepage } from "./vault-home";

afterEach(cleanup);

describe("homepage capacity and execution", () => {
  it("labels demo activity and uses an honest production state", () => {
    const { rerender } = render(<MembershipCapacity stats={resolveMembershipStats({ environment: { NODE_ENV: "development" } })} />);
    expect(screen.getByText("200")).toBeInTheDocument();
    expect(screen.getByText("Demo count. Not real member activity.")).toBeInTheDocument();
    rerender(<MembershipCapacity stats={resolveMembershipStats({ environment: { NODE_ENV: "production" } })} />);
    expect(screen.queryByText("200")).not.toBeInTheDocument();
    expect(screen.getByText("600")).toBeInTheDocument();
    expect(screen.getByText("Occupancy count not published.")).toBeInTheDocument();
  });
  it("lets keyboard users inspect stages without changing project state", async () => {
    const user = userEvent.setup();
    render(<ExecutionFlow />);
    screen.getByRole("tab", { name: /Discover/ }).focus();
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("tab", { name: /Understand/ })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tab", { name: /Understand/ })).toHaveFocus();
    expect(within(screen.getByRole("tabpanel")).getByText("Know what you are actually building.")).toBeInTheDocument();
    await user.keyboard("{End}");
    expect(screen.getByRole("tab", { name: /Grow/ })).toHaveFocus();
  });
  it("keeps account registration, full membership and the starter separate", () => {
    const stats = resolveMembershipStats({ environment: { NODE_ENV: "production" } });
    const { rerender } = render(<VaultHomepage state="signed-out" ideas={[]} stats={stats} />);
    expect(screen.getByRole("link", { name: "Get access" })).toHaveAttribute("href", "/register?next=%2Fmembership");
    expect(screen.getByText("Account registration is open. Membership enrollment is currently closed.")).toBeInTheDocument();
    expect(screen.getByText("$14.99")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Try IncomeNow for US$1" })).toHaveAttribute("href", "/register?next=%2Fmembership%3Foffer%3Dstarter");
    rerender(<VaultHomepage state="full" ideas={[]} stats={stats} />);
    expect(screen.getByRole("link", { name: "Open your library" })).toHaveAttribute("href", "/app/explore");
    expect(screen.queryByRole("link", { name: "Get access" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Try IncomeNow for US$1" })).not.toBeInTheDocument();
  });
});
