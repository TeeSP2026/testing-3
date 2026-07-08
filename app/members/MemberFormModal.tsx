"use client";

import { useState } from "react";
import { MemberWithCategory, MembershipCategory } from "@/lib/types";
import { btnPrimary, btnSecondary, input, label } from "@/lib/styles";
import { MemberFormInput } from "./actions";

export default function MemberFormModal({
  categories,
  member,
  onClose,
  onSubmit,
}: {
  categories: MembershipCategory[];
  member?: MemberWithCategory;
  onClose: () => void;
  onSubmit: (input: MemberFormInput) => Promise<void>;
}) {
  const [form, setForm] = useState<MemberFormInput>({
    full_name: member?.full_name ?? "",
    gender: member?.gender ?? "",
    date_of_birth: member?.date_of_birth ?? "",
    mobile_number: member?.mobile_number ?? "",
    email_address: member?.email_address ?? "",
    address: member?.address ?? "",
    category_id: member?.category_id ?? categories[0]?.id ?? "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    if (!form.full_name.trim()) {
      setFormError("Full name is required.");
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit(form);
      onClose();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to save member.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-20 p-4">
      <div className="bg-white rounded-xl shadow-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between">
          <h2 className="font-semibold text-lg">{member ? "Edit Member" : "Add Member"}</h2>
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
            <label className={label}>Full Name *</label>
            <input
              className={input}
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={label}>Gender</label>
              <select
                className={input}
                value={form.gender}
                onChange={(e) => setForm({ ...form, gender: e.target.value })}
              >
                <option value="">—</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
            <div>
              <label className={label}>Date of Birth</label>
              <input
                type="date"
                className={input}
                value={form.date_of_birth}
                onChange={(e) => setForm({ ...form, date_of_birth: e.target.value })}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={label}>Mobile Number</label>
              <input
                className={input}
                value={form.mobile_number}
                onChange={(e) => setForm({ ...form, mobile_number: e.target.value })}
              />
            </div>
            <div>
              <label className={label}>Email Address</label>
              <input
                type="email"
                className={input}
                value={form.email_address}
                onChange={(e) => setForm({ ...form, email_address: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className={label}>Address</label>
            <input
              className={input}
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />
          </div>
          <div>
            <label className={label}>Membership Category</label>
            <select
              className={input}
              value={form.category_id}
              onChange={(e) => setForm({ ...form, category_id: e.target.value })}
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className={btnSecondary} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className={btnPrimary} disabled={submitting}>
              {submitting ? "Saving…" : member ? "Save Changes" : "Add Member"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
