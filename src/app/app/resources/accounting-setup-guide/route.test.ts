import { beforeEach, describe, expect, it, vi } from "vitest";

const { requireVerifiedAccount, getIdeaAccessDecision } = vi.hoisted(() => ({
  requireVerifiedAccount: vi.fn(),
  getIdeaAccessDecision: vi.fn(),
}));

vi.mock("@/lib/membership.server", () => ({ requireVerifiedAccount, getIdeaAccessDecision }));

import { GET } from "./route";

describe("protected Accounting setup guide", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireVerifiedAccount.mockResolvedValue({ user: { id: "member-1" } });
  });

  it("refuses registered and Pergola-only accounts", async () => {
    getIdeaAccessDecision.mockReturnValue({ status: "inactive", source: null });
    const registered = await GET();
    expect(registered.status).toBe(403);

    getIdeaAccessDecision.mockReturnValue({ status: "active", source: "idea-grant" });
    const starter = await GET();
    expect(starter.status).toBe(403);
    expect(starter.headers.get("cache-control")).toBe("private, no-store");
    expect(getIdeaAccessDecision).toHaveBeenCalledWith(expect.anything(), "idea-003");
  });

  it("fails closed when the access lookup is unavailable", async () => {
    getIdeaAccessDecision.mockReturnValue({ status: "unavailable", source: null });
    const response = await GET();
    expect(response.status).toBe(503);
    expect(response.headers.get("cache-control")).toBe("private, no-store");
  });

  it("returns a private guide only to a full member", async () => {
    getIdeaAccessDecision.mockReturnValue({ status: "active", source: "full-membership" });
    const response = await GET();
    const guide = await response.text();

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("text/markdown; charset=utf-8");
    expect(response.headers.get("cache-control")).toBe("private, no-store");
    expect(response.headers.get("content-disposition")).toContain("fynta-accounting-operations-setup-guide.md");
    expect(guide).toContain("# FYNTA Accounting & Finance Operations");
    expect(guide).toContain("npm ci");
    expect(guide).toContain("AI output requires human review");
    expect(guide).not.toContain("SUPABASE_SERVICE_ROLE_KEY=");
  });
});
