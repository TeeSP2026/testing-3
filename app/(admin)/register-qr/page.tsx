import QRCode from "qrcode";
import PrintButton from "./PrintButton";

export default async function RegisterQrPage() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const registerUrl = `${baseUrl.replace(/\/$/, "")}/register`;
  const qrDataUrl = await QRCode.toDataURL(registerUrl, { width: 440, margin: 2 });

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Register QR / 会员报名二维码</h1>
          <p>打印这张海报贴在店里，顾客扫码就能自己填资料报名。</p>
        </div>
      </div>

      <div className="poster" style={{ maxWidth: 420, margin: "0 auto" }}>
        <div className="poster-top">MA PLANTATION 永發肥料企業</div>
        <div className="poster-body">
          <h3>扫码报名会员</h3>
          <p>Imbas untuk daftar / Scan to join</p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qrDataUrl} alt="Registration QR code" className="qr-box" />
          <p className="muted small" style={{ wordBreak: "break-all" }}>{registerUrl}</p>
        </div>
      </div>

      <div style={{ textAlign: "center" }} className="print:hidden">
        <PrintButton />
      </div>
    </>
  );
}
