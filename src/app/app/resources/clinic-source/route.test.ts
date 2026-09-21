import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  readFile: vi.fn(),
  requireVerifiedAccount: vi.fn(),
  getIdeaAccessDecision: vi.fn(),
  distribution: {
    technicalPackageReady: true as boolean,
    redistributionApproved: false as boolean,
    statusLabel: "Source package prepared — release approval pending.",
  },
}));

vi.mock("node:fs/promises", () => ({ default: { readFile: mocks.readFile }, readFile: mocks.readFile }));
vi.mock("@/lib/membership.server", () => ({
  requireVerifiedAccount: mocks.requireVerifiedAccount,
  getIdeaAccessDecision: mocks.getIdeaAccessDecision,
}));
vi.mock("@/content/clinic-distribution", () => ({
  clinicDistributionState: mocks.distribution,
  clinicDistributionDownloadEnabled: () => mocks.distribution.technicalPackageReady && mocks.distribution.redistributionApproved,
}));

import { GET } from "./route";

describe("protected Clinic distribution archive", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireVerifiedAccount.mockResolvedValue({ user: { id: "member-1" } });
    mocks.distribution.technicalPackageReady = true;
    mocks.distribution.redistributionApproved = false;
  });

  it("propagates the verified-account guard before checking access or release state", async () => {
    const signedOut = new Error("signed-out redirect");
    mocks.requireVerifiedAccount.mockRejectedValue(signedOut);

    await expect(GET()).rejects.toBe(signedOut);
    expect(mocks.getIdeaAccessDecision).not.toHaveBeenCalled();
    expect(mocks.readFile).not.toHaveBeenCalled();
  });

  it("denies registered and Pergola-only accounts before revealing release state", async () => {
    mocks.getIdeaAccessDecision.mockReturnValue({ status: "inactive", source: null });
    const response = await GET();

    expect(response.status).toBe(403);
    expect(response.headers.get("cache-control")).toBe("private, no-store");
    expect(mocks.readFile).not.toHaveBeenCalled();
  });

  it("fails closed when the current Clinic access lookup is unavailable", async () => {
    mocks.getIdeaAccessDecision.mockReturnValue({ status: "unavailable", source: null });
    const response = await GET();

    expect(response.status).toBe(503);
    expect(response.headers.get("cache-control")).toBe("private, no-store");
    expect(mocks.readFile).not.toHaveBeenCalled();
  });

  it("keeps the technically ready archive locked until owner approval", async () => {
    mocks.getIdeaAccessDecision.mockReturnValue({ status: "active", source: "full-membership" });
    const response = await GET();

    expect(response.status).toBe(423);
    expect(await response.text()).toContain("release approval pending");
    expect(response.headers.get("cache-control")).toBe("private, no-store");
    expect(mocks.readFile).not.toHaveBeenCalled();
  });

  it("fails closed when technical readiness is withdrawn", async () => {
    mocks.distribution.technicalPackageReady = false;
    mocks.getIdeaAccessDecision.mockReturnValue({ status: "active", source: "full-membership" });
    const response = await GET();

    expect(response.status).toBe(503);
    expect(response.headers.get("cache-control")).toBe("private, no-store");
    expect(mocks.readFile).not.toHaveBeenCalled();
  });

  it("serves only the sanitised archive after both access and release approval", async () => {
    mocks.distribution.redistributionApproved = true;
    mocks.getIdeaAccessDecision.mockReturnValue({ status: "active", source: "full-membership" });
    mocks.readFile.mockResolvedValue(Buffer.from([0x50, 0x4b, 0x03, 0x04]));
    const response = await GET();

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("application/zip");
    expect(response.headers.get("cache-control")).toBe("private, no-store");
    expect(response.headers.get("content-disposition")).toContain("clinic-operations-crm-distribution.zip");
    expect(mocks.readFile).toHaveBeenCalledWith(expect.stringMatching(/private-resources[\\/]clinic[\\/]clinic-operations-crm-distribution\.zip$/));
    expect(new Uint8Array(await response.arrayBuffer())).toEqual(new Uint8Array([0x50, 0x4b, 0x03, 0x04]));
  });

  it("does not expose a filesystem path when an approved archive is unavailable", async () => {
    mocks.distribution.redistributionApproved = true;
    mocks.getIdeaAccessDecision.mockReturnValue({ status: "active", source: "full-membership" });
    mocks.readFile.mockRejectedValue(new Error("missing local file"));
    const response = await GET();

    expect(response.status).toBe(503);
    expect(await response.text()).toBe("The source package is temporarily unavailable.");
  });
});
