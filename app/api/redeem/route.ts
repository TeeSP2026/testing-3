import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { writeAuditLog } from "@/lib/audit";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const memberId = body?.member_id as string | undefined;
  const rewardId = body?.reward_id as string | undefined;
  const processedBy = (body?.processed_by as string | undefined) ?? "Staff";

  if (!memberId || !rewardId) {
    return NextResponse.json({ error: "member_id and reward_id are required." }, { status: 400 });
  }

  const supabase = await createClient();

  const { data: member, error: memberError } = await supabase
    .from("members")
    .select("*")
    .eq("id", memberId)
    .single();
  if (memberError || !member) {
    return NextResponse.json({ error: "Member not found." }, { status: 404 });
  }

  const { data: reward, error: rewardError } = await supabase
    .from("rewards")
    .select("*")
    .eq("id", rewardId)
    .eq("is_active", true)
    .single();
  if (rewardError || !reward) {
    return NextResponse.json({ error: "Reward not found or inactive." }, { status: 404 });
  }

  if (reward.points_required < reward.minimum_redemption_points) {
    return NextResponse.json({ error: "This reward is below the minimum redemption threshold." }, { status: 400 });
  }

  if (Number(member.current_points_balance) < reward.points_required) {
    return NextResponse.json(
      { error: `Insufficient balance: needs ${reward.points_required} pts, has ${member.current_points_balance} pts.` },
      { status: 400 },
    );
  }

  const newBalance = Number(member.current_points_balance) - reward.points_required;

  const today = new Date();
  const yyyymmdd = today.toISOString().slice(0, 10).replace(/-/g, "");
  const { count } = await supabase
    .from("redemptions")
    .select("id", { count: "exact", head: true })
    .like("redemption_id", `RDM-${yyyymmdd}-%`);
  const redemptionId = `RDM-${yyyymmdd}-${String((count ?? 0) + 1).padStart(3, "0")}`;

  const { error: updateError } = await supabase
    .from("members")
    .update({ current_points_balance: newBalance })
    .eq("id", memberId);
  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  const { data: redemption, error: redemptionError } = await supabase
    .from("redemptions")
    .insert({
      redemption_id: redemptionId,
      member_id: memberId,
      reward_id: rewardId,
      points_redeemed: reward.points_required,
      points_balance_after: newBalance,
      status: "Approved",
      processed_by: processedBy,
    })
    .select()
    .single();
  if (redemptionError) {
    return NextResponse.json({ error: redemptionError.message }, { status: 500 });
  }

  await writeAuditLog(supabase, {
    action: "REDEEM",
    target_table: "members",
    target_id: memberId,
    before_state: { current_points_balance: member.current_points_balance },
    after_state: { current_points_balance: newBalance },
  });

  return NextResponse.json({ redemption, new_balance: newBalance });
}
