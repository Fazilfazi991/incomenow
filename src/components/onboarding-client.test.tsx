import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { emptyAccountPreferences } from "@/lib/account-preferences";
import { OnboardingClient } from "./onboarding-client";

const replace = vi.fn();
const completeOnboardingAction = vi.fn();
const skipOnboardingAndContinueAction = vi.fn();

vi.mock("next/navigation", () => ({ useRouter: () => ({ replace }) }));
vi.mock("@/app/account/actions", () => ({
  completeOnboardingAction: (...args: unknown[]) => completeOnboardingAction(...args),
  skipOnboardingAndContinueAction: (...args: unknown[]) => skipOnboardingAndContinueAction(...args),
}));

describe("optional onboarding", () => {
  beforeEach(() => {
    replace.mockReset();
    completeOnboardingAction.mockReset();
    skipOnboardingAndContinueAction.mockReset();
  });

  it("starts empty and preserves the draft when save fails", async () => {
    const user = userEvent.setup();
    completeOnboardingAction.mockResolvedValue({ ok: false, error: "Temporary failure", code: "unavailable" });
    render(<OnboardingClient initial={emptyAccountPreferences} next="/account/access" />);

    const automation = screen.getByRole("checkbox", { name: /Automation/i });
    expect(automation).not.toBeChecked();
    await user.click(automation);
    await user.click(screen.getByRole("button", { name: /Save preferences and continue/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Temporary failure");
    expect(automation).toBeChecked();
    expect(replace).not.toHaveBeenCalled();
  });

  it("offers an honest continuation when recording skip fails", async () => {
    const user = userEvent.setup();
    skipOnboardingAndContinueAction.mockResolvedValue({ ok: false, error: "Skip was not saved", code: "unavailable" });
    render(<OnboardingClient initial={emptyAccountPreferences} next="/account/access" />);
    await user.click(screen.getAllByRole("button", { name: "Skip for now" })[0]);
    expect(await screen.findByRole("button", { name: "Continue without saving" })).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent("Skip was not saved");
  });
});
