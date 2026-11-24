"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Reward } from "@/lib/types";
import { btnPrimary } from "@/lib/styles";
import { createReward, updateReward, RewardFormInput } from "./actions";
import RewardFormModal from "./RewardFormModal";

export default function RewardsClient({ initialRewards }: { initialRewards: Reward[] }) {
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
          <h1>Rewards Catalogue</h1>
          <p>Manage rewards members can redeem with points.</p>
        </div>
        <button className={btnPrimary} onClick={() => setShowAdd(true)}>
          + Add Reward
        </button>
      </div>

      <div className="panel">
        {initialRewards.length === 0 ? (
          <p className="empty">No rewards yet — add one.</p>
        ) : (
          <div className="tbl-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Description</th>
                  <th className="r">Points Required</th>
                  <th className="r">Min. Redemption</th>
                  <th>Status</th>
                  <th className="r">Actions</th>
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
                        {r.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="r">
                      <button style={{ all: "unset", color: "var(--blue)", cursor: "pointer" }} onClick={() => setEditing(r)}>
                        Edit
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
