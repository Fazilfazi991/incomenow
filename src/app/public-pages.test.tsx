import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { PublicAccountState } from "@/lib/public-account";
import HomePage from "./page";
import MembershipPage from "./membership/page";

const { getPublicAccountState } = vi.hoisted(() => ({
  getPublicAccountState: vi.fn<() => Promise<PublicAccountState>>(),
}));

vi.mock("@/lib/public-account.server", () => ({ getPublicAccountState }));
vi.mock("@/content/public-content.server", () => ({ getPublicIdeas: () => [] }));
vi.mock("next/font/google", () => ({ Barlow_Condensed: () => ({ variable: "vault-font" }) }));
vi.mock("@/lib/billing-view.server", () => ({getMembershipBillingView:async()=>({capacity:null,checkoutAvailable:false,waitlistAvailable:false,stats:{capacity:600,active:null,available:null,source:"unavailable",allocation:"unknown"}})}));
vi.mock("@/app/membership/billing-actions",()=>({joinMembership:vi.fn(),joinMembershipWaitlist:vi.fn(),manageMembershipBilling:vi.fn()}));
vi.mock("@/lib/membership.server",()=>({getAccountAccessContext:async()=>({user:null})}));

describe("paid-account public offer copy", () => {
  afterEach(() => {
    cleanup();
    getPublicAccountState.mockReset();
  });

  it.each([
    ["starter", "Open your Pergola starter"],
    ["full", "Explore your full idea library"],
  ] as const)("removes purchase headings from the home page for %s access", async (state, expectedHeading) => {
    getPublicAccountState.mockResolvedValue(state);
    render(await HomePage());

    expect(screen.getAllByRole("heading", { name: expectedHeading })).toHaveLength(1);
    expect(screen.queryByRole("heading", { name: /US\$1/ })).not.toBeInTheDocument();
  });

  it.each([
    ["starter", "Open your Pergola starter"],
    ["full", "Explore your full idea library"],
  ] as const)("removes the closing purchase heading from membership for %s access", async (state, expectedHeading) => {
    getPublicAccountState.mockResolvedValue(state);
    render(await MembershipPage({}));

    expect(screen.getByRole("heading", { name: expectedHeading })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Try IncomeNow for US$1" })).not.toBeInTheDocument();
  });

  it.each(["signed-out", "registered", "starter", "full", "unavailable"] as const)("presents consistent full membership without checkout for %s", async state => {
    getPublicAccountState.mockResolvedValue(state);
    render(await MembershipPage({}));
    expect(screen.getAllByText("US$14.99")).toHaveLength(1);
    expect(screen.getByText("Maximum 600 active members")).toBeInTheDocument();
    expect(screen.queryByText("Price to be confirmed")).not.toBeInTheDocument();
    expect(screen.getByText("Waitlist enrollment is not connected yet.")).toBeInTheDocument();
    if (state === "full") {
      expect(screen.getByRole("link", { name: "Open your library" })).toHaveAttribute("href", "/app/explore");
      expect(screen.queryByRole("link", { name: "Try IncomeNow for US$1" })).not.toBeInTheDocument();
    } else if (state === "starter") {
      expect(screen.getByRole("link", { name: "Review full membership upgrade" })).toHaveAttribute("href", "/account/access");
    }
    expect(screen.queryByRole("button", { name: /pay|checkout|waitlist/i })).not.toBeInTheDocument();
  });
});
