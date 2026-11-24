"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MembershipCategory } from "@/lib/types";
import { btnPrimary, btnSecondary, label, categoryColor } from "@/lib/styles";
import { createCategory, updateCategory, deleteCategory, CategoryFormInput } from "./actions";
import { useT } from "@/lib/i18n/context";

export default function CategoriesClient({
  initialCategories,
  isAdmin,
}: {
  initialCategories: MembershipCategory[];
  isAdmin: boolean;
}) {
  const t = useT();
  const router = useRouter();
  const [editing, setEditing] = useState<MembershipCategory | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [reassigning, setReassigning] = useState(false);
  const [reassignResult, setReassignResult] = useState<string | null>(null);

  async function handleReassign() {
    setReassigning(true);
    setReassignResult(null);
    try {
      const res = await fetch("/api/reassign-categories", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? t("categories.reassignFailed"));
      setReassignResult(t("categories.reassignResult", { moved: data.moved }));
      router.refresh();
    } catch (err) {
      setReassignResult(err instanceof Error ? err.message : t("categories.reassignFailed"));
    } finally {
      setReassigning(false);
    }
  }

  async function handleDelete(id: string) {
    setDeleteError(null);
    try {
      await deleteCategory(id);
      setDeletingId(null);
      router.refresh();
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : t("categories.deleteFailed"));
    }
  }

  return (
    <>
      <div className="page-head">
        <div>
          <h1>{t("categories.title")}</h1>
          <p>{t("categories.subtitle")}</p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
          <div className="actions">
            <button className={btnSecondary} onClick={handleReassign} disabled={reassigning}>
              {reassigning ? t("categories.reassigning") : t("categories.reassign")}
            </button>
            {isAdmin && (
              <button className={btnPrimary} onClick={() => setShowAdd(true)}>
                {t("categories.addCategory")}
              </button>
            )}
          </div>
          {reassignResult && <p className="muted small">{reassignResult}</p>}
        </div>
      </div>

      {deleteError && <div className="err">{deleteError}</div>}

      <div className="panel">
        <div className="tbl-wrap">
          <table>
            <thead>
              <tr>
                <th>{t("categories.colName")}</th>
                <th className="r">{t("categories.colMinSpend")}</th>
                <th className="r">{t("categories.colMaxSpend")}</th>
                <th className="r">{t("categories.colMultiplier")}</th>
                <th>{t("categories.colBenefits")}</th>
                <th className="r">{t("categories.colActions")}</th>
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
                  <td className="r">{c.max_annual_spend !== null ? `RM${c.max_annual_spend.toLocaleString()}` : t("categories.noCap")}</td>
                  <td className="r">{c.point_multiplier}x</td>
                  <td className="muted">{c.benefits ?? "—"}</td>
                  <td className="r nw">
                    <button style={{ all: "unset", color: "var(--blue)", cursor: "pointer" }} onClick={() => setEditing(c)}>
                      {t("common.edit")}
                    </button>
                    {isAdmin && (
                      <>
                        {" "}
                        {deletingId === c.id ? (
                          <span className="small">
                            {t("common.confirm")}{" "}
                            <button style={{ all: "unset", color: "var(--red)", cursor: "pointer", fontWeight: 600 }} onClick={() => handleDelete(c.id)}>
                              {t("common.yes")}
                            </button>{" "}
                            <button style={{ all: "unset", color: "var(--muted)", cursor: "pointer" }} onClick={() => setDeletingId(null)}>
                              {t("common.no")}
                            </button>
                          </span>
                        ) : (
                          <button style={{ all: "unset", color: "var(--red)", cursor: "pointer", marginLeft: 8 }} onClick={() => setDeletingId(c.id)}>
                            {t("common.delete")}
                          </button>
                        )}
                      </>
                    )}
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

      {showAdd && (
        <CategoryFormModal
          onClose={() => setShowAdd(false)}
          onSubmit={async (formInput) => {
            await createCategory(formInput);
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
  category?: MembershipCategory;
  onClose: () => void;
  onSubmit: (input: CategoryFormInput) => Promise<void>;
}) {
  const [form, setForm] = useState<CategoryFormInput>({
    name: category?.name ?? "",
    min_annual_spend: category?.min_annual_spend ?? 0,
    max_annual_spend: category?.max_annual_spend ?? null,
    point_multiplier: category?.point_multiplier ?? 1,
    benefits: category?.benefits ?? "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const t = useT();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    if (!form.name.trim()) {
      setFormError(t("categoryForm.nameRequired"));
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit(form);
      onClose();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : t("categoryForm.saveFailed"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="overlay">
      <div className="modal">
        <div className="modal-head">
          <h2>{category ? t("categoryForm.editTitle", { name: category.name }) : t("categoryForm.addTitle")}</h2>
          <button onClick={onClose} className="x">
            &times;
          </button>
        </div>
        <form onSubmit={handleSubmit} className="modal-body">
          {formError && <div className="err">{formError}</div>}
          <div>
            <label className={label}>{t("categoryForm.name")}</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="grid2">
            <div>
              <label className={label}>{t("categoryForm.minSpend")}</label>
              <input
                type="number"
                min="0"
                value={form.min_annual_spend}
                onChange={(e) => setForm({ ...form, min_annual_spend: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className={label}>{t("categoryForm.maxSpend")}</label>
              <input
                type="number"
                min="0"
                placeholder={t("categoryForm.maxSpendPlaceholder")}
                value={form.max_annual_spend ?? ""}
                onChange={(e) =>
                  setForm({ ...form, max_annual_spend: e.target.value === "" ? null : Number(e.target.value) })
                }
              />
            </div>
          </div>
          <div>
            <label className={label}>{t("categoryForm.multiplier")}</label>
            <input
              type="number"
              min="0"
              step="0.1"
              value={form.point_multiplier}
              onChange={(e) => setForm({ ...form, point_multiplier: Number(e.target.value) })}
            />
          </div>
          <div>
            <label className={label}>{t("categoryForm.benefits")}</label>
            <input
              value={form.benefits}
              onChange={(e) => setForm({ ...form, benefits: e.target.value })}
            />
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
            <button type="button" className={btnSecondary} onClick={onClose}>
              {t("common.cancel")}
            </button>
            <button type="submit" className={btnPrimary} disabled={submitting}>
              {submitting ? t("common.saving") : category ? t("common.saveChanges") : t("categoryForm.addTitle")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
