"use client";

import { btnPrimary } from "@/lib/styles";

export default function PrintButton() {
  return (
    <button className={btnPrimary} onClick={() => window.print()}>
      Print poster
    </button>
  );
}
