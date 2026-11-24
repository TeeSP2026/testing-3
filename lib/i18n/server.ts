import { cookies } from "next/headers";
import { DEFAULT_LOCALE, Locale, LOCALE_COOKIE, LOCALES, translate } from "./translations";

export async function getLocale(): Promise<Locale> {
  const store = await cookies();
  const value = store.get(LOCALE_COOKIE)?.value;
  return (LOCALES as string[]).includes(value ?? "") ? (value as Locale) : DEFAULT_LOCALE;
}

export async function getT() {
  const locale = await getLocale();
  return (key: string, vars?: Record<string, string | number>) => translate(locale, key, vars);
}
