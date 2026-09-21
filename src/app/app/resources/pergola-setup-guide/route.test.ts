import { beforeEach, describe, expect, it, vi } from "vitest";

const { requireVerifiedAccount, getIdeaAccessDecision } = vi.hoisted(() => ({
  requireVerifiedAccount: vi.fn(),
  getIdeaAccessDecision: vi.fn(),
}));

vi.mock("@/lib/membership.server", () => ({ requireVerifiedAccount, getIdeaAccessDecision }));

import { GET } from "./route";

describe("protected Pergola setup guide", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireVerifiedAccount.mockResolvedValue({ user: { id: "member-1" } });
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
});
