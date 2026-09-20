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

    expect(screen.getAllByRole("heading", { name: expectedHeading })).toHaveLength(2);
    expect(screen.queryByRole("heading", { name: /US\$1/ })).not.toBeInTheDocument();
  });

  it.each([
    ["starter", "Open your Pergola starter"],
    ["full", "Explore your full idea library"],
  ] as const)("removes the closing purchase heading from membership for %s access", async (state, expectedHeading) => {
    getPublicAccountState.mockResolvedValue(state);
    render(await MembershipPage());

    expect(screen.getByRole("heading", { name: expectedHeading })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Try IncomeNow for US$1" })).not.toBeInTheDocument();
  });
});
