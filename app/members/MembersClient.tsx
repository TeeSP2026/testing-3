"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MemberWithCategory, MembershipCategory } from "@/lib/types";
import { btnPrimary, card, categoryColor, input, statusColor } from "@/lib/styles";
import { createMember, toggleMemberStatus, MemberFormInput } from "./actions";
import MemberFormModal from "./MemberFormModal";

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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Members</h1>
          <p className="text-sm text-neutral-500">Manage member profiles, categories, and status.</p>
        </div>
        <button className={btnPrimary} onClick={() => setShowAdd(true)}>
          + Add Member
        </button>
      </div>

      <input
        className={input + " max-w-sm"}
        placeholder="Search by name, ID, mobile, or email…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {actionError && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2">
          {actionError}
        </div>
      )}
      {loadError && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2">
          Failed to load members: {loadError}
        </div>
      )}

      <div className={card + " overflow-hidden"}>
        {filtered.length === 0 ? (
          <div className="p-10 text-center text-neutral-500 text-sm">
            {initialMembers.length === 0 ? "No members yet — add one." : "No members match your search."}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 text-neutral-500 text-xs uppercase tracking-wide">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Member ID</th>
                <th className="text-left px-4 py-3 font-medium">Name</th>
                <th className="text-left px-4 py-3 font-medium">Category</th>
                <th className="text-left px-4 py-3 font-medium">Points</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-right px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filtered.map((m) => (
                <tr key={m.id} className="hover:bg-neutral-50">
                  <td className="px-4 py-3 font-mono text-xs">{m.member_id}</td>
                  <td className="px-4 py-3">
                    <Link href={`/members/${m.id}`} className="font-medium hover:underline">
                      {m.full_name}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${categoryColor(m.membership_categories?.name)}`}>
                      {m.membership_categories?.name ?? "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium">{m.current_points_balance.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor(m.status)}`}>
                      {m.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <Link href={`/members/${m.id}`} className="text-neutral-600 hover:underline text-xs">
                      View
                    </Link>
                    {pendingToggleId === m.id ? (
                      <span className="inline-flex items-center gap-1 text-xs">
                        Confirm?
                        <button className="text-red-600 font-medium" onClick={() => handleToggle(m)}>
                          Yes
                        </button>
                        <button className="text-neutral-500" onClick={() => setPendingToggleId(null)}>
                          No
                        </button>
                      </span>
                    ) : (
                      <button
                        className="text-xs text-neutral-600 hover:underline"
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
        )}
      </div>

      {showAdd && (
        <MemberFormModal
          categories={categories}
          onClose={() => setShowAdd(false)}
          onSubmit={handleAdd}
        />
      )}
    </div>
  );
}
