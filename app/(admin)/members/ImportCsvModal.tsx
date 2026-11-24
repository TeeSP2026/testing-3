"use client";

import { useRef, useState } from "react";
import { btnPrimary, btnSecondary } from "@/lib/styles";
import { useT } from "@/lib/i18n/context";

export default function ImportCsvModal({ onClose, onImported }: { onClose: () => void; onImported: () => void }) {
  const t = useT();
  const fileRef = useRef<HTMLInputElement>(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ imported: number; skipped: number; total: number; errors: string[] } | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleImport() {
    const file = fileRef.current?.files?.[0];
    if (!file) {
      setError(t("importCsv.chooseFile"));
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
      if (!res.ok) throw new Error(data.error || t("importCsv.failed"));
      setResult(data);
      onImported();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("importCsv.failed"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="overlay">
      <div className="modal">
        <div className="modal-head">
          <h2>{t("importCsv.title")}</h2>
          <button onClick={onClose} className="x">&times;</button>
        </div>
        <div className="modal-body">
          <p className="muted small">{t("importCsv.hint")}</p>
          {error && <div className="err">{error}</div>}
          {result && (
            <div className="pill ok" style={{ display: "block", padding: "10px 14px" }}>
              {t("importCsv.result", { imported: result.imported, skipped: result.skipped, total: result.total })}
              {result.errors.length > 0 && (
                <ul style={{ marginTop: 8, paddingLeft: 20 }}>
                  {result.errors.map((e, i) => <li key={i}>{e}</li>)}
                </ul>
              )}
            </div>
          )}
          <input ref={fileRef} type="file" accept=".csv,text/csv" />
          <div className="modal-foot" style={{ padding: 0, border: 0 }}>
            <button type="button" className={btnSecondary} onClick={onClose}>{t("common.close")}</button>
            <button type="button" className={btnPrimary} onClick={handleImport} disabled={submitting}>
              {submitting ? t("importCsv.importing") : t("importCsv.import")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
