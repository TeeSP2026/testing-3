"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MembershipCategory } from "@/lib/types";
import { btnPrimary, btnSecondary, card, input, label } from "@/lib/styles";
import { updateCategory, CategoryFormInput } from "./actions";

export default function CategoriesClient({ initialCategories }: { initialCategories: MembershipCategory[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<MembershipCategory | null>(null);
  const [reassigning, setReassigning] = useState(false);
  const [reassignResult, setReassignResult] = useState<string | null>(null);

  async function handleReassign() {
    setReassigning(true);
    setReassignResult(null);
    try {
      const res = await fetch("/api/reassign-categories", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to reassign categories.");
      setReassignResult(`${data.moved} member(s) moved to a new category.`);
      router.refresh();
    } catch (err) {
      setReassignResult(err instanceof Error ? err.message : "Failed to reassign categories.");
    } finally {
      setReassigning(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Membership Categories</h1>
          <p className="text-sm text-neutral-500">Edit thresholds and point multipliers.</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <button className={btnSecondary} onClick={handleReassign} disabled={reassigning}>
            {reassigning ? "Re-assigning…" : "Re-run Category Assignment"}
          </button>
          {reassignResult && <p className="text-xs text-neutral-500">{reassignResult}</p>}
        </div>
      </div>

      <div className={card + " overflow-hidden"}>
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 text-neutral-500 text-xs uppercase tracking-wide">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Name</th>
              <th className="text-left px-4 py-3 font-medium">Min Annual Spend</th>
              <th className="text-left px-4 py-3 font-medium">Max Annual Spend</th>
              <th className="text-left px-4 py-3 font-medium">Point Multiplier</th>
              <th className="text-left px-4 py-3 font-medium">Benefits</th>
              <th className="text-right px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {initialCategories.map((c) => (
              <tr key={c.id} className="hover:bg-neutral-50">
                <td className="px-4 py-3 font-medium">{c.name}</td>
                <td className="px-4 py-3">RM{c.min_annual_spend.toLocaleString()}</td>
                <td className="px-4 py-3">{c.max_annual_spend !== null ? `RM${c.max_annual_spend.toLocaleString()}` : "No cap"}</td>
                <td className="px-4 py-3">{c.point_multiplier}x</td>
                <td className="px-4 py-3 text-neutral-500">{c.benefits ?? "—"}</td>
                <td className="px-4 py-3 text-right">
                  <button className="text-xs text-neutral-600 hover:underline" onClick={() => setEditing(c)}>
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <CategoryFormModal
          category={editing}
          onClose={() => setEditing(null)}
          onSubmit={async (formInput) => {
            await updateCategory(editing.id, formInput);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}

function CategoryFormModal({
  category,
  onClose,
  onSubmit,
}: {
  category: MembershipCategory;
  onClose: () => void;
  onSubmit: (input: CategoryFormInput) => Promise<void>;
}) {
  const [form, setForm] = useState<CategoryFormInput>({
    name: category.name,
    min_annual_spend: category.min_annual_spend,
    max_annual_spend: category.max_annual_spend,
    point_multiplier: category.point_multiplier,
    benefits: category.benefits ?? "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);
    try {
      await onSubmit(form);
      onClose();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to save category.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-20 p-4">
      <div className="bg-white rounded-xl shadow-lg max-w-md w-full">
        <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between">
          <h2 className="font-semibold text-lg">Edit {category.name}</h2>
          <button onClick={onClose} className="text-neutral-400 hover:text-neutral-700 text-xl leading-none">
            &times;
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {formError && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2">
              {formError}
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={label}>Min Annual Spend (RM)</label>
              <input
                type="number"
                min="0"
                className={input}
                value={form.min_annual_spend}
                onChange={(e) => setForm({ ...form, min_annual_spend: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className={label}>Max Annual Spend (RM)</label>
              <input
                type="number"
                min="0"
                className={input}
                placeholder="No cap"
                value={form.max_annual_spend ?? ""}
                onChange={(e) =>
                  setForm({ ...form, max_annual_spend: e.target.value === "" ? null : Number(e.target.value) })
                }
              />
            </div>
          </div>
          <div>
            <label className={label}>Point Multiplier</label>
            <input
              type="number"
              min="0"
              step="0.1"
              className={input}
              value={form.point_multiplier}
              onChange={(e) => setForm({ ...form, point_multiplier: Number(e.target.value) })}
            />
          </div>
          <div>
            <label className={label}>Benefits</label>
            <input
              className={input}
              value={form.benefits}
              onChange={(e) => setForm({ ...form, benefits: e.target.value })}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className={btnSecondary} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className={btnPrimary} disabled={submitting}>
              {submitting ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
