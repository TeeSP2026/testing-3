import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { categoryColor } from "@/lib/styles";
import { MemberWithCategory } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createClient();

  const [
    { count: totalMembers },
    { count: activeMembers },
    { data: transactions },
    { data: redemptions },
    { data: topMembers },
  ] = await Promise.all([
    supabase.from("members").select("id", { count: "exact", head: true }),
    supabase.from("members").select("id", { count: "exact", head: true }).eq("status", "Active"),
    supabase.from("point_transactions").select("points_earned"),
    supabase.from("redemptions").select("points_redeemed"),
    supabase
      .from("members")
      .select("*, membership_categories(*)")
      .order("annual_spend", { ascending: false })
      .limit(10),
  ]);

  const totalPointsIssued = (transactions ?? []).reduce((sum, t) => sum + Number(t.points_earned), 0);
  const totalPointsRedeemed = (redemptions ?? []).reduce((sum, r) => sum + Number(r.points_redeemed), 0);

  const kpis = [
    { label: "Total Members", value: totalMembers ?? 0, tone: "blue" },
    { label: "Active Members", value: activeMembers ?? 0, tone: "teal" },
    { label: "Total Points Issued", value: totalPointsIssued.toLocaleString(), tone: "orange" },
    { label: "Total Points Redeemed", value: totalPointsRedeemed.toLocaleString(), tone: "teal" },
  ];

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Dashboard</h1>
          <p>MA PLANTATION 永發肥料企業 — membership overview.</p>
        </div>
      </div>

      <div className="kpis">
        {kpis.map((kpi) => (
          <div key={kpi.label} className={`kpi ${kpi.tone}`}>
            <span className="v">{kpi.value}</span>
            <span className="k">{kpi.label}</span>
          </div>
        ))}
      </div>

      <div className="panel">
        <div className="panel-head">
          <h2>Top 10 Members by Annual Spend</h2>
          <Link href="/members" className="small">
            View all members &rarr;
          </Link>
        </div>
        {(topMembers ?? []).length === 0 ? (
          <p className="empty">No members yet — add one.</p>
        ) : (
          <div className="tbl-wrap">
            <table>
              <thead>
                <tr>
                  <th>Member ID</th>
                  <th>Name</th>
                  <th>Category</th>
                  <th className="r">Annual Spend</th>
                  <th className="r">Points</th>
                </tr>
              </thead>
              <tbody>
                {(topMembers as MemberWithCategory[]).map((m) => (
                  <tr key={m.id}>
                    <td className="nw">{m.member_id}</td>
                    <td>
                      <Link href={`/members/${m.id}`}>{m.full_name}</Link>
                    </td>
                    <td>
                      <span className="tier" style={{ ["--tc" as string]: categoryColor(m.membership_categories?.name) }}>
                        <i /> {m.membership_categories?.name ?? "—"}
                      </span>
                    </td>
                    <td className="r">RM{Number(m.annual_spend).toLocaleString()}</td>
                    <td className="r">{Number(m.current_points_balance).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
