import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { writeAuditLog } from "@/lib/audit";

export async function POST() {
  const supabase = await createClient();

  const [{ data: members }, { data: categories }] = await Promise.all([
    supabase.from("members").select("id, annual_spend, category_id"),
    supabase.from("membership_categories").select("*").order("min_annual_spend", { ascending: false }),
  ]);

  if (!members || !categories) {
    return NextResponse.json({ error: "Failed to load members or categories." }, { status: 500 });
  }

  let movedCount = 0;
  for (const member of members) {
    const spend = Number(member.annual_spend);
    const matched = categories.find(
      (c) => spend >= c.min_annual_spend && (c.max_annual_spend === null || spend <= c.max_annual_spend),
    );
    if (matched && matched.id !== member.category_id) {
      const { error } = await supabase
        .from("members")
        .update({ category_id: matched.id })
        .eq("id", member.id);
      if (!error) {
        movedCount += 1;
        await writeAuditLog(supabase, {
          action: "REASSIGN_CATEGORY",
          target_table: "members",
          target_id: member.id,
          before_state: { category_id: member.category_id },
          after_state: { category_id: matched.id },
        });
      }
    }
  }

  return NextResponse.json({ moved: movedCount });
}
