import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { categoryColor } from "@/lib/styles";
import { MemberWithCategory } from "@/lib/types";
import { getT } from "@/lib/i18n/server";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createClient();
  const t = await getT();

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
    { label: t("dashboard.totalMembers"), value: totalMembers ?? 0, tone: "blue" },
    { label: t("dashboard.activeMembers"), value: activeMembers ?? 0, tone: "teal" },
    { label: t("dashboard.totalPointsIssued"), value: totalPointsIssued.toLocaleString(), tone: "orange" },
    { label: t("dashboard.totalPointsRedeemed"), value: totalPointsRedeemed.toLocaleString(), tone: "teal" },
  ];

  return (
    <>
      <div className="page-head">
        <div>
          <h1>{t("dashboard.title")}</h1>
          <p>{t("dashboard.subtitle")}</p>
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
          <h2>{t("dashboard.topMembers")}</h2>
          <Link href="/members" className="small">
            {t("dashboard.viewAll")}
          </Link>
        </div>
        {(topMembers ?? []).length === 0 ? (
          <p className="empty">{t("dashboard.noMembers")}</p>
        ) : (
          <div className="tbl-wrap">
            <table>
              <thead>
                <tr>
                  <th>{t("dashboard.colMemberId")}</th>
                  <th>{t("dashboard.colName")}</th>
                  <th>{t("dashboard.colCategory")}</th>
                  <th className="r">{t("dashboard.colAnnualSpend")}</th>
                  <th className="r">{t("dashboard.colPoints")}</th>
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
