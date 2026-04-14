import type { Metadata } from "next";
import { LOCALE_PREFIX_CODES } from "@/lib/i18n-config";
import type { DictionaryPageKey } from "@/lib/dictionaries/types";

/** Path segment for each tool route (matches marketing app routes and trailingSlash). */
const MARKETING_PATH: Record<DictionaryPageKey, string> = {
  video: "/",
  photo: "/instagram-photo-downloader/",
  reels: "/instagram-reels-downloader/",
  story: "/instagram-story-downloader/",
  viewer: "/instagram-story-viewer/",
};

/**
 * Root URL for metadata resolution. Required so Next.js turns relative `alternates` into * absolute `<link rel="canonical">` / `hreflang` in the HTML head.
 *
 * - Production: set `NEXT_PUBLIC_SITE_URL` (e.g. `https://saveinstavideo.io`)
 * - Vercel: falls back to `VERCEL_URL`
 * - Local: `http://localhost:$PORT` (default port 3000)
 */
export function getDefaultMetadataBase(): URL {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) {
    const normalized = explicit.replace(/\/+$/, "");
    return new URL(`${normalized}/`);
  }
  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) {
    const host = vercel.replace(/^https?:\/\//, "").replace(/\/+$/, "");
    return new URL(`https://${host}/`);
  }
  const port = process.env.PORT || "3000";
  return new URL(`http://localhost:${port}/`);
}

/** Localized pathname starting with `/`, with trailing slash (except root is `/`). */
export function marketingPathForLocale(locale: string, pageKey: DictionaryPageKey): string {
  const suffix = MARKETING_PATH[pageKey];
  if (locale === "en") return suffix;
  if (suffix === "/") return `/${locale}/`;
  return `/${locale}${suffix}`;
}

/**
 * Path-only canonical + hreflang alternates (resolved to absolute URLs via `metadataBase` in root layout).
 */
export function buildMarketingHreflang(
  locale: string,
  pageKey: DictionaryPageKey,
): Metadata["alternates"] {
  const canonical = marketingPathForLocale(locale, pageKey);
  const languages: Record<string, string> = {};

  languages.en = marketingPathForLocale("en", pageKey);
  for (const code of [...LOCALE_PREFIX_CODES].sort((a, b) => a.localeCompare(b))) {
    languages[code] = marketingPathForLocale(code, pageKey);
  }
  languages["x-default"] = marketingPathForLocale("en", pageKey);

  return {
    canonical,
    languages,
  };
}
