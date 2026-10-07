import { timingSafeEqual } from "node:crypto";
import { billingCommand, type BillingSubscription } from "@/lib/billing-store.server";
import { reconcileMembership } from "@/lib/billing-webhook.server";

export const runtime="nodejs";
export const dynamic="force-dynamic";
export const maxDuration=300;
export async function GET(request:Request) {
  const expected=process.env.BILLING_RECONCILIATION_SECRET;
  const actual=request.headers.get("authorization")??"";
  if (!expected || actual.length!==`Bearer ${expected}`.length || !timingSafeEqual(Buffer.from(actual),Buffer.from(`Bearer ${expected}`))) return new Response("Unauthorized",{status:401});
  let failures=0;
  try {
    const rows=await billingCommand<BillingSubscription[]>("reconcile_list");
    const deadline=Date.now()+120_000;
    let checked=0;
    for (const row of rows) {
      if(Date.now()>deadline) break;
      checked++;
      try { await reconcileMembership(row,{id:`reconcile:${row.id}:${Math.floor(Date.now()/300000)}`,type:"reconciliation",created:Math.floor(Date.now()/1000)}); }
      catch { failures++; console.error("[billing] reconciliation requires retry",{reservationId:row.id}); }
    }
    console.info("[billing] reconciliation completed",{checked,failures});
    return Response.json({ checked,failures },{status:failures?503:200,headers:{"cache-control":"no-store"}});
  } catch { console.error("[billing] reconciliation database unavailable");return new Response("Reconciliation unavailable",{status:503}); }
}
