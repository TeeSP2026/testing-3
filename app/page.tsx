import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { card, categoryColor } from "@/lib/styles";
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
    { label: "Total Members", value: totalMembers ?? 0 },
    { label: "Active Members", value: activeMembers ?? 0 },
    { label: "Total Points Issued", value: totalPointsIssued.toLocaleString() },
    { label: "Total Points Redeemed", value: totalPointsRedeemed.toLocaleString() },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-neutral-500">Loyalty membership overview.</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <div key={kpi.label} className={card + " p-5"}>
            <p className="text-2xl font-bold">{kpi.value}</p>
            <p className="text-sm text-neutral-500">{kpi.label}</p>
          </div>
        ))}
      </div>

      <div className={card}>
        <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between">
          <h2 className="font-semibold">Top 10 Members by Annual Spend</h2>
          <Link href="/members" className="text-sm text-neutral-500 hover:underline">
            View all members &rarr;
          </Link>
        </div>
        {(topMembers ?? []).length === 0 ? (
          <p className="p-8 text-center text-sm text-neutral-500">No members yet — add one.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 text-neutral-500 text-xs uppercase tracking-wide">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Member ID</th>
                <th className="text-left px-4 py-3 font-medium">Name</th>
                <th className="text-left px-4 py-3 font-medium">Category</th>
                <th className="text-left px-4 py-3 font-medium">Annual Spend</th>
                <th className="text-left px-4 py-3 font-medium">Points</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {(topMembers as MemberWithCategory[]).map((m) => (
                <tr key={m.id} className="hover:bg-neutral-50">
                  <td className="px-4 py-3 font-mono text-xs">{m.member_id}</td>
                  <td className="px-4 py-3">
                    <Link href={`/members/${m.id}`} className="font-medium hover:underline">
                      {m.full_name}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${categoryColor(m.membership_categories?.name)}`}>
                      {m.membership_categories?.name ?? "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3">RM{Number(m.annual_spend).toLocaleString()}</td>
                  <td className="px-4 py-3 font-medium">{Number(m.current_points_balance).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
