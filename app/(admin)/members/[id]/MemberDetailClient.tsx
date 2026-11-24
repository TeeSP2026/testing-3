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
import { useT } from "@/lib/i18n/context";

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
  const t = useT();
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
      setPurchaseError(t("memberDetail.purchaseAmountInvalid"));
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
      if (!res.ok) throw new Error(data.error ?? t("memberDetail.purchaseFailed"));
      setPurchaseSuccess(
        t("memberDetail.purchaseSuccess", {
          points: data.points_earned,
          upgrade: data.category_upgraded ? t("memberDetail.categoryUpgraded") : "",
        }),
      );
      setAmount("");
      setRemarks("");
      router.refresh();
    } catch (err) {
      setPurchaseError(err instanceof Error ? err.message : t("memberDetail.purchaseFailed"));
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
      if (!res.ok) throw new Error(data.error ?? t("memberDetail.redeemFailed"));
      setRedeemSuccess(t("memberDetail.redeemSuccess", { balance: data.new_balance }));
      router.refresh();
    } catch (err) {
      setRedeemError(err instanceof Error ? err.message : t("memberDetail.redeemFailed"));
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
        {t("memberDetail.back")}
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
            <span className={statusColor(member.status)}>{t(`members.status${member.status}`)}</span>
          </div>
        </div>

        <div className="md-info">
          {member.mobile_number && (
            <div><dt>{t("memberDetail.mobile")}</dt><dd>{member.mobile_number}</dd></div>
          )}
          {member.email_address && (
            <div><dt>{t("memberDetail.email")}</dt><dd>{member.email_address}</dd></div>
          )}
          {member.address && (
            <div className="md-addr"><dt>{t("memberDetail.address")}</dt><dd>{member.address}</dd></div>
          )}
        </div>

        <div className="md-sum">
          <div className="md-box teal">
            <span>{t("memberDetail.pointsBalance")}</span>
            <b>{member.current_points_balance.toLocaleString()}</b>
          </div>
          <div className="md-box blue">
            <span>{t("memberDetail.annualSpend")}</span>
            <b>RM{member.annual_spend.toLocaleString()}</b>
          </div>
          <div className="md-box">
            <span>{t("memberDetail.registered")}</span>
            <b>{member.registration_date}</b>
          </div>
        </div>

        <div className="actions">
          <button className={btnSecondary} onClick={() => setShowEdit(true)}>
            {t("memberDetail.edit")}
          </button>
          {pendingToggle ? (
            <span className="small">
              {t("common.confirm")}{" "}
              <button style={{ all: "unset", color: "var(--red)", cursor: "pointer", fontWeight: 600 }} onClick={handleToggleStatus}>
                {t("common.yes")}
              </button>{" "}
              <button style={{ all: "unset", color: "var(--muted)", cursor: "pointer" }} onClick={() => setPendingToggle(false)}>
                {t("common.no")}
              </button>
            </span>
          ) : (
            <button className={btnSecondary} onClick={() => setPendingToggle(true)}>
              {member.status === "Active" ? t("members.deactivate") : t("members.activate")}
            </button>
          )}
        </div>
      </div>

      <div className="cols-eq">
        <div className="panel">
          <h2>{t("memberDetail.logPurchase")}</h2>
          <form onSubmit={handleLogPurchase} className="grid2">
            <div>
              <label className={label}>{t("memberDetail.purchaseAmount")}</label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <div>
              <label className={label}>{t("memberDetail.remarks")}</label>
              <input value={remarks} onChange={(e) => setRemarks(e.target.value)} />
            </div>
            {purchaseError && <p className="err">{purchaseError}</p>}
            {purchaseSuccess && <p className="small" style={{ color: "var(--teal)" }}>{purchaseSuccess}</p>}
            <button type="submit" className={btnPrimary} disabled={purchaseSubmitting}>
              {purchaseSubmitting ? t("memberDetail.logging") : t("memberDetail.logPurchaseBtn")}
            </button>
          </form>
        </div>

        <div className="panel">
          <h2>{t("memberDetail.redeemReward")}</h2>
          {activeRewards.length === 0 ? (
            <p className="muted small">{t("memberDetail.noActiveRewards")}</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <label className={label}>{t("memberDetail.reward")}</label>
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
                  {t("memberDetail.balanceAfter")}{" "}
                  <b style={{ color: balanceAfterRedeem !== null && balanceAfterRedeem < 0 ? "var(--red)" : undefined }}>
                    {balanceAfterRedeem?.toLocaleString()} pts
                  </b>
                </p>
              )}
              {redeemError && <p className="err">{redeemError}</p>}
              {redeemSuccess && <p className="small" style={{ color: "var(--teal)" }}>{redeemSuccess}</p>}
              <button className={btnPrimary} onClick={handleRedeem} disabled={redeemSubmitting}>
                {redeemSubmitting ? t("memberDetail.redeeming") : t("memberDetail.confirmRedeem")}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="panel">
        <div className="seg">
          <button className={tab === "purchases" ? "on" : ""} onClick={() => setTab("purchases")}>
            {t("memberDetail.purchaseHistory")}
          </button>
          <button className={tab === "redemptions" ? "on" : ""} onClick={() => setTab("redemptions")}>
            {t("memberDetail.redemptionHistory")}
          </button>
        </div>

        {tab === "purchases" &&
          (transactions.length === 0 ? (
            <p className="empty">{t("memberDetail.noTransactions")}</p>
          ) : (
            <div className="tbl-wrap">
              <table>
                <thead>
                  <tr>
                    <th>{t("memberDetail.colTransactionNo")}</th>
                    <th>{t("memberDetail.colDate")}</th>
                    <th className="r">{t("memberDetail.colAmount")}</th>
                    <th className="r">{t("memberDetail.colPointsEarned")}</th>
                    <th>{t("memberDetail.colRemarks")}</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => (
                    <tr key={tx.id}>
                      <td className="nw">{tx.transaction_no}</td>
                      <td className="nw">{new Date(tx.transaction_date).toLocaleString()}</td>
                      <td className="r">{Number(tx.purchase_amount).toLocaleString()}</td>
                      <td className="r">{Number(tx.points_earned).toLocaleString()}</td>
                      <td className="muted">{tx.remarks ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}

        {tab === "redemptions" &&
          (redemptions.length === 0 ? (
            <p className="empty">{t("memberDetail.noRedemptions")}</p>
          ) : (
            <div className="tbl-wrap">
              <table>
                <thead>
                  <tr>
                    <th>{t("memberDetail.colRedemptionId")}</th>
                    <th>{t("memberDetail.colDate")}</th>
                    <th>{t("memberDetail.colReward")}</th>
                    <th className="r">{t("memberDetail.colPointsRedeemed")}</th>
                    <th className="r">{t("memberDetail.colBalanceAfter")}</th>
                    <th>{t("memberDetail.colStatus")}</th>
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
