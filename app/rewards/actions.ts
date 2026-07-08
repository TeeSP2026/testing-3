"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { writeAuditLog } from "@/lib/audit";

export interface RewardFormInput {
  name: string;
  description: string;
  points_required: number;
  minimum_redemption_points: number;
  is_active: boolean;
}

export async function createReward(input: RewardFormInput) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("rewards")
    .insert({
      name: input.name,
      description: input.description || null,
      points_required: input.points_required,
      minimum_redemption_points: input.minimum_redemption_points,
      is_active: input.is_active,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  await writeAuditLog(supabase, {
    action: "CREATE_REWARD",
    target_table: "rewards",
    target_id: data.id,
    after_state: data,
  });

  revalidatePath("/rewards");
  return data;
}

export async function updateReward(id: string, input: RewardFormInput) {
  const supabase = await createClient();

  const { data: before } = await supabase.from("rewards").select("*").eq("id", id).single();

  const { data, error } = await supabase
    .from("rewards")
    .update({
      name: input.name,
      description: input.description || null,
      points_required: input.points_required,
      minimum_redemption_points: input.minimum_redemption_points,
      is_active: input.is_active,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);

  await writeAuditLog(supabase, {
    action: "EDIT_REWARD",
    target_table: "rewards",
    target_id: id,
    before_state: before,
    after_state: data,
  });

  revalidatePath("/rewards");
  return data;
}
