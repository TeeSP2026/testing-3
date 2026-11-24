import Image from "next/image";
import RegisterForm from "./RegisterForm";

export const metadata = {
  title: "会员报名 MA PLANTATION",
};

export default function RegisterPage() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", padding: "40px 16px" }}>
      <div style={{ maxWidth: 520, margin: "0 auto", display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: 10 }}>
          <Image
            src="/logo.jpg"
            alt="MA Plantation"
            width={84}
            height={84}
            style={{ margin: "0 auto", borderRadius: 10 }}
          />
          <h1>MA PLANTATION 永發肥料企業 会员报名</h1>
          <p className="muted small">
            欢迎加入会员！入会免费，购买即累积积分，积分可当现金折扣用。
            <br />
            Selamat datang! Percuma, kumpul mata setiap pembelian dan guna mata sebagai diskaun tunai.
            <br />
            Welcome! Free to join. Earn points on every purchase and use them as a cash discount.
          </p>
        </div>
        <div className="panel">
          <RegisterForm />
        </div>
      </div>
    </div>
  );
}
