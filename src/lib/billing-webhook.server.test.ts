import type Stripe from "stripe";
import { beforeEach,describe,expect,it,vi } from "vitest";
import { processMembershipEvent } from "./billing-webhook.server";
import type { billingCommand,BillingSubscription } from "./billing-store.server";
const {expectedMode}=vi.hoisted(()=>({expectedMode:{live:false}}));
vi.mock("./billing-config",()=>({readBillingConfig:()=>({priceId:"price_fixture",livemode:expectedMode.live})}));
const row={id:"00000000-0000-0000-0000-000000000001",user_id:"user_fixture",provider_checkout_session_id:"cs_test_fixture",provider_customer_id:"cus_fixture",provider_price_id:"price_fixture",provider_subscription_id:"sub_fixture"} as BillingSubscription;
const event={id:"evt_fixture",type:"customer.subscription.updated",created:1,livemode:false,data:{object:{object:"subscription",id:"sub_fixture",metadata:{incomenow_reservation_id:row.id}}}} as unknown as Stripe.Event;
const session={id:"cs_test_fixture",livemode:false,mode:"subscription",status:"complete",customer:"cus_fixture",subscription:"sub_fixture",client_reference_id:row.id,metadata:{incomenow_reservation_id:row.id}};
const subscription={id:"sub_fixture",livemode:false,customer:"cus_fixture",metadata:{incomenow_reservation_id:row.id},status:"past_due",cancel_at_period_end:false,latest_invoice:null,items:{has_more:false,data:[{price:{id:"price_fixture",livemode:false},quantity:1}]}};
const retrieveSession=vi.fn(),retrieveSubscription=vi.fn(),command=vi.fn();
const stripe={checkout:{sessions:{retrieve:retrieveSession}},subscriptions:{retrieve:retrieveSubscription}} as unknown as Stripe;
beforeEach(()=>{expectedMode.live=false;command.mockReset();retrieveSession.mockReset();retrieveSubscription.mockReset();command.mockImplementation(async(op:string)=>op==="lookup"?row:op==="lease"?{token:"token"}:{processed:true});retrieveSession.mockResolvedValue(session);retrieveSubscription.mockResolvedValue(subscription);});
describe("webhook current-state reconciliation",()=>{
  it("accepts matching LIVE objects and rejects every TEST object in LIVE",async()=>{
    expectedMode.live=true;const liveEvent={...event,livemode:true};
    await expect(processMembershipEvent(event,stripe,command as unknown as typeof billingCommand)).rejects.toThrow("mode mismatch");
    await expect(processMembershipEvent(liveEvent,stripe,command as unknown as typeof billingCommand)).rejects.toThrow("binding mismatch");
    retrieveSession.mockResolvedValue({...session,livemode:true});await expect(processMembershipEvent(liveEvent,stripe,command as unknown as typeof billingCommand)).rejects.toThrow("binding mismatch");
    retrieveSubscription.mockResolvedValue({...subscription,livemode:true});await expect(processMembershipEvent(liveEvent,stripe,command as unknown as typeof billingCommand)).rejects.toThrow("binding mismatch");
    expect(command).not.toHaveBeenCalledWith("sync",expect.anything());
    retrieveSubscription.mockResolvedValue({...subscription,livemode:true,items:{has_more:false,data:[{price:{id:"price_fixture",livemode:true},quantity:1}]}});
    await processMembershipEvent(liveEvent,stripe,command as unknown as typeof billingCommand);expect(command).toHaveBeenCalledWith("sync",expect.objectContaining({livemode:true}));
  });
  it("rejects live events, sessions and subscriptions in TEST before projection",async()=>{
    await expect(processMembershipEvent({...event,livemode:true},stripe,command as unknown as typeof billingCommand)).rejects.toThrow("mode mismatch");
    retrieveSession.mockResolvedValue({...session,livemode:true});await expect(processMembershipEvent(event,stripe,command as unknown as typeof billingCommand)).rejects.toThrow("binding mismatch");
    retrieveSession.mockResolvedValue(session);retrieveSubscription.mockResolvedValue({...subscription,livemode:true});await expect(processMembershipEvent(event,stripe,command as unknown as typeof billingCommand)).rejects.toThrow("binding mismatch");
    expect(command).not.toHaveBeenCalledWith("sync",expect.anything());
  });
  it("fetches current subscription under a lease and never extends an unpaid period",async()=>{
    await processMembershipEvent(event,stripe,command as unknown as typeof billingCommand);
    expect(command).toHaveBeenCalledWith("sync",expect.objectContaining({paid_end:null,provider_status:"past_due",token:"token"}));
    expect(command.mock.calls.map(call=>call[0])).toEqual(["lookup","lease","sync"]);
  });
  it("does not fetch Stripe or project replayed events",async()=>{command.mockImplementation(async(op:string)=>op==="lookup"?row:{duplicate:true});expect(await processMembershipEvent(event,stripe,command as unknown as typeof billingCommand)).toEqual({duplicate:true});expect(retrieveSession).not.toHaveBeenCalled();});
  it("recognizes explicit portal cancellation when the period-end boolean is false",async()=>{
    retrieveSubscription.mockResolvedValue({...subscription,cancel_at:1791377595,cancel_at_period_end:false});
    await processMembershipEvent(event,stripe,command as unknown as typeof billingCommand);
    expect(command).toHaveBeenCalledWith("sync",expect.objectContaining({cancel_at_period_end:true}));
  });
  it("rejects metadata pointing to another customer's checkout",async()=>{retrieveSession.mockResolvedValue({...session,customer:"cus_other"});await expect(processMembershipEvent(event,stripe,command as unknown as typeof billingCommand)).rejects.toThrow("binding mismatch");expect(command).not.toHaveBeenCalledWith("sync",expect.anything());expect(command).toHaveBeenCalledWith("unlock",{id:row.id,token:"token"});});
  it("retries unknown IncomeNow subscriptions but ignores unrelated products",async()=>{command.mockResolvedValue(null);await expect(processMembershipEvent(event,stripe,command as unknown as typeof billingCommand)).rejects.toThrow("Unknown");const unrelated={...event,data:{object:{...event.data.object,metadata:{}}}} as Stripe.Event;expect(await processMembershipEvent(unrelated,stripe,command as unknown as typeof billingCommand)).toEqual({ignored:true});});
  it("unlocks on API timeout and leaves the durable reservation intact",async()=>{retrieveSubscription.mockRejectedValue(new Error("timeout"));await expect(processMembershipEvent(event,stripe,command as unknown as typeof billingCommand)).rejects.toThrow("timeout");expect(command.mock.calls.map(call=>call[0])).toEqual(["lookup","lease","unlock"]);});
});
