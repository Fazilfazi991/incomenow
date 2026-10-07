import Link from "next/link";
import type { PublicAccountState } from "@/lib/public-account";
import type { BillingCapacity } from "@/lib/billing-store.server";
import { joinMembership, joinMembershipWaitlist, manageMembershipBilling } from "@/app/membership/billing-actions";
import { fullMembershipAction } from "@/lib/full-membership-action";

export function MembershipBillingControls({state,capacity,checkoutAvailable,waitlistAvailable,hasInvitation=false,canManageBilling=false}:{state:PublicAccountState;
  capacity:BillingCapacity|null;checkoutAvailable:boolean;waitlistAvailable:boolean;hasInvitation?:boolean;canManageBilling?:boolean}) {
  if(state==="full") return <div><Link className="public-button public-button-primary" href="/app/explore">Open your library</Link>
    {canManageBilling&&<form action={manageMembershipBilling}><button className="public-button public-button-secondary" type="submit">Manage Billing</button></form>}</div>;
  if(state==="signed-out") return <div><Link className="public-button public-button-primary" href="/register?next=%2Fmembership">Create account</Link>
    <Link className="public-text-link" href="/login?next=%2Fmembership">Log in</Link></div>;
  if(state==="unavailable") return <Link className="public-button public-button-primary" href="/account/access">Check account access</Link>;
  if(checkoutAvailable && capacity && (capacity.allocatable>0 || hasInvitation)) return <form action={joinMembership}><button className="public-button public-button-primary" type="submit">{state==="starter"?"Upgrade to full membership":"Join membership"}</button></form>;
  if(capacity?.allocatable===0 && waitlistAvailable) return <form action={joinMembershipWaitlist}><button className="public-button public-button-primary" type="submit">Join Waitlist</button></form>;
  const fallback=fullMembershipAction(state);
  return <Link className="public-button public-button-primary" href={fallback.href}>{fallback.label}</Link>;
}
