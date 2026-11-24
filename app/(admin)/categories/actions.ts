"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { writeAuditLog } from "@/lib/audit";
import { requireAdmin } from "@/lib/auth";

export interface CategoryFormInput {
  name: string;
  min_annual_spend: number;
  max_annual_spend: number | null;
  point_multiplier: number;
  benefits: string;
}

export async function createCategory(input: CategoryFormInput) {
  await requireAdmin();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("membership_categories")
    .insert({
      name: input.name,
      min_annual_spend: input.min_annual_spend,
      max_annual_spend: input.max_annual_spend,
      point_multiplier: input.point_multiplier,
      benefits: input.benefits || null,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  await writeAuditLog(supabase, {
    action: "CREATE_CATEGORY",
    target_table: "membership_categories",
    target_id: data.id,
    after_state: data,
  });

  revalidatePath("/categories");
  revalidatePath("/members");
  revalidatePath("/");
  return data;
}

export async function deleteCategory(id: string) {
  await requireAdmin();
  const supabase = await createClient();

  const { count } = await supabase
    .from("members")
    .select("id", { count: "exact", head: true })
    .eq("category_id", id);
  if ((count ?? 0) > 0) {
    throw new Error(`Cannot delete: ${count} member(s) are still assigned to this category.`);
  }

  const { data: before } = await supabase.from("membership_categories").select("*").eq("id", id).single();

  const { error } = await supabase.from("membership_categories").delete().eq("id", id);
  if (error) throw new Error(error.message);

  await writeAuditLog(supabase, {
    action: "DELETE_CATEGORY",
    target_table: "membership_categories",
    target_id: id,
    before_state: before,
  });

  revalidatePath("/categories");
  revalidatePath("/members");
  revalidatePath("/");
}

export async function updateCategory(id: string, input: CategoryFormInput) {
  await requireAdmin();
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
