import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getBillingCapacity } from "@/lib/billing-store.server";
import { membershipConfig } from "@/lib/membership-config";
import { inviteNextMembershipAccount } from "./actions";

export const dynamic="force-dynamic";
export default async function AdminMembershipPage() {
  if (!isSupabaseConfigured()) redirect("/account/access");
  const supabase=await createClient();
  const {data}=await supabase.auth.getUser();
  if (!data.user) redirect("/login?next=%2Fadmin%2Fmembership");
  const admin=await supabase.rpc("is_acquisition_admin");
  if (admin.error || !admin.data) notFound();
  const capacity=await getBillingCapacity();
  const offer=membershipConfig.fullMembership;
  return <main className="account-service-page"><section style={{width:"min(760px,100%)"}}><Link href="/admin/race">Team race</Link>
    <h1>Membership allocation</h1><p>{offer.priceLabelUsd} / {offer.interval}. Maximum {offer.capacity} active full memberships.</p>
    {capacity?<><dl className="access-details">
      <div><dt>Active memberships</dt><dd>{capacity.active} / {offer.capacity}</dd></div>
      <div><dt>Available to reserve</dt><dd>{capacity.allocatable}</dd></div>
      <div><dt>Checkout reservations</dt><dd>{capacity.checkout_reservations??capacity.reserved}</dd></div>
      <div><dt>Renewal / uncertain holds</dt><dd>{capacity.renewal_holds??0}</dd></div>
      <div><dt>Cancelling at period end</dt><dd>{capacity.cancelling}</dd></div>
      <div><dt>Waitlist</dt><dd>{capacity.waitlist}</dd></div>
      <div><dt>Subscription issues</dt><dd>{capacity.issues}</dd></div>
      <div><dt>Derived monthly run rate</dt><dd>{new Intl.NumberFormat("en-US",{style:"currency",currency:offer.currency}).format(capacity.paid_monthly*offer.amountMinor/100)}</dd></div>
    </dl><p>The derived run rate is {capacity.paid_monthly} currently paid monthly subscriptions × {offer.priceLabelUsd}. It excludes complimentary grants, refunds, tax and Stripe fees.</p>
    <p>{capacity.checkout_enabled?"Database checkout gate enabled.":"Database checkout gate closed."} Unresolved payment holds remain occupied until provider reconciliation.</p></>:<p role="status">Billing metrics are unavailable. No occupancy estimate is shown.</p>}
    {capacity?.checkout_enabled&&capacity.waitlist_enabled&&capacity.allocatable>0&&capacity.waitlist>0&&<form action={inviteNextMembershipAccount}><button className="secondary-button" type="submit">Reserve next waitlist invitation</button></form>}
    <p>Invitations reserve one slot for the oldest eligible verified account for 24 hours. The invitation appears in that account’s membership page. No email is sent.</p>
    </section></main>;
}
