import QRCode from "qrcode";
import PrintButton from "./PrintButton";
import { getT } from "@/lib/i18n/server";

export default async function RegisterQrPage() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const registerUrl = `${baseUrl.replace(/\/$/, "")}/register`;
  const qrDataUrl = await QRCode.toDataURL(registerUrl, { width: 440, margin: 2 });
  const t = await getT();

  return (
    <>
      <div className="page-head">
        <div>
          <h1>{t("registerQr.title")}</h1>
          <p>{t("registerQr.subtitle")}</p>
        </div>
      </div>

      <div className="poster" style={{ maxWidth: 420, margin: "0 auto" }}>
        <div className="poster-top">MA PLANTATION 永發肥料企業</div>
        <div className="poster-body">
          <h3>{t("registerQr.scanTitle")}</h3>
          <p>{t("registerQr.scanTag")}</p>
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
