import { notFound } from "next/navigation";
import { LOCALE_PREFIX_SET } from "@/lib/i18n-config";

/** Lowercase locale from dynamic segment; triggers notFound if unknown. */
export function parseLocaleParam(raw: string | undefined): string {
  const locale = (raw ?? "").trim().toLowerCase();
  if (!locale || !LOCALE_PREFIX_SET.has(locale)) notFound();
  return locale;
}
