"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Reward } from "@/lib/types";
import { btnPrimary, card } from "@/lib/styles";
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Rewards Catalogue</h1>
          <p className="text-sm text-neutral-500">Manage rewards members can redeem with points.</p>
        </div>
        <button className={btnPrimary} onClick={() => setShowAdd(true)}>
          + Add Reward
        </button>
      </div>

      <div className={card + " overflow-hidden"}>
        {initialRewards.length === 0 ? (
          <p className="p-10 text-center text-sm text-neutral-500">No rewards yet — add one.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 text-neutral-500 text-xs uppercase tracking-wide">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Name</th>
                <th className="text-left px-4 py-3 font-medium">Description</th>
                <th className="text-left px-4 py-3 font-medium">Points Required</th>
                <th className="text-left px-4 py-3 font-medium">Min. Redemption</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-right px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {initialRewards.map((r) => (
                <tr key={r.id} className="hover:bg-neutral-50">
                  <td className="px-4 py-3 font-medium">{r.name}</td>
                  <td className="px-4 py-3 text-neutral-500">{r.description ?? "—"}</td>
                  <td className="px-4 py-3">{r.points_required.toLocaleString()}</td>
                  <td className="px-4 py-3">{r.minimum_redemption_points.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        r.is_active ? "bg-green-100 text-green-700" : "bg-neutral-200 text-neutral-600"
                      }`}
                    >
                      {r.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button className="text-xs text-neutral-600 hover:underline" onClick={() => setEditing(r)}>
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showAdd && <RewardFormModal onClose={() => setShowAdd(false)} onSubmit={handleAdd} />}
      {editing && <RewardFormModal reward={editing} onClose={() => setEditing(null)} onSubmit={handleEdit} />}
    </div>
  );
}
