"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { RedemptionWithMemberAndReward, Reward } from "@/lib/types";
import { btnPrimary } from "@/lib/styles";

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
          <h1>兑换记录 Redemptions</h1>
          <p>All reward redemptions across every member.</p>
        </div>
        <button className={btnPrimary} onClick={() => setShowRedeem(true)}>
          + Redeem
        </button>
      </div>

      <div className="kpis" style={{ gridTemplateColumns: "repeat(2,minmax(0,1fr))" }}>
        <div className="kpi blue">
          <span className="v">{filtered.length}</span>
          <span className="k">Redemptions (filtered)</span>
        </div>
        <div className="kpi orange">
          <span className="v">{totalPoints.toLocaleString()}</span>
          <span className="k">Points Redeemed (filtered)</span>
        </div>
      </div>

      <input
        style={{ maxWidth: 360 }}
        placeholder="Search by redemption ID, member, or reward…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      <div className="panel">
        {filtered.length === 0 ? (
          <p className="empty">No redemptions recorded yet.</p>
        ) : (
          <div className="tbl-wrap">
            <table>
              <thead>
                <tr>
                  <th>Redemption ID</th>
                  <th>Date</th>
                  <th>Member</th>
                  <th>Reward</th>
                  <th className="r">Points Redeemed</th>
                  <th className="r">Balance After</th>
                  <th>Status</th>
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
      setError("Please select a member and a reward.");
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
      if (!res.ok) throw new Error(data.error ?? "Failed to redeem.");
      onRedeemed();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to redeem.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="overlay">
      <div className="modal">
        <div className="modal-head">
          <h2>Redeem Reward</h2>
          <button onClick={onClose} className="x">
            &times;
          </button>
        </div>
        <form onSubmit={handleSubmit} className="modal-body">
          {error && <div className="err">{error}</div>}
          {rewards.length === 0 ? (
            <p className="muted small">No active rewards available.</p>
          ) : (
            <>
              <div>
                <label className="lbl">Member</label>
                <select value={memberId} onChange={(e) => setMemberId(e.target.value)}>
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.full_name} ({m.member_id}) — {m.current_points_balance.toLocaleString()} pts
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="lbl">Reward</label>
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
                  Balance after redemption:{" "}
                  <b style={{ color: balanceAfter < 0 ? "var(--red)" : undefined }}>
                    {balanceAfter.toLocaleString()} pts
                  </b>
                </p>
              )}
            </>
          )}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className={btnPrimary} disabled={submitting || rewards.length === 0}>
              {submitting ? "Redeeming…" : "Confirm Redemption"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
