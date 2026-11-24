"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { RedemptionWithMemberAndReward, Reward } from "@/lib/types";
import { btnPrimary } from "@/lib/styles";
import { useT } from "@/lib/i18n/context";

type MemberOption = { id: string; member_id: string; full_name: string; current_points_balance: number };

export default function RedemptionsClient({
  initialRedemptions,
  members,
  rewards,
}: {
  initialRedemptions: RedemptionWithMemberAndReward[];
  members: MemberOption[];
  rewards: Reward[];
}) {
  const t = useT();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [showRedeem, setShowRedeem] = useState(false);

  const filtered = useMemo(() => {
    if (!query.trim()) return initialRedemptions;
    const q = query.trim().toLowerCase();
    return initialRedemptions.filter((r) =>
      [r.redemption_id, r.members?.full_name, r.members?.member_id, r.rewards?.name]
        .filter(Boolean)
        .some((f) => f!.toLowerCase().includes(q)),
    );
  }, [initialRedemptions, query]);

  const totalPoints = filtered.reduce((s, r) => s + Number(r.points_redeemed), 0);

  return (
    <>
      <div className="page-head">
        <div>
          <h1>{t("redemptions.title")}</h1>
          <p>{t("redemptions.subtitle")}</p>
        </div>
        <button className={btnPrimary} onClick={() => setShowRedeem(true)}>
          {t("redemptions.redeem")}
        </button>
      </div>

      <div className="kpis" style={{ gridTemplateColumns: "repeat(2,minmax(0,1fr))" }}>
        <div className="kpi blue">
          <span className="v">{filtered.length}</span>
          <span className="k">{t("redemptions.filteredCount")}</span>
        </div>
        <div className="kpi orange">
          <span className="v">{totalPoints.toLocaleString()}</span>
          <span className="k">{t("redemptions.pointsRedeemed")}</span>
        </div>
      </div>

      <input
        style={{ maxWidth: 360 }}
        placeholder={t("redemptions.searchPlaceholder")}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      <div className="panel">
        {filtered.length === 0 ? (
          <p className="empty">{t("redemptions.noRedemptions")}</p>
        ) : (
          <div className="tbl-wrap">
            <table>
              <thead>
                <tr>
                  <th>{t("redemptions.colRedemptionId")}</th>
                  <th>{t("redemptions.colDate")}</th>
                  <th>{t("redemptions.colMember")}</th>
                  <th>{t("redemptions.colReward")}</th>
                  <th className="r">{t("redemptions.colPointsRedeemed")}</th>
                  <th className="r">{t("redemptions.colBalanceAfter")}</th>
                  <th>{t("redemptions.colStatus")}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id}>
                    <td className="nw">{r.redemption_id}</td>
                    <td className="nw">{new Date(r.redemption_date).toLocaleString()}</td>
                    <td>
                      {r.members ? (
                        <Link href={`/members/${r.members.id}`}>{r.members.full_name}</Link>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td>{r.rewards?.name ?? "—"}</td>
                    <td className="r">{Number(r.points_redeemed).toLocaleString()}</td>
                    <td className="r">{Number(r.points_balance_after).toLocaleString()}</td>
                    <td>
                      <span className="pill ok">{r.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showRedeem && (
        <RedeemModal
          members={members}
          rewards={rewards}
          onClose={() => setShowRedeem(false)}
          onRedeemed={() => {
            setShowRedeem(false);
            router.refresh();
          }}
        />
      )}
    </>
  );
}

function RedeemModal({
  members,
  rewards,
  onClose,
  onRedeemed,
}: {
  members: MemberOption[];
  rewards: Reward[];
  onClose: () => void;
  onRedeemed: () => void;
}) {
  const t = useT();
  const [memberId, setMemberId] = useState(members[0]?.id ?? "");
  const [rewardId, setRewardId] = useState(rewards[0]?.id ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedMember = members.find((m) => m.id === memberId);
  const selectedReward = rewards.find((r) => r.id === rewardId);
  const balanceAfter =
    selectedMember && selectedReward ? selectedMember.current_points_balance - selectedReward.points_required : null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!memberId || !rewardId) {
      setError(t("redeemModal.selectBoth"));
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ member_id: memberId, reward_id: rewardId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? t("redeemModal.failed"));
      onRedeemed();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("redeemModal.failed"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="overlay">
      <div className="modal">
        <div className="modal-head">
          <h2>{t("redeemModal.title")}</h2>
          <button onClick={onClose} className="x">
            &times;
          </button>
        </div>
        <form onSubmit={handleSubmit} className="modal-body">
          {error && <div className="err">{error}</div>}
          {rewards.length === 0 ? (
            <p className="muted small">{t("redeemModal.noActiveRewards")}</p>
          ) : (
            <>
              <div>
                <label className="lbl">{t("redeemModal.member")}</label>
                <select value={memberId} onChange={(e) => setMemberId(e.target.value)}>
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.full_name} ({m.member_id}) — {m.current_points_balance.toLocaleString()} pts
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="lbl">{t("redeemModal.reward")}</label>
                <select value={rewardId} onChange={(e) => setRewardId(e.target.value)}>
                  {rewards.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} — {r.points_required} pts
                    </option>
                  ))}
                </select>
              </div>
              {balanceAfter !== null && (
                <p className="small">
                  {t("redeemModal.balanceAfter")}{" "}
                  <b style={{ color: balanceAfter < 0 ? "var(--red)" : undefined }}>
                    {balanceAfter.toLocaleString()} pts
                  </b>
                </p>
              )}
            </>
          )}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              {t("common.cancel")}
            </button>
            <button type="submit" className={btnPrimary} disabled={submitting || rewards.length === 0}>
              {submitting ? t("redeemModal.redeeming") : t("redeemModal.confirm")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
