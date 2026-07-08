import { createClient } from "@/lib/supabase/server";
import { card } from "@/lib/styles";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const supabase = await createClient();

  const [{ data: members }, { data: transactions }, { data: redemptions }] = await Promise.all([
    supabase.from("members").select("id, full_name, registration_date, membership_categories(name)"),
    supabase.from("point_transactions").select("points_earned"),
    supabase.from("redemptions").select("points_redeemed, member_id, members(full_name)"),
  ]);

  const membersList = members ?? [];
  const categoryCounts = new Map<string, number>();
  for (const m of membersList) {
    const catName = (m.membership_categories as unknown as { name: string } | null)?.name ?? "Unassigned";
    categoryCounts.set(catName, (categoryCounts.get(catName) ?? 0) + 1);
  }

  const totalPointsIssued = (transactions ?? []).reduce((sum, t) => sum + Number(t.points_earned), 0);
  const totalPointsRedeemed = (redemptions ?? []).reduce((sum, r) => sum + Number(r.points_redeemed), 0);

  const monthCounts = new Map<string, number>();
  for (const m of membersList) {
    const month = m.registration_date?.slice(0, 7) ?? "Unknown";
    monthCounts.set(month, (monthCounts.get(month) ?? 0) + 1);
  }
  const sortedMonths = Array.from(monthCounts.entries()).sort((a, b) => a[0].localeCompare(b[0]));

  const redeemerTotals = new Map<string, { name: string; total: number }>();
  for (const r of redemptions ?? []) {
    const name = (r.members as unknown as { full_name: string } | null)?.full_name ?? "Unknown";
    const key = r.member_id;
    const existing = redeemerTotals.get(key) ?? { name, total: 0 };
    existing.total += Number(r.points_redeemed);
    redeemerTotals.set(key, existing);
  }
  const topRedeemers = Array.from(redeemerTotals.values())
    .sort((a, b) => b.total - a.total)
    .slice(0, 10);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Reports</h1>
        <p className="text-sm text-neutral-500">Aggregate views across members, points, and redemptions.</p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className={card + " p-6"}>
          <h2 className="font-semibold mb-4">Members by Category</h2>
          {categoryCounts.size === 0 ? (
            <p className="text-sm text-neutral-500">No members yet.</p>
          ) : (
            <ul className="space-y-2">
              {Array.from(categoryCounts.entries()).map(([name, count]) => (
                <li key={name} className="flex items-center justify-between text-sm">
                  <span>{name}</span>
                  <span className="font-medium">{count}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className={card + " p-6"}>
          <h2 className="font-semibold mb-4">Points Earned vs Redeemed</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-2xl font-bold">{totalPointsIssued.toLocaleString()}</p>
              <p className="text-sm text-neutral-500">Total Earned</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{totalPointsRedeemed.toLocaleString()}</p>
              <p className="text-sm text-neutral-500">Total Redeemed</p>
            </div>
          </div>
        </div>

        <div className={card + " p-6"}>
          <h2 className="font-semibold mb-4">Monthly New-Member Registrations</h2>
          {sortedMonths.length === 0 ? (
            <p className="text-sm text-neutral-500">No members yet.</p>
          ) : (
            <ul className="space-y-2">
              {sortedMonths.map(([month, count]) => (
                <li key={month} className="flex items-center justify-between text-sm">
                  <span>{month}</span>
                  <span className="font-medium">{count}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className={card + " p-6"}>
          <h2 className="font-semibold mb-4">Top 10 Redeemers</h2>
          {topRedeemers.length === 0 ? (
            <p className="text-sm text-neutral-500">No redemptions yet.</p>
          ) : (
            <ul className="space-y-2">
              {topRedeemers.map((r, i) => (
                <li key={i} className="flex items-center justify-between text-sm">
                  <span>{r.name}</span>
                  <span className="font-medium">{r.total.toLocaleString()} pts</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
