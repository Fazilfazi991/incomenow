"use server";
import { notFound,redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { billingCommand } from "@/lib/billing-store.server";

export async function inviteNextMembershipAccount(){
  const client=await createClient();
  const {data}=await client.auth.getUser();
  if(!data.user) redirect("/login?next=%2Fadmin%2Fmembership");
  const admin=await client.rpc("is_acquisition_admin");
  if(admin.error||!admin.data) notFound();
  let notice="invite-unavailable";
  try { const result=await billingCommand<{invited:boolean}>("invite_next");notice=result.invited?"invited":"queue-empty"; }catch{/* Capacity and database gate remain authoritative. */}
  redirect(`/admin/membership?notice=${notice}`);
}
