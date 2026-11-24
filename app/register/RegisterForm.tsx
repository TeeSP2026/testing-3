"use client";

import { useState } from "react";
import { input, label, btnPrimary } from "@/lib/styles";
import { submitRegistration, RegistrationInput } from "./actions";

const STATES = [
  "Kedah", "Perlis", "Pulau Pinang", "Perak", "Selangor", "Negeri Sembilan",
  "Melaka", "Johor", "Pahang", "Terengganu", "Kelantan", "Sabah", "Sarawak",
];

const EMPTY: RegistrationInput = {
  full_name: "",
  nickname: "",
  mobile_number: "",
  ic_number: "",
  date_of_birth: "",
  address: "",
  state: "",
  town_area: "",
  referred_by: "",
  consent: false,
};

export default function RegisterForm() {
  const [form, setForm] = useState<RegistrationInput>(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await submitRegistration(form);
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submission failed.");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="text-center space-y-2 py-10">
        <h1 className="text-xl font-semibold">谢谢！我们核实后就会开通你的会员。</h1>
        <p className="text-neutral-600">Terima kasih! Keahlian anda akan diaktifkan selepas kami menyemak.</p>
        <p className="text-neutral-600">Thank you! Your membership will be activated after we check it.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      <div>
        <label className={label}>姓名 / Nama penuh / Name *</label>
        <input
          className={input}
          value={form.full_name}
          onChange={(e) => setForm({ ...form, full_name: e.target.value })}
          required
        />
      </div>

      <div>
        <label className={label}>花名（可不填） / Nama panggilan (tidak wajib) / Nickname (optional)</label>
        <input className={input} value={form.nickname} onChange={(e) => setForm({ ...form, nickname: e.target.value })} />
      </div>

      <div>
        <label className={label}>电话 / Nombor telefon / Phone number *</label>
        <input
          className={input}
          placeholder="012-345 6789"
          value={form.mobile_number}
          onChange={(e) => setForm({ ...form, mobile_number: e.target.value })}
          required
        />
      </div>

      <div>
        <label className={label}>身份证号码（可不填） / Nombor Kad Pengenalan (tidak wajib) / IC number (optional)</label>
        <input
          className={input}
          placeholder="850312-10-5678"
          value={form.ic_number}
          onChange={(e) => setForm({ ...form, ic_number: e.target.value })}
        />
      </div>

      <div>
        <label className={label}>生日（可不填） / Tarikh lahir (tidak wajib) / Date of birth (optional)</label>
        <input
          type="date"
          className={input}
          value={form.date_of_birth}
          onChange={(e) => setForm({ ...form, date_of_birth: e.target.value })}
        />
      </div>

      <div>
        <label className={label}>地址（可不填） / Alamat (tidak wajib) / Address (optional)</label>
        <textarea
          className={input}
          rows={2}
          value={form.address}
          onChange={(e) => setForm({ ...form, address: e.target.value })}
        />
      </div>

      <div>
        <label className={label}>州属 / Negeri / State</label>
        <select className={input} value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })}>
          <option value="">—</option>
          {STATES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <div>
        <label className={label}>城镇 / 地区 / Bandar / Kawasan / Town / Area</label>
        <input className={input} value={form.town_area} onChange={(e) => setForm({ ...form, town_area: e.target.value })} />
      </div>

      <div>
        <label className={label}>介绍人（可不填） / Dirujuk oleh (tidak wajib) / Referred by (optional)</label>
        <input className={input} value={form.referred_by} onChange={(e) => setForm({ ...form, referred_by: e.target.value })} />
      </div>

      <div className="flex items-start gap-2">
        <input
          type="checkbox"
          id="consent"
          className="mt-1"
          checked={form.consent}
          onChange={(e) => setForm({ ...form, consent: e.target.checked })}
          required
        />
        <label htmlFor="consent" className="text-sm text-neutral-700">
          我同意店家保存以上资料，只用于会员积分和联络。 / Saya bersetuju kedai menyimpan butiran di atas untuk mata ahli dan perhubungan sahaja. / I agree the shop may keep the details above, used only for member points and contact.
        </label>
      </div>

      <button type="submit" className={btnPrimary + " w-full"} disabled={submitting}>
        {submitting ? "提交中… / Menghantar… / Submitting…" : "提交 / Hantar / Submit"}
      </button>
    </form>
  );
}
