/**
 * Open Graph `og:locale` values (language_territory) for each site locale code.
 * @see https://ogp.me/#optional
 */
const OG_LOCALE_BY_CODE: Record<string, string> = {
  en: "en",
  ar: "ar",
  de: "de",
  es: "es",
  fr: "fr",
  hi: "hi",
  hu: "hu",
  id: "id",
  it: "it",
  ja: "ja",
  ms: "ms",
  pl: "pl",
  pt: "pt",
  ro: "ro",
  ru: "ru",
  th: "th",
  tr: "tr",
  vi: "vi",
  zh: "zh",
};

export function openGraphLocaleForSiteLocale(locale: string): string {
  const key = locale.toLowerCase();
  return OG_LOCALE_BY_CODE[key] ?? "en";
}
