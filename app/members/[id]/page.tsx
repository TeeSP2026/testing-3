import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MemberWithCategory, MembershipCategory, PointTransaction, Reward, RedemptionWithReward } from "@/lib/types";
import MemberDetailClient from "./MemberDetailClient";

export const dynamic = "force-dynamic";

export default async function MemberDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: member }, { data: categories }, { data: transactions }, { data: redemptions }, { data: rewards }] =
    await Promise.all([
      supabase.from("members").select("*, membership_categories(*)").eq("id", id).single(),
      supabase.from("membership_categories").select("*").order("min_annual_spend"),
      supabase
        .from("point_transactions")
        .select("*")
        .eq("member_id", id)
        .order("transaction_date", { ascending: false }),
      supabase
        .from("redemptions")
        .select("*, rewards(*)")
        .eq("member_id", id)
        .order("redemption_date", { ascending: false }),
      supabase.from("rewards").select("*").eq("is_active", true).order("points_required"),
    ]);

  if (!member) {
    notFound();
  }

  return (
    <MemberDetailClient
      member={member as MemberWithCategory}
      categories={(categories as MembershipCategory[]) ?? []}
      transactions={(transactions as PointTransaction[]) ?? []}
      redemptions={(redemptions as RedemptionWithReward[]) ?? []}
      activeRewards={(rewards as Reward[]) ?? []}
    />
  );
}
