import { createClient } from "@/lib/supabase/server";

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
    <>
      <div className="page-head">
        <div>
          <h1>Reports</h1>
          <p>Aggregate views across members, points, and redemptions.</p>
        </div>
      </div>

      <div className="cols-eq">
        <div className="panel">
          <h2>Members by Category</h2>
          {categoryCounts.size === 0 ? (
            <p className="muted small">No members yet.</p>
          ) : (
            <div className="md-list">
              {Array.from(categoryCounts.entries()).map(([name, count]) => (
                <div key={name} className="md-row">
                  <span>{name}</span>
                  <span className="r">{count}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="panel">
          <h2>Points Earned vs Redeemed</h2>
          <div className="kpis" style={{ gridTemplateColumns: "repeat(2,minmax(0,1fr))" }}>
            <div className="kpi blue">
              <span className="v">{totalPointsIssued.toLocaleString()}</span>
              <span className="k">Total Earned</span>
            </div>
            <div className="kpi orange">
              <span className="v">{totalPointsRedeemed.toLocaleString()}</span>
              <span className="k">Total Redeemed</span>
            </div>
          </div>
        </div>

        <div className="panel">
          <h2>Monthly New-Member Registrations</h2>
          {sortedMonths.length === 0 ? (
            <p className="muted small">No members yet.</p>
          ) : (
            <div className="md-list">
              {sortedMonths.map(([month, count]) => (
                <div key={month} className="md-row">
                  <span>{month}</span>
                  <span className="r">{count}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="panel">
          <h2>Top 10 Redeemers</h2>
          {topRedeemers.length === 0 ? (
            <p className="muted small">No redemptions yet.</p>
          ) : (
            <div className="md-list">
              {topRedeemers.map((r, i) => (
                <div key={i} className="md-row">
                  <span>{r.name}</span>
                  <span className="r">{r.total.toLocaleString()} pts</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
