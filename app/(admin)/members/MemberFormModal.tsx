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
    nickname: member?.nickname ?? "",
    gender: member?.gender ?? "",
    date_of_birth: member?.date_of_birth ?? "",
    mobile_number: member?.mobile_number ?? "",
    email_address: member?.email_address ?? "",
    address: member?.address ?? "",
    ic_number: member?.ic_number ?? "",
    state: member?.state ?? "",
    town_area: member?.town_area ?? "",
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
    <div className="overlay">
      <div className="modal">
        <div className="modal-head">
          <h2>{member ? "Edit Member" : "Add Member"}</h2>
          <button onClick={onClose} className="x">
            &times;
          </button>
        </div>
        <form onSubmit={handleSubmit} className="modal-body">
          {formError && <div className="err">{formError}</div>}
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={label}>Nickname</label>
              <input
                className={input}
                value={form.nickname}
                onChange={(e) => setForm({ ...form, nickname: e.target.value })}
              />
            </div>
            <div>
              <label className={label}>IC Number</label>
              <input
                className={input}
                value={form.ic_number}
                onChange={(e) => setForm({ ...form, ic_number: e.target.value })}
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={label}>State</label>
              <input
                className={input}
                value={form.state}
                onChange={(e) => setForm({ ...form, state: e.target.value })}
              />
            </div>
            <div>
              <label className={label}>Town / Area</label>
              <input
                className={input}
                value={form.town_area}
                onChange={(e) => setForm({ ...form, town_area: e.target.value })}
              />
            </div>
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
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
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
