import { beforeEach, describe, expect, it, vi } from "vitest";

const { requireVerifiedAccount, getIdeaAccessDecision, loadPergolaPrivateKitContent } = vi.hoisted(() => ({
  requireVerifiedAccount: vi.fn(),
  getIdeaAccessDecision: vi.fn(),
  loadPergolaPrivateKitContent: vi.fn(),
}));

vi.mock("@/lib/membership.server", () => ({ requireVerifiedAccount, getIdeaAccessDecision }));
vi.mock("@/lib/private-resources.server", () => ({ loadPergolaPrivateKitContent }));

import { GET } from "./route";

describe("protected Pergola setup guide", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireVerifiedAccount.mockResolvedValue({ user: { id: "member-1" } });
    loadPergolaPrivateKitContent.mockResolvedValue({
      markdown: { title: "Universal Pergola CRM — local setup and handover guide", introduction: "Inspected guide.", promptHeading: "Copyable Codex prompts", warning: "Never paste passwords." },
      setupGuide: [{ id: "test", label: "01", title: "Build", status: "VERIFIED", body: "Run the checks.", commands: ["npm run build"] }],
      codexPrompts: ["Inspect safely."],
    });
  });

  it("refuses the guide when current IDEA #001 access is inactive", async () => {
    getIdeaAccessDecision.mockReturnValue({ status: "inactive", source: null });
    const response = await GET();
    expect(response.status).toBe(403);
    expect(response.headers.get("cache-control")).toBe("private, no-store");
  });

  it("returns the inspected guide as a private member download", async () => {
    getIdeaAccessDecision.mockReturnValue({ status: "active", source: "full-membership" });
    const response = await GET();
    const guide = await response.text();
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("text/markdown; charset=utf-8");
    expect(response.headers.get("cache-control")).toBe("private, no-store");
    expect(guide).toContain("# Universal Pergola CRM — local setup and handover guide");
    expect(guide).toContain("npm run build");
    expect(guide).toContain("Never paste passwords");
  });

  it("fails closed when the private guide artifact is missing", async () => {
    getIdeaAccessDecision.mockReturnValue({ status: "active", source: "starter" });
    loadPergolaPrivateKitContent.mockRejectedValue(new Error("missing"));
    const response = await GET();
    expect(response.status).toBe(503);
    expect(response.headers.get("cache-control")).toBe("private, no-store");
  });
});
