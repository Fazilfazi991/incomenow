import type Stripe from "stripe";
import { describe,expect,it } from "vitest";
import { paidInvoiceWindow,eventMembershipReference } from "./billing-projection";
const invoice={id:"in_fixture",livemode:false,status:"paid",customer:"cus_fixture",currency:"usd",amount_paid:1499,created:1,
  parent:{subscription_details:{subscription:"sub_fixture"}},status_transitions:{paid_at:2},
  lines:{has_more:false,data:[{quantity:1,pricing:{price_details:{price:"price_fixture"}},period:{start:1,end:3},parent:{subscription_item_details:{proration:false}}}]}} as unknown as Stripe.Invoice;
describe("paid invoice entitlement projection",()=>{
  it("enforces both invoice mode boundaries, including unpaid invoices",()=>{
    expect(()=>paidInvoiceWindow(invoice,"sub_fixture","cus_fixture","price_fixture",true)).toThrow("mode mismatch");
    expect(()=>paidInvoiceWindow({...invoice,livemode:true,status:"open"},"sub_fixture","cus_fixture","price_fixture",false)).toThrow("mode mismatch");
    expect(paidInvoiceWindow({...invoice,livemode:true},"sub_fixture","cus_fixture","price_fixture",true)?.amount).toBe(1499);
  });
  it("extends only a matching paid monthly invoice",()=>{expect(paidInvoiceWindow(invoice,"sub_fixture","cus_fixture","price_fixture")).toMatchObject({amount:1499,invoiceId:"in_fixture",end:"1970-01-01T00:00:03.000Z"});});
  it("does not grant grace, unpaid or trial access",()=>{expect(paidInvoiceWindow({...invoice,status:"open"},"sub_fixture","cus_fixture","price_fixture")).toBeNull();expect(paidInvoiceWindow(null,"sub_fixture","cus_fixture","price_fixture")).toBeNull();});
  it.each(["sub_other","cus_other","price_other"])("rejects mismatched identity %s",value=>{
    const ids=["sub_fixture","cus_fixture","price_fixture"];ids[value.startsWith("sub")?0:value.startsWith("cus")?1:2]=value;
    expect(()=>paidInvoiceWindow(invoice,ids[0],ids[1],ids[2])).toThrow();
  });
  it("rejects changed amount, quantity, currency and incomplete lines",()=>{for(const patch of [{amount_paid:100},{currency:"aed"},{lines:{...invoice.lines,has_more:true}}])expect(()=>paidInvoiceWindow({...invoice,...patch},"sub_fixture","cus_fixture","price_fixture")).toThrow();});
  it("extracts references without treating metadata as authorization",()=>{expect(eventMembershipReference({data:{object:{object:"subscription",id:"sub_fixture",metadata:{incomenow_reservation_id:"local"}}}} as unknown as Stripe.Event)).toEqual({provider_subscription_id:"sub_fixture",id:"local"});});
});
