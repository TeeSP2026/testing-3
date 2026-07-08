import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { writeAuditLog } from "@/lib/audit";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const memberId = body?.member_id as string | undefined;
  const purchaseAmount = Number(body?.purchase_amount);
  const remarks = (body?.remarks as string | undefined) ?? null;

  if (!memberId || !Number.isFinite(purchaseAmount) || purchaseAmount <= 0) {
    return NextResponse.json({ error: "member_id and a positive purchase_amount are required." }, { status: 400 });
  }

  const supabase = await createClient();

  const { data: member, error: memberError } = await supabase
    .from("members")
    .select("*, membership_categories(*)")
    .eq("id", memberId)
    .single();

  if (memberError || !member) {
    return NextResponse.json({ error: "Member not found." }, { status: 404 });
  }

  const multiplier = member.membership_categories?.point_multiplier ?? 1;
  const pointsEarned = Math.floor(purchaseAmount) * multiplier;
  const newAnnualSpend = Number(member.annual_spend) + purchaseAmount;
  const newBalance = Number(member.current_points_balance) + pointsEarned;

  const today = new Date();
  const yyyymmdd = today.toISOString().slice(0, 10).replace(/-/g, "");
  const { count } = await supabase
    .from("point_transactions")
    .select("id", { count: "exact", head: true })
    .like("transaction_no", `TXN-${yyyymmdd}-%`);
  const transactionNo = `TXN-${yyyymmdd}-${String((count ?? 0) + 1).padStart(3, "0")}`;

  const { error: txnError } = await supabase.from("point_transactions").insert({
    transaction_no: transactionNo,
    member_id: memberId,
    purchase_amount: purchaseAmount,
    points_earned: pointsEarned,
    multiplier_applied: multiplier,
    category_at_time: member.membership_categories?.name ?? null,
    remarks,
  });
  if (txnError) {
    return NextResponse.json({ error: txnError.message }, { status: 500 });
  }

  const { data: categories } = await supabase
    .from("membership_categories")
    .select("*")
    .order("min_annual_spend", { ascending: false });

  const matchedCategory = categories?.find(
    (c) => newAnnualSpend >= c.min_annual_spend && (c.max_annual_spend === null || newAnnualSpend <= c.max_annual_spend),
  );
  const newCategoryId = matchedCategory?.id ?? member.category_id;

  const { data: updatedMember, error: updateError } = await supabase
    .from("members")
    .update({
      current_points_balance: newBalance,
      annual_spend: newAnnualSpend,
      category_id: newCategoryId,
    })
    .eq("id", memberId)
    .select("*, membership_categories(*)")
    .single();

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  await writeAuditLog(supabase, {
    action: "AWARD_POINTS",
    target_table: "members",
    target_id: memberId,
    before_state: { current_points_balance: member.current_points_balance, annual_spend: member.annual_spend, category_id: member.category_id },
    after_state: { current_points_balance: newBalance, annual_spend: newAnnualSpend, category_id: newCategoryId },
  });

  return NextResponse.json({
    transaction_no: transactionNo,
    points_earned: pointsEarned,
    member: updatedMember,
    category_upgraded: newCategoryId !== member.category_id,
  });
}
