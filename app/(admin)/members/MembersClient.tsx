"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MemberWithCategory, MembershipCategory } from "@/lib/types";
import { btnPrimary, btnSecondary, categoryColor, statusColor } from "@/lib/styles";
import { createMember, toggleMemberStatus, MemberFormInput } from "./actions";
import MemberFormModal from "./MemberFormModal";
import ImportCsvModal from "./ImportCsvModal";
import { useT } from "@/lib/i18n/context";

export default function MembersClient({
  initialMembers,
  categories,
  loadError,
}: {
  initialMembers: MemberWithCategory[];
  categories: MembershipCategory[];
  loadError: string | null;
}) {
  const t = useT();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [pendingToggleId, setPendingToggleId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return initialMembers;
    return initialMembers.filter((m) =>
      [m.full_name, m.member_id, m.mobile_number, m.email_address]
        .filter(Boolean)
        .some((field) => field!.toLowerCase().includes(q)),
    );
  }, [initialMembers, query]);

  async function handleAdd(formInput: MemberFormInput) {
    await createMember(formInput);
    router.refresh();
  }

  async function handleToggle(m: MemberWithCategory) {
    setActionError(null);
    const newStatus = m.status === "Active" ? "Inactive" : "Active";
    try {
      await toggleMemberStatus(m.id, newStatus);
      router.refresh();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : t("memberForm.saveFailed"));
    } finally {
      setPendingToggleId(null);
    }
  }

  return (
    <>
      <div className="page-head">
        <div>
          <h1>{t("members.title")}</h1>
          <p>{t("members.subtitle")}</p>
        </div>
        <div className="actions">
          <a href="/api/members/export" className={btnSecondary}>
            {t("members.exportCsv")}
          </a>
          <button className={btnSecondary} onClick={() => setShowImport(true)}>
            {t("members.importCsv")}
          </button>
          <button className={btnPrimary} onClick={() => setShowAdd(true)}>
            {t("members.addMember")}
          </button>
        </div>
      </div>

      <input
        style={{ maxWidth: 360 }}
        placeholder={t("members.searchPlaceholder")}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {actionError && <div className="pill bad">{actionError}</div>}
      {loadError && <div className="pill bad">{t("members.loadError", { error: loadError })}</div>}

      <div className="panel">
        {filtered.length === 0 ? (
          <div className="empty">
            {initialMembers.length === 0 ? t("members.noMembers") : t("members.noMatch")}
          </div>
        ) : (
          <div className="tbl-wrap">
            <table className="t-mem">
              <thead>
                <tr>
                  <th>{t("members.colMemberId")}</th>
                  <th>{t("members.colName")}</th>
                  <th>{t("members.colCategory")}</th>
                  <th className="r">{t("members.colPoints")}</th>
                  <th>{t("members.colStatus")}</th>
                  <th className="r">{t("members.colActions")}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((m) => (
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
                    <td className="r">{m.current_points_balance.toLocaleString()}</td>
                    <td>
                      <span className={statusColor(m.status)}>{t(`members.status${m.status}`)}</span>
                    </td>
                    <td className="r nw">
                      <Link href={`/members/${m.id}`} className="small">
                        {t("members.view")}
                      </Link>{" "}
                      {pendingToggleId === m.id ? (
                        <span className="small">
                          {t("common.confirm")}{" "}
                          <button className="btn-ghost small" style={{ all: "unset", color: "var(--red)", cursor: "pointer", fontWeight: 600 }} onClick={() => handleToggle(m)}>
                            {t("common.yes")}
                          </button>{" "}
                          <button style={{ all: "unset", color: "var(--muted)", cursor: "pointer" }} onClick={() => setPendingToggleId(null)}>
                            {t("common.no")}
                          </button>
                        </span>
                      ) : (
                        <button
                          className="small"
                          style={{ all: "unset", color: "var(--blue)", cursor: "pointer" }}
                          onClick={() => setPendingToggleId(m.id)}
                        >
                          {m.status === "Active" ? t("members.deactivate") : t("members.activate")}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showAdd && (
        <MemberFormModal
          categories={categories}
          onClose={() => setShowAdd(false)}
          onSubmit={handleAdd}
        />
      )}

      {showImport && (
        <ImportCsvModal
          onClose={() => setShowImport(false)}
          onImported={() => router.refresh()}
        />
      )}
    </>
  );
}
