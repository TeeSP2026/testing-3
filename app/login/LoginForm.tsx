"use client";

import { useActionState } from "react";
import { signIn } from "./actions";
import { useT } from "@/lib/i18n/context";

const initialState = { error: "" };

export default function LoginForm() {
  const t = useT();
  const [state, formAction, pending] = useActionState(async (_prev: typeof initialState, formData: FormData) => {
    const result = await signIn(formData);
    return result ?? initialState;
  }, initialState);

  return (
    <form action={formAction} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div className="lg-head">
        <h2>{t("login.title")}</h2>
        <p>{t("login.subtitle")}</p>
      </div>
      {state?.error && <p className="err">{state.error}</p>}
      <div>
        <label className="lbl">{t("login.usernameLabel")}</label>
        <input name="email" autoComplete="username" required />
      </div>
      <div>
        <label className="lbl">{t("login.passwordLabel")}</label>
        <input name="password" type="password" autoComplete="current-password" required />
      </div>
      <button type="submit" className="btn lg-btn" disabled={pending} style={{ width: "100%" }}>
        {pending ? t("login.submitting") : t("login.submit")}
      </button>
    </form>
  );
}
