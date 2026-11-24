import QRCode from "qrcode";
import { card } from "@/lib/styles";
import PrintButton from "./PrintButton";

export default async function RegisterQrPage() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const registerUrl = `${baseUrl.replace(/\/$/, "")}/register`;
  const qrDataUrl = await QRCode.toDataURL(registerUrl, { width: 480, margin: 2 });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Register QR / 会员报名二维码</h1>
        <p className="text-sm text-neutral-500">
          打印这张海报贴在店里，顾客扫码就能自己填资料报名。
        </p>
      </div>

      <div className={card + " p-8 max-w-md mx-auto text-center space-y-4 print:border-none print:shadow-none"}>
        <h2 className="text-lg font-semibold">MA PLANTATION 永發肥料企業</h2>
        <p className="text-sm text-neutral-600">扫码报名会员 / Imbas untuk daftar / Scan to join</p>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={qrDataUrl} alt="Registration QR code" className="mx-auto" />
        <p className="text-xs text-neutral-400 break-all">{registerUrl}</p>
      </div>

      <div className="text-center print:hidden">
        <PrintButton />
      </div>
    </div>
  );
}
