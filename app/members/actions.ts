"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { writeAuditLog } from "@/lib/audit";

export interface MemberFormInput {
  full_name: string;
  gender: string;
  date_of_birth: string;
  mobile_number: string;
  email_address: string;
  address: string;
  category_id: string;
}

export async function createMember(input: MemberFormInput) {
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("members")
    .select("member_id")
    .order("member_id", { ascending: false })
    .limit(1);
  const lastNum = existing?.[0]?.member_id
    ? parseInt(existing[0].member_id.replace("MBR-", ""), 10)
    : 0;
  const memberId = `MBR-${String(lastNum + 1).padStart(5, "0")}`;

  const { data, error } = await supabase
    .from("members")
    .insert({
      member_id: memberId,
      full_name: input.full_name,
      gender: input.gender || null,
      date_of_birth: input.date_of_birth || null,
      mobile_number: input.mobile_number || null,
      email_address: input.email_address || null,
      address: input.address || null,
      category_id: input.category_id || null,
      registration_date: new Date().toISOString().slice(0, 10),
      current_points_balance: 0,
      annual_spend: 0,
      status: "Active",
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  await writeAuditLog(supabase, {
    action: "CREATE_MEMBER",
    target_table: "members",
    target_id: data.id,
    after_state: data,
  });

  revalidatePath("/members");
  revalidatePath("/");
  return data;
}

export async function updateMember(id: string, input: MemberFormInput) {
  const supabase = await createClient();

  const { data: before } = await supabase.from("members").select("*").eq("id", id).single();

  const { data, error } = await supabase
    .from("members")
    .update({
      full_name: input.full_name,
      gender: input.gender || null,
      date_of_birth: input.date_of_birth || null,
      mobile_number: input.mobile_number || null,
      email_address: input.email_address || null,
      address: input.address || null,
      category_id: input.category_id || null,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);

  await writeAuditLog(supabase, {
    action: "EDIT_MEMBER",
    target_table: "members",
    target_id: id,
    before_state: before,
    after_state: data,
  });

  revalidatePath("/members");
  revalidatePath(`/members/${id}`);
  revalidatePath("/");
  return data;
}

export async function toggleMemberStatus(id: string, newStatus: "Active" | "Inactive") {
  const supabase = await createClient();

  const { data: before } = await supabase
    .from("members")
    .select("status")
    .eq("id", id)
    .single();

  const { data, error } = await supabase
    .from("members")
    .update({ status: newStatus })
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);

  await writeAuditLog(supabase, {
    action: "TOGGLE_MEMBER_STATUS",
    target_table: "members",
    target_id: id,
    before_state: before,
    after_state: { status: newStatus },
  });

  revalidatePath("/members");
  revalidatePath(`/members/${id}`);
  revalidatePath("/");
  return data;
}
