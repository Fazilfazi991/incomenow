import Link from "next/link";
import { requireVerifiedAccount } from "@/lib/membership.server";

export const dynamic="force-dynamic";
export default async function MembershipReturnPage() {
  const context=await requireVerifiedAccount("/membership/return");
  const active=context.fullMembership==="active";
  return <main className="account-service-page"><section><h1>{active?"Your membership is active":"Confirming your membership"}</h1>
    <p>{active?"Your paid access has been verified. Your included library is ready.":"Payment confirmation may take a moment. Access opens after the payment provider’s verified confirmation reaches IncomeNow."}</p>
    <Link className="primary-button" href={active?"/app/explore":"/account/access"}>{active?"Open your library":"Check membership access"}</Link>
    {!active&&<Link className="secondary-button" href="/membership/return">Refresh status</Link>}</section></main>;
}
