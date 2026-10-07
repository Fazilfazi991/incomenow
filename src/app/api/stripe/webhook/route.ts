import { getStripe } from "@/lib/stripe.server";
import { readBillingConfig } from "@/lib/billing-config";
import { processMembershipEvent } from "@/lib/billing-webhook.server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let stripe, config;
  try { stripe=getStripe(); config=readBillingConfig(); } catch { return new Response("Billing unavailable", { status:503 }); }
  const signature=request.headers.get("stripe-signature");
  if (!signature || Number(request.headers.get("content-length")??0)>1_048_576) return new Response("Invalid webhook", { status:400 });
  const body=await request.text();
  if (Buffer.byteLength(body)>1_048_576) return new Response("Invalid webhook", { status:400 });
  let event;
  try { event=stripe.webhooks.constructEvent(body,signature,config.webhookSecret); } catch { return new Response("Invalid signature", { status:400 }); }
  if (event.livemode !== config.livemode) return new Response("Webhook mode mismatch", { status:400 });
  try { await processMembershipEvent(event,stripe); } catch {
    console.error("[billing] webhook requires retry", { eventId:event.id, type:event.type });
    return new Response("Retry webhook", { status:503 });
  }
  return Response.json({ received:true }, { headers:{"cache-control":"no-store"} });
}
