import { createClient } from "@/lib/supabase/server";
import { MembershipCategory } from "@/lib/types";
import CategoriesClient from "./CategoriesClient";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const supabase = await createClient();
  const { data: categories } = await supabase
    .from("membership_categories")
    .select("*")
    .order("min_annual_spend");

  return <CategoriesClient initialCategories={(categories as MembershipCategory[]) ?? []} />;
}
