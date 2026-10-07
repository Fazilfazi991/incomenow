import { describe, expect, it } from "vitest";
import { membershipConfig } from "./membership-config";
import { membershipLaunch } from "./membership-capacity";
import { fullMembershipOffer, starterOffer } from "@/content/membership-offer";
import { fullMembershipAction } from "./full-membership-action";

describe("shared membership product truth", () => {
  it("uses one object for homepage and membership offers", () => {
    expect(membershipLaunch).toBe(membershipConfig.fullMembership);
    expect(fullMembershipOffer).toBe(membershipConfig.fullMembership);
    expect(starterOffer).toBe(membershipConfig.starter);
    expect(fullMembershipOffer).toMatchObject({ amountMinor: 1499, currency: "USD", priceLabel: "$14.99", priceLabelUsd: "US$14.99", capacity: 600, checkoutAvailable: false, waitlistMode: "not-connected" });
  });
  it.each(["signed-out", "registered", "starter", "full", "unavailable"] as const)("uses safe account navigation for %s", state => {
    const action = fullMembershipAction(state);
    expect(action.href).not.toContain("checkout");
    if (state === "full") expect(action).toMatchObject({ href: "/app/explore", label: "Open your library" });
    else expect(action.notice).toMatch(/not connected|could not verify/);
  });
});
