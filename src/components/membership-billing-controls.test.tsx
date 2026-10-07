import { cleanup,render,screen } from "@testing-library/react";
import { afterEach,describe,it,expect,vi } from "vitest";
import { MembershipBillingControls } from "./membership-billing-controls";
import type { BillingCapacity } from "@/lib/billing-store.server";
vi.mock("@/app/membership/billing-actions",()=>({joinMembership:vi.fn(),joinMembershipWaitlist:vi.fn(),manageMembershipBilling:vi.fn()}));
const capacity:BillingCapacity={active:599,reserved:0,capacity:600,allocatable:1,checkout_enabled:true,waitlist_enabled:true,cancelling:0,issues:0,waitlist:0,paid_monthly:599};
afterEach(cleanup);
describe("account-aware membership controls",()=>{
  it.each([["registered","Join membership"],["starter","Upgrade to full membership"]] as const)("offers separate full checkout for %s",(state,label)=>{render(<MembershipBillingControls state={state} capacity={capacity} checkoutAvailable waitlistAvailable/>);expect(screen.getByRole("button",{name:label})).toBeInTheDocument();});
  it("offers real waitlist at reserved capacity",()=>{render(<MembershipBillingControls state="registered" capacity={{...capacity,reserved:1,allocatable:0}} checkoutAvailable waitlistAvailable/>);expect(screen.getByRole("button",{name:"Join Waitlist"})).toBeInTheDocument();expect(screen.queryByRole("button",{name:"Join membership"})).not.toBeInTheDocument();});
  it("lets an invited account use its reserved slot",()=>{render(<MembershipBillingControls state="registered" capacity={{...capacity,reserved:1,allocatable:0}} checkoutAvailable waitlistAvailable hasInvitation/>);expect(screen.getByRole("button",{name:"Join membership"})).toBeInTheDocument();expect(screen.queryByRole("button",{name:"Join Waitlist"})).not.toBeInTheDocument();});
  it("never asks full members to purchase again",()=>{render(<MembershipBillingControls state="full" capacity={capacity} checkoutAvailable waitlistAvailable canManageBilling/>);expect(screen.getByRole("link",{name:"Open your library"})).toBeInTheDocument();expect(screen.getByRole("button",{name:"Manage Billing"})).toBeInTheDocument();expect(screen.queryByRole("button",{name:"Join membership"})).not.toBeInTheDocument();});
  it.each(["signed-out","unavailable"] as const)("does not mutate billing for %s",state=>{render(<MembershipBillingControls state={state} capacity={capacity} checkoutAvailable waitlistAvailable/>);expect(screen.queryByRole("button")).not.toBeInTheDocument();});
});
