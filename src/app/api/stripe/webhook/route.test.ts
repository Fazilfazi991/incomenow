import Stripe from "stripe";
import { beforeEach,describe,expect,it,vi } from "vitest";
import { POST } from "./route";
const {processEvent}=vi.hoisted(()=>({processEvent:vi.fn()}));
vi.mock("@/lib/stripe.server",()=>({getStripe:()=>new Stripe("sk_test_fixture")}));
vi.mock("@/lib/billing-config",()=>({readBillingConfig:()=>({webhookSecret:"whsec_fixture",livemode:false})}));
vi.mock("@/lib/billing-webhook.server",()=>({processMembershipEvent:processEvent}));
const payload=JSON.stringify({id:"evt_fixture",object:"event",livemode:false,type:"checkout.session.completed",created:1,data:{object:{id:"cs_test_fixture"}}});
function request(body=payload,secret="whsec_fixture"){return new Request("http://localhost/api/stripe/webhook",{method:"POST",body,headers:{"stripe-signature":Stripe.webhooks.generateTestHeaderString({payload:body,secret})}});}
beforeEach(()=>{processEvent.mockReset();processEvent.mockResolvedValue({processed:true});});
describe("webhook signature boundary",()=>{
  it("verifies raw bytes with the real Stripe signature verifier",async()=>{expect((await POST(request())).status).toBe(200);expect(processEvent).toHaveBeenCalledOnce();});
  it("rejects missing, forged and modified signatures before processing",async()=>{
    expect((await POST(new Request("http://localhost/webhook",{method:"POST",body:payload}))).status).toBe(400);
    expect((await POST(request(payload,"whsec_wrong"))).status).toBe(400);
    const signed=request();const forged=new Request(signed.url,{method:"POST",body:payload+" ",headers:signed.headers});
    expect((await POST(forged)).status).toBe(400);expect(processEvent).not.toHaveBeenCalled();
  });
  it("rejects signed live events",async()=>{expect((await POST(request(payload.replace('"livemode":false','"livemode":true')))).status).toBe(400);expect(processEvent).not.toHaveBeenCalled();});
  it("returns retryable failure rather than acknowledging an uncommitted projection",async()=>{processEvent.mockRejectedValue(new Error("temporary database failure"));vi.spyOn(console,"error").mockImplementation(()=>{});expect((await POST(request())).status).toBe(503);vi.restoreAllMocks();});
});
