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
          <div className="lh-en">永發肥料企業</div>
          <p className="lh-tag">
            会员积分管理系统
            <br />
            Member loyalty &amp; points management
          </p>
        </div>
        <div className="login">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
