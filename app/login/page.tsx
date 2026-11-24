import Image from "next/image";
import LoginForm from "./LoginForm";

export const metadata = {
  title: "登入 MA PLANTATION",
};

export default function LoginPage() {
  return (
    <div className="login-wrap">
      <div className="login-shell">
        <div className="login-hero">
          <div className="lh-logo">
            <Image src="/logo.jpg" alt="MA Plantation" width={168} height={124} className="brand-logo" />
          </div>
          <div className="lh-name">MA PLANTATION</div>
          <div className="lh-en">永發肥料企業 · Sistem Keahlian</div>
          <p className="lh-tag">
            会员积分管理系统
            <br />
            Sistem pengurusan mata keahlian
            <br />
            Member loyalty &amp; points management system
          </p>
          <ul className="lh-points">
            <li>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 6L9 17l-5-5" />
              </svg>
              <span>
                免费入会，购买即累积积分
                <br />
                Percuma menyertai, kumpul mata setiap pembelian
                <br />
                Free to join, earn points on every purchase
              </span>
            </li>
            <li>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 6L9 17l-5-5" />
              </svg>
              <span>
                积分可当现金折扣使用
                <br />
                Guna mata sebagai diskaun tunai
                <br />
                Use points as a cash discount
              </span>
            </li>
            <li>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 6L9 17l-5-5" />
              </svg>
              <span>
                扫码报名，员工核实后开通
                <br />
                Daftar dengan kod QR, diaktifkan selepas semakan
                <br />
                QR sign-up, activated after staff review
              </span>
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
