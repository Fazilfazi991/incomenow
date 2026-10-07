import { beforeEach,describe,expect,it,vi } from "vitest";
import { createMembershipCheckout } from "./billing-checkout.server";
const {command,createSession,retrieveSession,createCustomer}=vi.hoisted(()=>({command:vi.fn(),createSession:vi.fn(),retrieveSession:vi.fn(),createCustomer:vi.fn()}));
vi.mock("./billing-store.server",()=>({billingCommand:command}));
vi.mock("./stripe.server",()=>({getStripe:()=>({customers:{create:createCustomer},checkout:{sessions:{create:createSession,retrieve:retrieveSession}}}),verifyStripeOffer:async()=>({origin:"http://localhost:3210",priceId:"price_fixture",livemode:false})}));
const row={id:"reservation",user_id:"user_fixture",checkout_origin:"http://localhost:3210",checkout_expires_at:"2026-10-07T12:00:00Z",provider_checkout_session_id:null};
const session={id:"cs_test_fixture",livemode:false,status:"open",url:"https://checkout.stripe.com/test",customer:"cus_fixture",client_reference_id:row.id};
beforeEach(()=>{vi.clearAllMocks();command.mockImplementation(async(op:string)=>op==="reserve"?row:op==="account"?{customer_id:"cus_fixture"}:true);createSession.mockResolvedValue(session);retrieveSession.mockResolvedValue(session);});
describe("membership checkout orchestration",()=>{
  it("uses the server-owned price and persisted idempotency key with an atomic reservation",async()=>{
    expect(await createMembershipCheckout({id:"user_fixture"})).toBe(session.url);
    expect(createSession).toHaveBeenCalledWith(expect.objectContaining({mode:"subscription",customer:"cus_fixture",line_items:[{price:"price_fixture",quantity:1}],client_reference_id:"reservation",success_url:"http://localhost:3210/membership/return"}),{idempotencyKey:"incomenow-checkout-reservation"});
    expect(command.mock.calls.map(call=>call[0])).toEqual(["reserve","account","customer","start_checkout","bind_checkout"]);expect(createCustomer).not.toHaveBeenCalled();
  });
  it("reuses an existing open Checkout instead of creating another",async()=>{command.mockImplementation(async(op:string)=>op==="reserve"?{...row,provider_checkout_session_id:session.id}:op==="account"?{customer_id:"cus_fixture"}:true);await createMembershipCheckout({id:"user_fixture"});expect(createSession).not.toHaveBeenCalled();expect(retrieveSession).toHaveBeenCalledWith(session.id);});
  it("never creates Stripe Checkout after a capacity or duplicate-member rejection",async()=>{command.mockRejectedValue(new Error("capacity full"));await expect(createMembershipCheckout({id:"user_fixture"})).rejects.toThrow();expect(createSession).not.toHaveBeenCalled();});
  it("preserves unresolved holds on a Stripe timeout",async()=>{createSession.mockRejectedValue(new Error("timeout"));await expect(createMembershipCheckout({id:"user_fixture"})).rejects.toThrow("timeout");expect(command.mock.calls.some(call=>/release|activate|sync/.test(call[0]))).toBe(false);});
});
