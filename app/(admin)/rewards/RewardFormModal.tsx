"use client";

import { useState } from "react";
import { Reward } from "@/lib/types";
import { btnPrimary, btnSecondary, input, label } from "@/lib/styles";
import { RewardFormInput } from "./actions";
import { useT } from "@/lib/i18n/context";

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
  const t = useT();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    if (!form.name.trim()) {
      setFormError(t("rewardForm.nameRequired"));
      return;
    }
    if (form.points_required <= 0) {
      setFormError(t("rewardForm.pointsRequiredInvalid"));
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit(form);
      onClose();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : t("rewardForm.saveFailed"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="overlay">
      <div className="modal">
        <div className="modal-head">
          <h2>{reward ? t("rewardForm.editTitle") : t("rewardForm.addTitle")}</h2>
          <button onClick={onClose} className="x">
            &times;
          </button>
        </div>
        <form onSubmit={handleSubmit} className="modal-body">
          {formError && <div className="err">{formError}</div>}
          <div>
            <label className={label}>{t("rewardForm.name")}</label>
            <input className={input} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className={label}>{t("rewardForm.description")}</label>
            <input
              className={input}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={label}>{t("rewardForm.pointsRequired")}</label>
              <input
                type="number"
                min="1"
                className={input}
                value={form.points_required}
                onChange={(e) => setForm({ ...form, points_required: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className={label}>{t("rewardForm.minRedemption")}</label>
              <input
                type="number"
                min="0"
                className={input}
                value={form.minimum_redemption_points}
                onChange={(e) => setForm({ ...form, minimum_redemption_points: Number(e.target.value) })}
              />
            </div>
          </div>
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14 }}>
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
            />
            {t("rewardForm.activeLabel")}
          </label>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
            <button type="button" className={btnSecondary} onClick={onClose}>
              {t("common.cancel")}
            </button>
            <button type="submit" className={btnPrimary} disabled={submitting}>
              {submitting ? t("common.saving") : reward ? t("common.saveChanges") : t("rewardForm.addTitle")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
