"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PointTransactionWithMember } from "@/lib/types";
import { btnPrimary } from "@/lib/styles";

type MemberOption = { id: string; member_id: string; full_name: string };

export default function SalesClient({
  initialTransactions,
  members,
}: {
  initialTransactions: PointTransactionWithMember[];
  members: MemberOption[];
}) {
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
          <h1>销售记录 Sales</h1>
          <p>All logged purchases across every member.</p>
        </div>
        <button className={btnPrimary} onClick={() => setShowLog(true)}>
          + Log Sale
        </button>
      </div>

      <div className="kpis" style={{ gridTemplateColumns: "repeat(2,minmax(0,1fr))" }}>
        <div className="kpi orange">
          <span className="v">RM{totalAmount.toLocaleString()}</span>
          <span className="k">Total Sales (filtered)</span>
        </div>
        <div className="kpi teal">
          <span className="v">{totalPoints.toLocaleString()}</span>
          <span className="k">Points Earned (filtered)</span>
        </div>
      </div>

      <div className="filters" style={{ gridTemplateColumns: "2fr 1fr" }}>
        <input
          placeholder="Search by transaction no, member, remarks…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select value={month} onChange={(e) => setMonth(e.target.value)}>
          <option value="">All months</option>
          {months.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>

      <div className="panel">
        {filtered.length === 0 ? (
          <p className="empty">No sales recorded yet.</p>
        ) : (
          <div className="tbl-wrap">
            <table>
              <thead>
                <tr>
                  <th>Transaction No</th>
                  <th>Date</th>
                  <th>Member</th>
                  <th className="r">Amount (RM)</th>
                  <th className="r">Points Earned</th>
                  <th>Remarks</th>
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
      setError("Please select a member.");
      return;
    }
    if (!Number.isFinite(value) || value <= 0) {
      setError("Enter a purchase amount greater than 0.");
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
      if (!res.ok) throw new Error(data.error ?? "Failed to log sale.");
      onLogged();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to log sale.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="overlay">
      <div className="modal">
        <div className="modal-head">
          <h2>Log Sale</h2>
          <button onClick={onClose} className="x">
            &times;
          </button>
        </div>
        <form onSubmit={handleSubmit} className="modal-body">
          {error && <div className="err">{error}</div>}
          <div>
            <label className="lbl">Member</label>
            <select value={memberId} onChange={(e) => setMemberId(e.target.value)}>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.full_name} ({m.member_id})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="lbl">Purchase Amount (RM)</label>
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <div>
            <label className="lbl">Remarks</label>
            <input value={remarks} onChange={(e) => setRemarks(e.target.value)} />
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className={btnPrimary} disabled={submitting}>
              {submitting ? "Logging…" : "Log Sale"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
