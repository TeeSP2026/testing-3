import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { toCsv } from "@/lib/csv";

const HEADERS = [
  "member_id", "full_name", "nickname", "mobile_number", "ic_number",
  "date_of_birth", "address", "state", "town_area", "referred_by",
  "category", "status", "current_points_balance", "annual_spend", "registration_date",
];

export async function GET() {
  const supabase = await createClient();
  const { data: members, error } = await supabase
    .from("members")
    .select("*, membership_categories(name)")
    .order("member_id", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const rows = (members ?? []).map((m) => [
    m.member_id,
    m.full_name,
    m.nickname,
    m.mobile_number,
    m.ic_number,
    m.date_of_birth,
    m.address,
    m.state,
    m.town_area,
    m.referred_by,
    (m.membership_categories as { name: string } | null)?.name ?? "",
    m.status,
    m.current_points_balance,
    m.annual_spend,
    m.registration_date,
  ]);

  const csv = toCsv(HEADERS, rows);

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="members-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
