"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Reward } from "@/lib/types";
import { btnPrimary } from "@/lib/styles";
import { createReward, updateReward, RewardFormInput } from "./actions";
import RewardFormModal from "./RewardFormModal";
import { useT } from "@/lib/i18n/context";

export default function RewardsClient({ initialRewards }: { initialRewards: Reward[] }) {
  const t = useT();
  const router = useRouter();
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<Reward | null>(null);

  async function handleAdd(input: RewardFormInput) {
    await createReward(input);
    router.refresh();
  }

  async function handleEdit(input: RewardFormInput) {
    if (!editing) return;
    await updateReward(editing.id, input);
    router.refresh();
  }

  return (
    <>
      <div className="page-head">
        <div>
          <h1>{t("rewards.title")}</h1>
          <p>{t("rewards.subtitle")}</p>
        </div>
        <button className={btnPrimary} onClick={() => setShowAdd(true)}>
          {t("rewards.addReward")}
        </button>
      </div>

      <div className="panel">
        {initialRewards.length === 0 ? (
          <p className="empty">{t("rewards.noRewards")}</p>
        ) : (
          <div className="tbl-wrap">
            <table>
              <thead>
                <tr>
                  <th>{t("rewards.colName")}</th>
                  <th>{t("rewards.colDescription")}</th>
                  <th className="r">{t("rewards.colPointsRequired")}</th>
                  <th className="r">{t("rewards.colMinRedemption")}</th>
                  <th>{t("rewards.colStatus")}</th>
                  <th className="r">{t("rewards.colActions")}</th>
                </tr>
              </thead>
              <tbody>
                {initialRewards.map((r) => (
                  <tr key={r.id}>
                    <td>{r.name}</td>
                    <td className="muted">{r.description ?? "—"}</td>
                    <td className="r">{r.points_required.toLocaleString()}</td>
                    <td className="r">{r.minimum_redemption_points.toLocaleString()}</td>
                    <td>
                      <span className={r.is_active ? "pill ok" : "pill line"}>
                        {r.is_active ? t("rewards.statusActive") : t("rewards.statusInactive")}
                      </span>
                    </td>
                    <td className="r">
                      <button style={{ all: "unset", color: "var(--blue)", cursor: "pointer" }} onClick={() => setEditing(r)}>
                        {t("common.edit")}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showAdd && <RewardFormModal onClose={() => setShowAdd(false)} onSubmit={handleAdd} />}
      {editing && <RewardFormModal reward={editing} onClose={() => setEditing(null)} onSubmit={handleEdit} />}
    </>
  );
}
