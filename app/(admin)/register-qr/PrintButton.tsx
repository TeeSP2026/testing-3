"use client";

import { btnPrimary } from "@/lib/styles";
import { useT } from "@/lib/i18n/context";

export default function PrintButton() {
  const t = useT();
  return (
    <button className={btnPrimary} onClick={() => window.print()}>
      {t("registerQr.printButton")}
    </button>
  );
}
