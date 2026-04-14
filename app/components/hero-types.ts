export type HeroNavLabels = {
  video?: string;
  image?: string;
  reels?: string;
  story?: string;
  viewer?: string;
};

export type HeroCopy = {
  /** Main heading; use `dangerouslySetInnerHTML` when `titleHtml` is true */
  title: string;
  titleHtml?: boolean;
  subtitle: string;
  subtitleHtml?: boolean;
};

export type HeroFormLabels = {
  placeholder: string;
  paste: string;
  clear: string;
  download_btn: string;
};

export type HeroProps = {
  locale?: string;
  /** When omitted, active tab uses `usePathname()` */
  currentRoute?: string;
  nav?: HeroNavLabels;
  hero?: HeroCopy;
  form?: HeroFormLabels;
  /** Passed to `window.__USE_MOCK_API__` for legacy widget scripts */
  useMockApi?: boolean;
};

export function homeHrefForLocale(locale: string): string {
  return locale === "en" ? "/" : `/${locale}/`;
}

export function pathWithLocale(locale: string, path: string): string {
  const prefix = locale === "en" ? "" : `/${locale}`;
  if (path === "/") return `${prefix}/`;
  return `${prefix}${path.startsWith("/") ? path : `/${path}`}`;
}

export function normalizePath(path: string): string {
  if (!path) return "/";
  const p = path.split("?")[0] ?? "/";
  if (p.length > 1 && p.endsWith("/")) return p.slice(0, -1);
  return p;
}
