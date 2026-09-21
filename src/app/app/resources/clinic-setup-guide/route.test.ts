import { beforeEach, describe, expect, it, vi } from "vitest";

const { requireVerifiedAccount, getIdeaAccessDecision } = vi.hoisted(() => ({
  requireVerifiedAccount: vi.fn(),
  getIdeaAccessDecision: vi.fn(),
}));

vi.mock("@/lib/membership.server", () => ({ requireVerifiedAccount, getIdeaAccessDecision }));

import { GET } from "./route";

describe("protected Clinic setup guide", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireVerifiedAccount.mockResolvedValue({ user: { id: "member-1" } });
  });

  it("refuses registered and Pergola-only accounts when Clinic access is inactive", async () => {
    getIdeaAccessDecision.mockReturnValue({ status: "inactive", source: null });
    const response = await GET();

    expect(response.status).toBe(403);
    expect(response.headers.get("cache-control")).toBe("private, no-store");
    expect(getIdeaAccessDecision).toHaveBeenCalledWith(expect.anything(), "idea-002");
  });

  it("fails closed when the current Clinic access lookup is unavailable", async () => {
    getIdeaAccessDecision.mockReturnValue({ status: "unavailable", source: null });
    const response = await GET();

    expect(response.status).toBe(503);
    expect(response.headers.get("cache-control")).toBe("private, no-store");
  });

  it("returns the inspected guide as a private full-member download", async () => {
    getIdeaAccessDecision.mockReturnValue({ status: "active", source: "full-membership" });
    const response = await GET();
    const guide = await response.text();

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("text/markdown; charset=utf-8");
    expect(response.headers.get("cache-control")).toBe("private, no-store");
    expect(response.headers.get("content-disposition")).toContain("bsmile-clinic-crm-setup-guide.md");
    expect(guide).toContain("# BSmile Clinic Operations CRM — inspected setup and handover guide");
    expect(guide).toContain("pnpm install --frozen-lockfile");
    expect(guide).toContain("Never paste passwords");
    expect(guide).not.toContain("SUPABASE_SERVICE_ROLE_KEY=");
  });
});
