"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { writeAuditLog } from "@/lib/audit";

export interface CategoryFormInput {
  name: string;
  min_annual_spend: number;
  max_annual_spend: number | null;
  point_multiplier: number;
  benefits: string;
}

export async function updateCategory(id: string, input: CategoryFormInput) {
  const supabase = await createClient();

  const { data: before } = await supabase.from("membership_categories").select("*").eq("id", id).single();

  const { data, error } = await supabase
    .from("membership_categories")
    .update({
      name: input.name,
      min_annual_spend: input.min_annual_spend,
      max_annual_spend: input.max_annual_spend,
      point_multiplier: input.point_multiplier,
      benefits: input.benefits || null,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);

  await writeAuditLog(supabase, {
    action: "EDIT_CATEGORY",
    target_table: "membership_categories",
    target_id: id,
    before_state: before,
    after_state: data,
  });

  revalidatePath("/categories");
  revalidatePath("/members");
  revalidatePath("/");
  return data;
}
