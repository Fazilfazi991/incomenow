import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { emptyAccountPreferences } from "@/lib/account-preferences";
import { SettingsClient } from "./settings-client";

const refresh = vi.fn();
const push = vi.fn();
const saveDisplayNameAction = vi.fn();
const savePreferencesAction = vi.fn();

vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh, push }) }));
vi.mock("@/app/account/actions", () => ({
  saveDisplayNameAction: (...args: unknown[]) => saveDisplayNameAction(...args),
  savePreferencesAction: (...args: unknown[]) => savePreferencesAction(...args),
}));

afterEach(cleanup);

describe("account settings drafts", () => {
  beforeEach(() => {
    refresh.mockReset();
    push.mockReset();
    saveDisplayNameAction.mockReset();
    savePreferencesAction.mockReset();
  });

  it("saves profile independently without resetting an unsaved preference draft", async () => {
    const user = userEvent.setup();
    saveDisplayNameAction.mockResolvedValue({ ok: true, data: { displayName: "New name" } });
    render(
      <SettingsClient
        email="member@example.test"
        initialDisplayName="Old name"
        initialPreferences={emptyAccountPreferences}
        methods={["Email and password"]}
        access="inactive"
      />,
    );

    const automation = screen.getByRole("checkbox", { name: /Automation/i });
    await user.click(automation);
    const name = screen.getByRole("textbox", { name: "Display name" });
    await user.clear(name);
    await user.type(name, "New name");
    await user.click(screen.getByRole("button", { name: "Save profile" }));

    expect(await screen.findByText("Display name saved.")).toBeInTheDocument();
    expect(automation).toBeChecked();
    expect(savePreferencesAction).not.toHaveBeenCalled();
    expect(refresh).toHaveBeenCalledOnce();
  });

  it("cancels profile and preference drafts independently", async () => {
    const user = userEvent.setup();
    render(
      <SettingsClient
        email="member@example.test"
        initialDisplayName="Saved name"
        initialPreferences={emptyAccountPreferences}
        methods={["Email and password"]}
        access="inactive"
      />,
    );

    const profileSection = screen.getByRole("heading", { name: "Profile" }).closest("section");
    const preferenceSection = screen.getByRole("heading", { name: "Discovery preferences" }).closest("section");
    expect(profileSection).not.toBeNull();
    expect(preferenceSection).not.toBeNull();
    if (!profileSection || !preferenceSection) return;

    const name = screen.getByRole("textbox", { name: "Display name" });
    const automation = screen.getByRole("checkbox", { name: /Automation/i });
    await user.clear(name);
    await user.type(name, "Draft name");
    await user.click(automation);
    await user.click(within(profileSection).getByRole("button", { name: "Cancel changes" }));

    expect(name).toHaveValue("Saved name");
    expect(automation).toBeChecked();

    await user.type(name, " edited");
    await user.click(within(preferenceSection).getByRole("button", { name: "Cancel changes" }));
    expect(name).toHaveValue("Saved name edited");
    expect(automation).not.toBeChecked();
  });

  it("protects an unsaved draft during internal account navigation", async () => {
    const user = userEvent.setup();
    render(
      <SettingsClient
        email="member@example.test"
        initialDisplayName="Saved name"
        initialPreferences={emptyAccountPreferences}
        methods={["Email and password"]}
        access="inactive"
      />,
    );

    await user.click(screen.getByRole("checkbox", { name: /Automation/i }));
    await user.click(screen.getByRole("link", { name: /Review access/i }));

    expect(screen.getByRole("dialog", { name: "Discard account changes?" })).toBeInTheDocument();
    expect(push).not.toHaveBeenCalled();
    await user.click(screen.getByRole("button", { name: "Discard changes" }));
    expect(push).toHaveBeenCalledWith("/account/access");
  });
});
