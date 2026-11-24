"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PointTransactionWithMember } from "@/lib/types";
import { btnPrimary } from "@/lib/styles";
import { useT } from "@/lib/i18n/context";

type MemberOption = { id: string; member_id: string; full_name: string };

export default function SalesClient({
  initialTransactions,
  members,
}: {
  initialTransactions: PointTransactionWithMember[];
  members: MemberOption[];
}) {
  const t = useT();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [month, setMonth] = useState("");
  const [showLog, setShowLog] = useState(false);

  const months = useMemo(() => {
    const set = new Set(initialTransactions.map((t) => t.transaction_date.slice(0, 7)));
    return Array.from(set).sort().reverse();
  }, [initialTransactions]);

  const filtered = useMemo(() => {
    return initialTransactions.filter((t) => {
      if (month && !t.transaction_date.startsWith(month)) return false;
      if (!query.trim()) return true;
      const q = query.trim().toLowerCase();
      return [t.transaction_no, t.members?.full_name, t.members?.member_id, t.remarks]
        .filter(Boolean)
        .some((f) => f!.toLowerCase().includes(q));
    });
  }, [initialTransactions, query, month]);

  const totalAmount = filtered.reduce((s, t) => s + Number(t.purchase_amount), 0);
  const totalPoints = filtered.reduce((s, t) => s + Number(t.points_earned), 0);

  return (
    <>
      <div className="page-head">
        <div>
          <h1>{t("sales.title")}</h1>
          <p>{t("sales.subtitle")}</p>
        </div>
        <button className={btnPrimary} onClick={() => setShowLog(true)}>
          {t("sales.logSale")}
        </button>
      </div>

      <div className="kpis" style={{ gridTemplateColumns: "repeat(2,minmax(0,1fr))" }}>
        <div className="kpi orange">
          <span className="v">RM{totalAmount.toLocaleString()}</span>
          <span className="k">{t("sales.totalSales")}</span>
        </div>
        <div className="kpi teal">
          <span className="v">{totalPoints.toLocaleString()}</span>
          <span className="k">{t("sales.pointsEarned")}</span>
        </div>
      </div>

      <div className="filters" style={{ gridTemplateColumns: "2fr 1fr" }}>
        <input
          placeholder={t("sales.searchPlaceholder")}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select value={month} onChange={(e) => setMonth(e.target.value)}>
          <option value="">{t("sales.allMonths")}</option>
          {months.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>

      <div className="panel">
        {filtered.length === 0 ? (
          <p className="empty">{t("sales.noSales")}</p>
        ) : (
          <div className="tbl-wrap">
            <table>
              <thead>
                <tr>
                  <th>{t("sales.colTransactionNo")}</th>
                  <th>{t("sales.colDate")}</th>
                  <th>{t("sales.colMember")}</th>
                  <th className="r">{t("sales.colAmount")}</th>
                  <th className="r">{t("sales.colPointsEarned")}</th>
                  <th>{t("sales.colRemarks")}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((t) => (
                  <tr key={t.id}>
                    <td className="nw">{t.transaction_no}</td>
                    <td className="nw">{new Date(t.transaction_date).toLocaleString()}</td>
                    <td>
                      {t.members ? (
                        <Link href={`/members/${t.members.id}`}>{t.members.full_name}</Link>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="r">{Number(t.purchase_amount).toLocaleString()}</td>
                    <td className="r">{Number(t.points_earned).toLocaleString()}</td>
                    <td className="muted">{t.remarks ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showLog && (
        <LogSaleModal
          members={members}
          onClose={() => setShowLog(false)}
          onLogged={() => {
            setShowLog(false);
            router.refresh();
          }}
        />
      )}
    </>
  );
}

function LogSaleModal({
  members,
  onClose,
  onLogged,
}: {
  members: MemberOption[];
  onClose: () => void;
  onLogged: () => void;
}) {
  const t = useT();
  const [memberId, setMemberId] = useState(members[0]?.id ?? "");
  const [amount, setAmount] = useState("");
  const [remarks, setRemarks] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const value = Number(amount);
    if (!memberId) {
      setError(t("logSale.selectMember"));
      return;
    }
    if (!Number.isFinite(value) || value <= 0) {
      setError(t("logSale.amountInvalid"));
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/award-points", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ member_id: memberId, purchase_amount: value, remarks }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? t("logSale.failed"));
      onLogged();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("logSale.failed"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="overlay">
      <div className="modal">
        <div className="modal-head">
          <h2>{t("logSale.title")}</h2>
          <button onClick={onClose} className="x">
            &times;
          </button>
        </div>
        <form onSubmit={handleSubmit} className="modal-body">
          {error && <div className="err">{error}</div>}
          <div>
            <label className="lbl">{t("logSale.member")}</label>
            <select value={memberId} onChange={(e) => setMemberId(e.target.value)}>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.full_name} ({m.member_id})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="lbl">{t("logSale.amount")}</label>
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <div>
            <label className="lbl">{t("logSale.remarks")}</label>
            <input value={remarks} onChange={(e) => setRemarks(e.target.value)} />
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              {t("common.cancel")}
            </button>
            <button type="submit" className={btnPrimary} disabled={submitting}>
              {submitting ? t("logSale.logging") : t("logSale.title")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
