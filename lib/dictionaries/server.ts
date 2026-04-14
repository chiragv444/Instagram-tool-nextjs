import { existsSync, readFileSync } from "fs";
import path from "path";
import { cache } from "react";
import { stripLocaleFromPath } from "@/lib/i18n-config";
import { normalizePageDictionary } from "./normalize";
import type { DictionaryPageKey, PageDictionary } from "./types";

export type { DictionaryPageKey, PageDictionary } from "./types";

function readDictionaryRaw(
  page: DictionaryPageKey,
  locale: string,
): Record<string, unknown> {
  const base = path.join(process.cwd(), "dictionaries", page);
  const target = path.join(base, `${locale}.json`);
  const fallback = path.join(base, "en.json");
  const file = existsSync(target) ? target : fallback;
  const text = readFileSync(file, "utf-8");
  return JSON.parse(text) as Record<string, unknown>;
}

export const getCachedPageDictionary = cache(
  (page: DictionaryPageKey, locale: string): PageDictionary => {
    return normalizePageDictionary(readDictionaryRaw(page, locale));
  },
);

/** Map URL path (no locale prefix) to dictionary folder. */
export function getDictionaryPageKeyFromPath(pathWithoutLocale: string): DictionaryPageKey {
  const p = (pathWithoutLocale.replace(/\/$/, "") || "/").toLowerCase();
  if (p === "/" || p === "") return "video";
  if (p.startsWith("/instagram-photo-downloader")) return "photo";
  if (p.startsWith("/instagram-reels-downloader")) return "reels";
  if (p.startsWith("/instagram-story-downloader")) return "story";
  if (p.startsWith("/instagram-story-viewer")) return "viewer";
  return "video";
}

export function getDictionaryKeyForRequestPathname(
  pathname: string,
): DictionaryPageKey {
  const { path } = stripLocaleFromPath(pathname);
  return getDictionaryPageKeyFromPath(path);
}

export const getDefaultFooterContent = cache(() => {
  return getCachedPageDictionary("video", "en").footer;
});
