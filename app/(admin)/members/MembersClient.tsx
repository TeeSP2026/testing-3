"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MemberWithCategory, MembershipCategory } from "@/lib/types";
import { btnPrimary, btnSecondary, categoryColor, statusColor } from "@/lib/styles";
import { createMember, toggleMemberStatus, MemberFormInput } from "./actions";
import MemberFormModal from "./MemberFormModal";
import ImportCsvModal from "./ImportCsvModal";

export default function MembersClient({
  initialMembers,
  categories,
  loadError,
}: {
  initialMembers: MemberWithCategory[];
  categories: MembershipCategory[];
  loadError: string | null;
}) {
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
      setActionError(err instanceof Error ? err.message : "Failed to update status.");
    } finally {
      setPendingToggleId(null);
    }
  }

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Members</h1>
          <p>Manage member profiles, categories, and status.</p>
        </div>
        <div className="actions">
          <a href="/api/members/export" className={btnSecondary}>
            Export CSV
          </a>
          <button className={btnSecondary} onClick={() => setShowImport(true)}>
            Import CSV
          </button>
          <button className={btnPrimary} onClick={() => setShowAdd(true)}>
            + Add Member
          </button>
        </div>
      </div>

      <input
        style={{ maxWidth: 360 }}
        placeholder="Search by name, ID, mobile, or email…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {actionError && <div className="pill bad">{actionError}</div>}
      {loadError && <div className="pill bad">Failed to load members: {loadError}</div>}

      <div className="panel">
        {filtered.length === 0 ? (
          <div className="empty">
            {initialMembers.length === 0 ? "No members yet — add one." : "No members match your search."}
          </div>
        ) : (
          <div className="tbl-wrap">
            <table className="t-mem">
              <thead>
                <tr>
                  <th>Member ID</th>
                  <th>Name</th>
                  <th>Category</th>
                  <th className="r">Points</th>
                  <th>Status</th>
                  <th className="r">Actions</th>
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
                      <span className={statusColor(m.status)}>{m.status}</span>
                    </td>
                    <td className="r nw">
                      <Link href={`/members/${m.id}`} className="small">
                        View
                      </Link>{" "}
                      {pendingToggleId === m.id ? (
                        <span className="small">
                          Confirm?{" "}
                          <button className="btn-ghost small" style={{ all: "unset", color: "var(--red)", cursor: "pointer", fontWeight: 600 }} onClick={() => handleToggle(m)}>
                            Yes
                          </button>{" "}
                          <button style={{ all: "unset", color: "var(--muted)", cursor: "pointer" }} onClick={() => setPendingToggleId(null)}>
                            No
                          </button>
                        </span>
                      ) : (
                        <button
                          className="small"
                          style={{ all: "unset", color: "var(--blue)", cursor: "pointer" }}
                          onClick={() => setPendingToggleId(m.id)}
                        >
                          {m.status === "Active" ? "Deactivate" : "Activate"}
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
