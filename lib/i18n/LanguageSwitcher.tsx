"use client";

import { useRouter } from "next/navigation";
import { useLocale } from "./context";
import { Locale, LOCALE_COOKIE } from "./translations";

const OPTIONS: { code: Locale; label: string }[] = [
  { code: "zh", label: "华语" },
  { code: "en", label: "English" },
  { code: "ms", label: "BM" },
];

export default function LanguageSwitcher() {
  const router = useRouter();
  const current = useLocale();

  function setLocale(code: Locale) {
    if (code === current) return;
    document.cookie = `${LOCALE_COOKIE}=${code}; path=/; max-age=31536000`;
    router.refresh();
  }

  return (
    <div className="lang-switch">
      {OPTIONS.map((o) => (
        <button
          key={o.code}
          type="button"
          className={current === o.code ? "on" : ""}
          onClick={() => setLocale(o.code)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
