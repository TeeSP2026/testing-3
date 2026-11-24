"use client";

import { useActionState } from "react";
import { signIn } from "./actions";

const initialState = { error: "" };

export default function LoginForm() {
  const [state, formAction, pending] = useActionState(async (_prev: typeof initialState, formData: FormData) => {
    const result = await signIn(formData);
    return result ?? initialState;
  }, initialState);

  return (
    <form action={formAction} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div className="lg-head">
        <h2>登入 Login</h2>
        <p>员工 / 管理员登入系统</p>
      </div>
      {state?.error && <p className="err">{state.error}</p>}
      <div>
        <label className="lbl">用户名或邮箱 / Username or Email</label>
        <input name="email" autoComplete="username" required />
      </div>
      <div>
        <label className="lbl">密码 / Password</label>
        <input name="password" type="password" autoComplete="current-password" required />
      </div>
      <button type="submit" className="btn lg-btn" disabled={pending} style={{ width: "100%" }}>
        {pending ? "登入中… / Logging in…" : "登入 Login"}
      </button>
    </form>
  );
}
