import { createClient } from "@/lib/supabase/server";
import { MembershipCategory } from "@/lib/types";
import { getCurrentUser } from "@/lib/auth";
import CategoriesClient from "./CategoriesClient";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const supabase = await createClient();
  const [{ data: categories }, user] = await Promise.all([
    supabase.from("membership_categories").select("*").order("min_annual_spend"),
    getCurrentUser(),
  ]);

  return (
    <CategoriesClient
      initialCategories={(categories as MembershipCategory[]) ?? []}
      isAdmin={user?.role === "admin"}
    />
  );
}
