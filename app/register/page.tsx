import Image from "next/image";
import { card } from "@/lib/styles";
import RegisterForm from "./RegisterForm";

export const metadata = {
  title: "会员报名 MA PLANTATION",
};

export default function RegisterPage() {
  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="text-center space-y-3">
        <Image src="/logo.jpg" alt="MA Plantation" width={80} height={80} className="mx-auto rounded" />
        <h1 className="text-xl font-semibold">MA PLANTATION 永發肥料企業 会员报名</h1>
        <p className="text-sm text-neutral-500">
          欢迎加入会员！入会免费，购买即累积积分，积分可当现金折扣用。
          <br />
          Selamat datang! Percuma, kumpul mata setiap pembelian dan guna mata sebagai diskaun tunai.
          <br />
          Welcome! Free to join. Earn points on every purchase and use them as a cash discount.
        </p>
      </div>
      <div className={card + " p-6"}>
        <RegisterForm />
      </div>
    </div>
  );
}
