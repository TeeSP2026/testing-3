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
import { btnPrimary, btnSecondary, card, categoryColor, input, label, statusColor } from "@/lib/styles";
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

  return (
    <div className="space-y-6">
      <Link href="/members" className="text-sm text-neutral-500 hover:underline">
        &larr; Back to Members
      </Link>

      <div className={card + " p-6 flex items-start justify-between"}>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">{member.full_name}</h1>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${categoryColor(member.membership_categories?.name)}`}>
              {member.membership_categories?.name ?? "—"}
            </span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor(member.status)}`}>
              {member.status}
            </span>
          </div>
          <p className="text-sm text-neutral-500 font-mono">{member.member_id}</p>
          <div className="text-sm text-neutral-600 space-y-0.5 pt-1">
            {member.mobile_number && <p>Mobile: {member.mobile_number}</p>}
            {member.email_address && <p>Email: {member.email_address}</p>}
            {member.address && <p>Address: {member.address}</p>}
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="text-right">
            <p className="text-3xl font-bold">{member.current_points_balance.toLocaleString()}</p>
            <p className="text-xs text-neutral-500">points balance</p>
          </div>
          <p className="text-sm text-neutral-500">Annual spend: RM{member.annual_spend.toLocaleString()}</p>
          <div className="flex gap-2 pt-2">
            <button className={btnSecondary} onClick={() => setShowEdit(true)}>
              Edit
            </button>
            {pendingToggle ? (
              <span className="inline-flex items-center gap-1 text-xs">
                Confirm?
                <button className="text-red-600 font-medium" onClick={handleToggleStatus}>
                  Yes
                </button>
                <button className="text-neutral-500" onClick={() => setPendingToggle(false)}>
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
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className={card + " p-6 space-y-3"}>
          <h2 className="font-semibold">Log Purchase</h2>
          <form onSubmit={handleLogPurchase} className="space-y-3">
            <div>
              <label className={label}>Purchase Amount (RM)</label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                className={input}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <div>
              <label className={label}>Remarks</label>
              <input className={input} value={remarks} onChange={(e) => setRemarks(e.target.value)} />
            </div>
            {purchaseError && <p className="text-sm text-red-600">{purchaseError}</p>}
            {purchaseSuccess && <p className="text-sm text-green-700">{purchaseSuccess}</p>}
            <button type="submit" className={btnPrimary} disabled={purchaseSubmitting}>
              {purchaseSubmitting ? "Logging…" : "Log Purchase"}
            </button>
          </form>
        </div>

        <div className={card + " p-6 space-y-3"}>
          <h2 className="font-semibold">Redeem Reward</h2>
          {activeRewards.length === 0 ? (
            <p className="text-sm text-neutral-500">No active rewards available.</p>
          ) : (
            <div className="space-y-3">
              <div>
                <label className={label}>Reward</label>
                <select
                  className={input}
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
                <p className="text-sm text-neutral-600">
                  Balance after redemption:{" "}
                  <span className={balanceAfterRedeem !== null && balanceAfterRedeem < 0 ? "text-red-600 font-medium" : "font-medium"}>
                    {balanceAfterRedeem?.toLocaleString()} pts
                  </span>
                </p>
              )}
              {redeemError && <p className="text-sm text-red-600">{redeemError}</p>}
              {redeemSuccess && <p className="text-sm text-green-700">{redeemSuccess}</p>}
              <button className={btnPrimary} onClick={handleRedeem} disabled={redeemSubmitting}>
                {redeemSubmitting ? "Redeeming…" : "Confirm Redemption"}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className={card}>
        <div className="flex border-b border-neutral-200">
          <button
            className={`px-4 py-3 text-sm font-medium ${tab === "purchases" ? "border-b-2 border-neutral-900" : "text-neutral-500"}`}
            onClick={() => setTab("purchases")}
          >
            Purchase History
          </button>
          <button
            className={`px-4 py-3 text-sm font-medium ${tab === "redemptions" ? "border-b-2 border-neutral-900" : "text-neutral-500"}`}
            onClick={() => setTab("redemptions")}
          >
            Redemption History
          </button>
        </div>

        {tab === "purchases" &&
          (transactions.length === 0 ? (
            <p className="p-8 text-center text-sm text-neutral-500">No transactions yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-neutral-50 text-neutral-500 text-xs uppercase tracking-wide">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Transaction No</th>
                  <th className="text-left px-4 py-3 font-medium">Date</th>
                  <th className="text-left px-4 py-3 font-medium">Amount (RM)</th>
                  <th className="text-left px-4 py-3 font-medium">Points Earned</th>
                  <th className="text-left px-4 py-3 font-medium">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {transactions.map((t) => (
                  <tr key={t.id}>
                    <td className="px-4 py-3 font-mono text-xs">{t.transaction_no}</td>
                    <td className="px-4 py-3">{new Date(t.transaction_date).toLocaleString()}</td>
                    <td className="px-4 py-3">{Number(t.purchase_amount).toLocaleString()}</td>
                    <td className="px-4 py-3 font-medium">{Number(t.points_earned).toLocaleString()}</td>
                    <td className="px-4 py-3 text-neutral-500">{t.remarks ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ))}

        {tab === "redemptions" &&
          (redemptions.length === 0 ? (
            <p className="p-8 text-center text-sm text-neutral-500">No redemptions yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-neutral-50 text-neutral-500 text-xs uppercase tracking-wide">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Redemption ID</th>
                  <th className="text-left px-4 py-3 font-medium">Date</th>
                  <th className="text-left px-4 py-3 font-medium">Reward</th>
                  <th className="text-left px-4 py-3 font-medium">Points Redeemed</th>
                  <th className="text-left px-4 py-3 font-medium">Balance After</th>
                  <th className="text-left px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {redemptions.map((r) => (
                  <tr key={r.id}>
                    <td className="px-4 py-3 font-mono text-xs">{r.redemption_id}</td>
                    <td className="px-4 py-3">{new Date(r.redemption_date).toLocaleString()}</td>
                    <td className="px-4 py-3">{r.rewards?.name ?? "—"}</td>
                    <td className="px-4 py-3 font-medium">{Number(r.points_redeemed).toLocaleString()}</td>
                    <td className="px-4 py-3">{Number(r.points_balance_after).toLocaleString()}</td>
                    <td className="px-4 py-3">{r.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
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
    </div>
  );
}
