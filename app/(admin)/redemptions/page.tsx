import { createClient } from "@/lib/supabase/server";
import { RedemptionWithMemberAndReward } from "@/lib/types";
import RedemptionsClient from "./RedemptionsClient";

export const dynamic = "force-dynamic";

export default async function RedemptionsPage() {
  const supabase = await createClient();

  const [{ data: redemptions }, { data: members }, { data: rewards }] = await Promise.all([
    supabase
      .from("redemptions")
      .select("*, members(id, full_name, member_id), rewards(*)")
      .order("redemption_date", { ascending: false }),
    supabase
      .from("members")
      .select("id, member_id, full_name, current_points_balance")
      .order("full_name"),
    supabase.from("rewards").select("*").eq("is_active", true).order("points_required"),
  ]);

  return (
    <RedemptionsClient
      initialRedemptions={(redemptions as RedemptionWithMemberAndReward[]) ?? []}
      members={members ?? []}
      rewards={rewards ?? []}
    />
  );
}
