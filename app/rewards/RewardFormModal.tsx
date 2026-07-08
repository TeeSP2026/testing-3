"use client";

import { useState } from "react";
import { Reward } from "@/lib/types";
import { btnPrimary, btnSecondary, input, label } from "@/lib/styles";
import { RewardFormInput } from "./actions";

export default function RewardFormModal({
  reward,
  onClose,
  onSubmit,
}: {
  reward?: Reward;
  onClose: () => void;
  onSubmit: (input: RewardFormInput) => Promise<void>;
}) {
  const [form, setForm] = useState<RewardFormInput>({
    name: reward?.name ?? "",
    description: reward?.description ?? "",
    points_required: reward?.points_required ?? 500,
    minimum_redemption_points: reward?.minimum_redemption_points ?? 100,
    is_active: reward?.is_active ?? true,
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    if (!form.name.trim()) {
      setFormError("Reward name is required.");
      return;
    }
    if (form.points_required <= 0) {
      setFormError("Points required must be greater than 0.");
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit(form);
      onClose();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to save reward.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-20 p-4">
      <div className="bg-white rounded-xl shadow-lg max-w-md w-full">
        <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between">
          <h2 className="font-semibold text-lg">{reward ? "Edit Reward" : "Add Reward"}</h2>
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
          <div>
            <label className={label}>Name *</label>
            <input className={input} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className={label}>Description</label>
            <input
              className={input}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={label}>Points Required</label>
              <input
                type="number"
                min="1"
                className={input}
                value={form.points_required}
                onChange={(e) => setForm({ ...form, points_required: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className={label}>Minimum Redemption Points</label>
              <input
                type="number"
                min="0"
                className={input}
                value={form.minimum_redemption_points}
                onChange={(e) => setForm({ ...form, minimum_redemption_points: Number(e.target.value) })}
              />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
            />
            Active (visible to staff for redemption)
          </label>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className={btnSecondary} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className={btnPrimary} disabled={submitting}>
              {submitting ? "Saving…" : reward ? "Save Changes" : "Add Reward"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
