"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MembershipCategory } from "@/lib/types";
import { btnPrimary, btnSecondary, label, categoryColor } from "@/lib/styles";
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
    <>
      <div className="page-head">
        <div>
          <h1>Membership Categories</h1>
          <p>Edit thresholds and point multipliers.</p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
          <button className={btnSecondary} onClick={handleReassign} disabled={reassigning}>
            {reassigning ? "Re-assigning…" : "Re-run Category Assignment"}
          </button>
          {reassignResult && <p className="muted small">{reassignResult}</p>}
        </div>
      </div>

      <div className="panel">
        <div className="tbl-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th className="r">Min Annual Spend</th>
                <th className="r">Max Annual Spend</th>
                <th className="r">Point Multiplier</th>
                <th>Benefits</th>
                <th className="r">Actions</th>
              </tr>
            </thead>
            <tbody>
              {initialCategories.map((c) => (
                <tr key={c.id}>
                  <td>
                    <span className="tier" style={{ ["--tc" as string]: categoryColor(c.name) }}>
                      <i /> {c.name}
                    </span>
                  </td>
                  <td className="r">RM{c.min_annual_spend.toLocaleString()}</td>
                  <td className="r">{c.max_annual_spend !== null ? `RM${c.max_annual_spend.toLocaleString()}` : "No cap"}</td>
                  <td className="r">{c.point_multiplier}x</td>
                  <td className="muted">{c.benefits ?? "—"}</td>
                  <td className="r">
                    <button style={{ all: "unset", color: "var(--blue)", cursor: "pointer" }} onClick={() => setEditing(c)}>
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
    </>
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
    <div className="overlay">
      <div className="modal">
        <div className="modal-head">
          <h2>Edit {category.name}</h2>
          <button onClick={onClose} className="x">
            &times;
          </button>
        </div>
        <form onSubmit={handleSubmit} className="modal-body">
          {formError && <div className="err">{formError}</div>}
          <div className="grid2">
            <div>
              <label className={label}>Min Annual Spend (RM)</label>
              <input
                type="number"
                min="0"
                value={form.min_annual_spend}
                onChange={(e) => setForm({ ...form, min_annual_spend: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className={label}>Max Annual Spend (RM)</label>
              <input
                type="number"
                min="0"
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
              value={form.point_multiplier}
              onChange={(e) => setForm({ ...form, point_multiplier: Number(e.target.value) })}
            />
          </div>
          <div>
            <label className={label}>Benefits</label>
            <input
              value={form.benefits}
              onChange={(e) => setForm({ ...form, benefits: e.target.value })}
            />
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
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
