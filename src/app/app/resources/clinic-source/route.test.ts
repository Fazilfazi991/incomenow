import { createHash } from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  readFile: vi.fn(),
  requireVerifiedAccount: vi.fn(),
  getIdeaAccessDecision: vi.fn(),
  distribution: {
    technicalPackageReady: true as boolean,
    redistributionApproved: true as boolean,
    approvalDate: "2026-09-21",
    approvedPackageSha256: "" as string,
    approvedPackageSizeBytes: 0 as number,
    statusLabel: "Source package available.",
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

const approvedFixture = Buffer.from([0x50, 0x4b, 0x03, 0x04]);

describe("protected Clinic distribution archive", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireVerifiedAccount.mockResolvedValue({ user: { id: "member-1" } });
    mocks.distribution.technicalPackageReady = true;
    mocks.distribution.redistributionApproved = true;
    mocks.distribution.approvedPackageSha256 = createHash("sha256").update(approvedFixture).digest("hex").toUpperCase();
    mocks.distribution.approvedPackageSizeBytes = approvedFixture.byteLength;
    mocks.readFile.mockResolvedValue(approvedFixture);
  });

  it("propagates the verified-account guard before checking access or release state", async () => {
    const signedOut = new Error("signed-out redirect");
    mocks.requireVerifiedAccount.mockRejectedValue(signedOut);

    await expect(GET()).rejects.toBe(signedOut);
    expect(mocks.getIdeaAccessDecision).not.toHaveBeenCalled();
    expect(mocks.readFile).not.toHaveBeenCalled();
  });

  it.each(["registered/free", "Pergola Starter", "expired full membership", "revoked full membership"])("denies %s access before reading the archive", async () => {
    mocks.getIdeaAccessDecision.mockReturnValue({ status: "inactive", source: null });
    const response = await GET();

    expect(response.status).toBe(403);
    expect(response.headers.get("cache-control")).toBe("private, no-store");
    expect(mocks.readFile).not.toHaveBeenCalled();
  });

  it("does not treat a non-membership idea grant as full-member source access", async () => {
    mocks.getIdeaAccessDecision.mockReturnValue({ status: "active", source: "starter" });
    const response = await GET();

    expect(response.status).toBe(403);
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
    mocks.distribution.redistributionApproved = false;
    mocks.getIdeaAccessDecision.mockReturnValue({ status: "active", source: "full-membership" });
    const response = await GET();

    expect(response.status).toBe(423);
    expect(await response.text()).toBe("Source package release is not approved.");
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
    mocks.getIdeaAccessDecision.mockReturnValue({ status: "active", source: "full-membership" });
    const response = await GET();
    const downloaded = Buffer.from(await response.arrayBuffer());

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("application/zip");
    expect(response.headers.get("cache-control")).toBe("private, no-store");
    expect(response.headers.get("content-disposition")).toBe('attachment; filename="clinic-operations-crm-distribution.zip"');
    expect(response.headers.get("content-length")).toBe(String(approvedFixture.byteLength));
    expect(response.headers.get("x-content-type-options")).toBe("nosniff");
    expect(mocks.readFile).toHaveBeenCalledWith(expect.stringMatching(/private-resources[\\/]clinic[\\/]clinic-operations-crm-distribution\.zip$/));
    expect(mocks.readFile).not.toHaveBeenCalledWith(expect.stringMatching(/besmile-production-readiness\.zip$/));
    expect(downloaded).toEqual(approvedFixture);
    expect(createHash("sha256").update(downloaded).digest("hex").toUpperCase()).toBe(mocks.distribution.approvedPackageSha256);
  });

  it("fails closed when the fixed package no longer matches the owner-approved SHA-256", async () => {
    mocks.getIdeaAccessDecision.mockReturnValue({ status: "active", source: "full-membership" });
    mocks.readFile.mockResolvedValue(Buffer.from([0x50, 0x4b, 0x03, 0x05]));
    const response = await GET();

    expect(response.status).toBe(503);
    expect(response.headers.get("cache-control")).toBe("private, no-store");
    expect(await response.text()).toBe("The approved source package is temporarily unavailable.");
  });

  it("does not expose a filesystem path when an approved archive is unavailable", async () => {
    mocks.getIdeaAccessDecision.mockReturnValue({ status: "active", source: "full-membership" });
    mocks.readFile.mockRejectedValue(new Error("missing local file"));
    const response = await GET();

    expect(response.status).toBe(503);
    expect(await response.text()).toBe("The source package is temporarily unavailable.");
  });
});
