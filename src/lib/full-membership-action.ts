import type { PublicAccountState } from "./public-account";

/** Account navigation only: no purchase, reservation, or entitlement mutation. */
export function fullMembershipAction(state: PublicAccountState) {
  switch (state) {
    case "full": return { href: "/app/explore", label: "Open your library", notice: "Your existing full membership is active. No purchase is required." };
    case "signed-out": return { href: `/register?next=${encodeURIComponent("/account/access")}`, label: "Create account", notice: "Account registration is open. Paid checkout is not connected; signup does not activate membership." };
    case "starter": return { href: "/account/access", label: "Review full membership upgrade", notice: "Your starter remains separate. Full membership checkout is not connected yet." };
    case "registered": return { href: "/account/access", label: "Review membership access", notice: "Paid membership checkout is not connected yet. Your account does not grant full membership." };
    case "unavailable": return { href: "/account/access", label: "Check account access", notice: "We could not verify account access. Check your account before continuing." };
  }
}
