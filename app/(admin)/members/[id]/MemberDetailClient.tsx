"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  MemberWithCategory,
  MembershipCategory,
  PointTransaction,
  Reward,
  RedemptionWithReward,
} from "@/lib/types";
import { btnPrimary, btnSecondary, categoryColor, label, statusColor } from "@/lib/styles";
import { updateMember, toggleMemberStatus, MemberFormInput } from "../actions";
import MemberFormModal from "../MemberFormModal";

export default function MemberDetailClient({
  member,
  categories,
  transactions,
  redemptions,
  activeRewards,
}: {
  member: MemberWithCategory;
  categories: MembershipCategory[];
  transactions: PointTransaction[];
  redemptions: RedemptionWithReward[];
  activeRewards: Reward[];
}) {
  const router = useRouter();
  const [tab, setTab] = useState<"purchases" | "redemptions">("purchases");
  const [showEdit, setShowEdit] = useState(false);
  const [pendingToggle, setPendingToggle] = useState(false);

  const [amount, setAmount] = useState("");
  const [remarks, setRemarks] = useState("");
  const [purchaseSubmitting, setPurchaseSubmitting] = useState(false);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);
  const [purchaseSuccess, setPurchaseSuccess] = useState<string | null>(null);

  const [selectedRewardId, setSelectedRewardId] = useState(activeRewards[0]?.id ?? "");
  const [redeemSubmitting, setRedeemSubmitting] = useState(false);
  const [redeemError, setRedeemError] = useState<string | null>(null);
  const [redeemSuccess, setRedeemSuccess] = useState<string | null>(null);

  const selectedReward = activeRewards.find((r) => r.id === selectedRewardId);
  const balanceAfterRedeem = selectedReward ? member.current_points_balance - selectedReward.points_required : null;

  async function handleEdit(formInput: MemberFormInput) {
    await updateMember(member.id, formInput);
    router.refresh();
  }

  async function handleToggleStatus() {
    const newStatus = member.status === "Active" ? "Inactive" : "Active";
    await toggleMemberStatus(member.id, newStatus);
    setPendingToggle(false);
    router.refresh();
  }

  async function handleLogPurchase(e: React.FormEvent) {
    e.preventDefault();
    setPurchaseError(null);
    setPurchaseSuccess(null);
    const value = Number(amount);
    if (!Number.isFinite(value) || value <= 0) {
      setPurchaseError("Enter a purchase amount greater than 0.");
      return;
    }
    setPurchaseSubmitting(true);
    try {
      const res = await fetch("/api/award-points", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ member_id: member.id, purchase_amount: value, remarks }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to log purchase.");
      setPurchaseSuccess(
        `${data.points_earned} points added${data.category_upgraded ? " — category upgraded!" : ""}.`,
      );
      setAmount("");
      setRemarks("");
      router.refresh();
    } catch (err) {
      setPurchaseError(err instanceof Error ? err.message : "Failed to log purchase.");
    } finally {
      setPurchaseSubmitting(false);
    }
  }

  async function handleRedeem() {
    setRedeemError(null);
    setRedeemSuccess(null);
    if (!selectedRewardId) return;
    setRedeemSubmitting(true);
    try {
      const res = await fetch("/api/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ member_id: member.id, reward_id: selectedRewardId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to redeem.");
      setRedeemSuccess(`Redeemed! New balance: ${data.new_balance} pts.`);
      router.refresh();
    } catch (err) {
      setRedeemError(err instanceof Error ? err.message : "Failed to redeem.");
    } finally {
      setRedeemSubmitting(false);
    }
  }

  const initials = member.full_name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <>
      <Link href="/members" className="small">
        &larr; Back to Members
      </Link>

      <div className="panel">
        <div className="md-head">
          <div className="md-avatar">{initials}</div>
          <div>
            <div className="md-name">{member.full_name}</div>
            {member.nickname && <div className="md-nick">&ldquo;{member.nickname}&rdquo;</div>}
            <p className="muted small">{member.member_id}</p>
          </div>
          <div className="md-tags">
            <span className="tier" style={{ ["--tc" as string]: categoryColor(member.membership_categories?.name) }}>
              <i /> {member.membership_categories?.name ?? "—"}
            </span>
            <span className={statusColor(member.status)}>{member.status}</span>
          </div>
        </div>

        <div className="md-info">
          {member.mobile_number && (
            <div><dt>Mobile</dt><dd>{member.mobile_number}</dd></div>
          )}
          {member.email_address && (
            <div><dt>Email</dt><dd>{member.email_address}</dd></div>
          )}
          {member.address && (
            <div className="md-addr"><dt>Address</dt><dd>{member.address}</dd></div>
          )}
        </div>

        <div className="md-sum">
          <div className="md-box teal">
            <span>Points Balance</span>
            <b>{member.current_points_balance.toLocaleString()}</b>
          </div>
          <div className="md-box blue">
            <span>Annual Spend</span>
            <b>RM{member.annual_spend.toLocaleString()}</b>
          </div>
          <div className="md-box">
            <span>Registered</span>
            <b>{member.registration_date}</b>
          </div>
        </div>

        <div className="actions">
          <button className={btnSecondary} onClick={() => setShowEdit(true)}>
            Edit
          </button>
          {pendingToggle ? (
            <span className="small">
              Confirm?{" "}
              <button style={{ all: "unset", color: "var(--red)", cursor: "pointer", fontWeight: 600 }} onClick={handleToggleStatus}>
                Yes
              </button>{" "}
              <button style={{ all: "unset", color: "var(--muted)", cursor: "pointer" }} onClick={() => setPendingToggle(false)}>
                No
              </button>
            </span>
          ) : (
            <button className={btnSecondary} onClick={() => setPendingToggle(true)}>
              {member.status === "Active" ? "Deactivate" : "Activate"}
            </button>
          )}
        </div>
      </div>

      <div className="cols-eq">
        <div className="panel">
          <h2>Log Purchase</h2>
          <form onSubmit={handleLogPurchase} className="grid2">
            <div>
              <label className={label}>Purchase Amount (RM)</label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <div>
              <label className={label}>Remarks</label>
              <input value={remarks} onChange={(e) => setRemarks(e.target.value)} />
            </div>
            {purchaseError && <p className="err">{purchaseError}</p>}
            {purchaseSuccess && <p className="small" style={{ color: "var(--teal)" }}>{purchaseSuccess}</p>}
            <button type="submit" className={btnPrimary} disabled={purchaseSubmitting}>
              {purchaseSubmitting ? "Logging…" : "Log Purchase"}
            </button>
          </form>
        </div>

        <div className="panel">
          <h2>Redeem Reward</h2>
          {activeRewards.length === 0 ? (
            <p className="muted small">No active rewards available.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <label className={label}>Reward</label>
                <select
                  value={selectedRewardId}
                  onChange={(e) => setSelectedRewardId(e.target.value)}
                >
                  {activeRewards.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} — {r.points_required} pts
                    </option>
                  ))}
                </select>
              </div>
              {selectedReward && (
                <p className="small">
                  Balance after redemption:{" "}
                  <b style={{ color: balanceAfterRedeem !== null && balanceAfterRedeem < 0 ? "var(--red)" : undefined }}>
                    {balanceAfterRedeem?.toLocaleString()} pts
                  </b>
                </p>
              )}
              {redeemError && <p className="err">{redeemError}</p>}
              {redeemSuccess && <p className="small" style={{ color: "var(--teal)" }}>{redeemSuccess}</p>}
              <button className={btnPrimary} onClick={handleRedeem} disabled={redeemSubmitting}>
                {redeemSubmitting ? "Redeeming…" : "Confirm Redemption"}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="panel">
        <div className="seg">
          <button className={tab === "purchases" ? "on" : ""} onClick={() => setTab("purchases")}>
            Purchase History
          </button>
          <button className={tab === "redemptions" ? "on" : ""} onClick={() => setTab("redemptions")}>
            Redemption History
          </button>
        </div>

        {tab === "purchases" &&
          (transactions.length === 0 ? (
            <p className="empty">No transactions yet.</p>
          ) : (
            <div className="tbl-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Transaction No</th>
                    <th>Date</th>
                    <th className="r">Amount (RM)</th>
                    <th className="r">Points Earned</th>
                    <th>Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((t) => (
                    <tr key={t.id}>
                      <td className="nw">{t.transaction_no}</td>
                      <td className="nw">{new Date(t.transaction_date).toLocaleString()}</td>
                      <td className="r">{Number(t.purchase_amount).toLocaleString()}</td>
                      <td className="r">{Number(t.points_earned).toLocaleString()}</td>
                      <td className="muted">{t.remarks ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}

        {tab === "redemptions" &&
          (redemptions.length === 0 ? (
            <p className="empty">No redemptions yet.</p>
          ) : (
            <div className="tbl-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Redemption ID</th>
                    <th>Date</th>
                    <th>Reward</th>
                    <th className="r">Points Redeemed</th>
                    <th className="r">Balance After</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {redemptions.map((r) => (
                    <tr key={r.id}>
                      <td className="nw">{r.redemption_id}</td>
                      <td className="nw">{new Date(r.redemption_date).toLocaleString()}</td>
                      <td>{r.rewards?.name ?? "—"}</td>
                      <td className="r">{Number(r.points_redeemed).toLocaleString()}</td>
                      <td className="r">{Number(r.points_balance_after).toLocaleString()}</td>
                      <td>{r.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
      </div>

      {showEdit && (
        <MemberFormModal
          categories={categories}
          member={member}
          onClose={() => setShowEdit(false)}
          onSubmit={handleEdit}
        />
      )}
    </>
  );
}
