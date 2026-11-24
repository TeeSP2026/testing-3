import Image from "next/image";
import LoginForm from "./LoginForm";
import LanguageSwitcher from "@/lib/i18n/LanguageSwitcher";
import { getT } from "@/lib/i18n/server";

export const metadata = {
  title: "登入 MA PLANTATION",
};

export default async function LoginPage() {
  const t = await getT();
  return (
    <div className="login-wrap">
      <div className="login-shell">
        <div className="login-lang">
          <LanguageSwitcher />
        </div>
        <div className="login-hero">
          <div className="lh-logo">
            <Image src="/logo.jpg" alt="MA Plantation" width={168} height={124} className="brand-logo" />
          </div>
          <div className="lh-name">MA PLANTATION</div>
          <div className="lh-en">{t("login.brandSub")}</div>
          <p className="lh-tag">{t("login.tagline")}</p>
          <ul className="lh-points">
            <li>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 6L9 17l-5-5" />
              </svg>
              <span>{t("login.bullet1")}</span>
            </li>
            <li>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 6L9 17l-5-5" />
              </svg>
              <span>{t("login.bullet2")}</span>
            </li>
            <li>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 6L9 17l-5-5" />
              </svg>
              <span>{t("login.bullet3")}</span>
            </li>
          </ul>
        </div>
        <div className="login">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
