// Locale list must match each dictionaries folder (en.json, pt.json, etc.). English has no URL prefix.
export const LOCALE_PREFIX_CODES = [
  "ar",
  "de",
  "es",
  "fr",
  "hi",
  "hu",
  "id",
  "it",
  "ja",
  "ms",
  "pl",
  "pt",
  "ro",
  "ru",
  "th",
  "tr",
  "vi",
  "zh",
] as const;

export type LocalePrefix = (typeof LOCALE_PREFIX_CODES)[number];

export const LOCALE_PREFIX_SET = new Set<string>(LOCALE_PREFIX_CODES);

/**
 * Strip leading locale segment when locale is a non-English prefix (e.g. /pt/...).
 * Returns pathname without that segment; result always starts with "/".
 */
export function stripLocaleFromPath(pathname: string): {
  locale: string;
  path: string;
} {
  const raw = pathname?.trim() || "/";
  const normalized = raw.startsWith("/") ? raw : "/" + raw;
  const parts = normalized.split("/").filter(Boolean);
  const first = parts[0];
  const firstLower = first?.toLowerCase();
  if (firstLower && LOCALE_PREFIX_SET.has(firstLower)) {
    const rest = parts.slice(1).join("/");
    return { locale: firstLower, path: rest ? "/" + rest : "/" };
  }
  return { locale: "en", path: normalized === "" ? "/" : normalized };
}
