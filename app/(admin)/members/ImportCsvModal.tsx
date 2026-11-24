"use client";

import { useRef, useState } from "react";
import { btnPrimary, btnSecondary } from "@/lib/styles";

export default function ImportCsvModal({ onClose, onImported }: { onClose: () => void; onImported: () => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ imported: number; skipped: number; total: number; errors: string[] } | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleImport() {
    const file = fileRef.current?.files?.[0];
    if (!file) {
      setError("Please choose a CSV file.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const csv = await file.text();
      const res = await fetch("/api/members/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ csv }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Import failed.");
      setResult(data);
      onImported();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Import failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="overlay">
      <div className="modal">
        <div className="modal-head">
          <h2>Import Members CSV</h2>
          <button onClick={onClose} className="x">&times;</button>
        </div>
        <div className="modal-body">
          <p className="muted small">
            上传从会员报名表单回复表格下载的 CSV（Google Sheet → File → Download → CSV）。
          </p>
          {error && <div className="err">{error}</div>}
          {result && (
            <div className="pill ok" style={{ display: "block", padding: "10px 14px" }}>
              导入 {result.imported} 位，跳过（重复/缺字段）{result.skipped} 位，共 {result.total} 行。
              {result.errors.length > 0 && (
                <ul style={{ marginTop: 8, paddingLeft: 20 }}>
                  {result.errors.map((e, i) => <li key={i}>{e}</li>)}
                </ul>
              )}
            </div>
          )}
          <input ref={fileRef} type="file" accept=".csv,text/csv" />
          <div className="modal-foot" style={{ padding: 0, border: 0 }}>
            <button type="button" className={btnSecondary} onClick={onClose}>Close</button>
            <button type="button" className={btnPrimary} onClick={handleImport} disabled={submitting}>
              {submitting ? "Importing…" : "Import"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
