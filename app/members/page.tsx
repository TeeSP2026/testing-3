import { createClient } from "@/lib/supabase/server";
import { MemberWithCategory, MembershipCategory } from "@/lib/types";
import MembersClient from "./MembersClient";

export const dynamic = "force-dynamic";

export default async function MembersPage() {
  const supabase = await createClient();

  const [{ data: members, error }, { data: categories }] = await Promise.all([
    supabase
      .from("members")
      .select("*, membership_categories(*)")
      .order("created_at", { ascending: false }),
    supabase.from("membership_categories").select("*").order("min_annual_spend"),
  ]);

  return (
    <MembersClient
      initialMembers={(members as MemberWithCategory[]) ?? []}
      categories={(categories as MembershipCategory[]) ?? []}
      loadError={error?.message ?? null}
    />
  );
}
