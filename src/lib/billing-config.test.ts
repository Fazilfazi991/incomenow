import { describe,it,expect } from "vitest";
import { readBillingConfig,matchesMembershipPrice } from "./billing-config";

const env={STRIPE_BILLING_MODE:"test",STRIPE_SECRET_KEY:"sk_test_fixture",STRIPE_WEBHOOK_SECRET:"whsec_fixture",
  STRIPE_INCOMENOW_MEMBERSHIP_PRODUCT_ID:"prod_fixture",STRIPE_INCOMENOW_MEMBERSHIP_PRICE_ID:"price_fixture",
  NEXT_PUBLIC_SUPABASE_URL:"http://127.0.0.1:54321",SUPABASE_SERVICE_ROLE_KEY:"test-only",APP_ORIGIN:"http://localhost:3000"};
const price={active:true,livemode:false,currency:"usd",unit_amount:1499,type:"recurring",recurring:{interval:"month",interval_count:1,usage_type:"licensed"},product:"prod_fixture"};
describe("test membership configuration",()=>{
  it("loads server-owned test identifiers and exact monthly terms",()=>{expect(readBillingConfig(env).priceId).toBe("price_fixture");expect(matchesMembershipPrice(price,{productId:"prod_fixture",livemode:false})).toBe(true);});
  it("accepts live credentials only with live mode and HTTPS",()=>{const config=readBillingConfig({...env,STRIPE_BILLING_MODE:"live",STRIPE_SECRET_KEY:"sk_live_fixture",APP_ORIGIN:"https://www.millionmonk.com",VERCEL_ENV:"production"});expect(config.livemode).toBe(true);expect(matchesMembershipPrice({...price,livemode:true},config)).toBe(true);expect(matchesMembershipPrice(price,config)).toBe(false);});
  it("accepts the existing modern server Supabase key",()=>{expect(readBillingConfig({...env,SUPABASE_SERVICE_ROLE_KEY:"",SUPABASE_SECRET_KEY:"sb_secret_fixture"}).mode).toBe("test");});
  it.each([{STRIPE_SECRET_KEY:"sk_live_fixture"},{STRIPE_BILLING_MODE:"live"},{STRIPE_WEBHOOK_SECRET:""},{SUPABASE_SERVICE_ROLE_KEY:""},
    {APP_ORIGIN:"https://example.com/redirect"},{APP_ORIGIN:"https://bad:password@example.com"},{APP_ORIGIN:"http://example.com"},{VERCEL_ENV:"production"}])("fails closed for unsafe config %o",patch=>{expect(()=>readBillingConfig({...env,...patch})).toThrow();});
  it.each([{unit_amount:2900},{unit_amount:100},{livemode:true},{currency:"aed"},{active:false},{product:"prod_other"},
    {recurring:{interval:"year",interval_count:1,usage_type:"licensed"}},{recurring:{interval:"month",interval_count:2,usage_type:"licensed"}}])("rejects wrong price %o",patch=>{expect(matchesMembershipPrice({...price,...patch},{productId:"prod_fixture",livemode:false})).toBe(false);});
});
