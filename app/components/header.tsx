"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { stripLocaleFromPath } from "@/lib/i18n-config";

const LANGUAGES: { code: string; label: string }[] = [
  { code: "en", label: "English" },
  { code: "id", label: "Bahasa Indonesia" },
  { code: "vi", label: "Tiếng Việt" },
  { code: "ms", label: "Bahasa Malaysia" },
  { code: "es", label: "Español" },
  { code: "fr", label: "Français" },
  { code: "de", label: "German" },
  { code: "hu", label: "Hungary" },
  { code: "it", label: "Italian" },
  { code: "pl", label: "Polish" },
  { code: "pt", label: "Português" },
  { code: "ro", label: "Romanian" },
  { code: "th", label: "Thai" },
  { code: "tr", label: "Turkish" },
  { code: "ru", label: "Русский" },
  { code: "hi", label: "हिंदी" },
  { code: "zh", label: "中文(简体)" },
  { code: "ja", label: "日本語" },
  { code: "ar", label: "عربي" },
];

const STATIC_HOME_ONLY_ROUTES = new Set([
  "/faq",
  "/privacy-policy",
  "/terms-of-service",
  "/about-us",
  "/contact-us",
]);

function defaultGetLanguageRoute(langCode: string): string {
  return `/${langCode}`;
}

function normalizePathForRoute(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  if (p.length > 1 && p.endsWith("/")) return p.slice(0, -1);
  return p;
}

function getRoutePath(currentRoute: string | undefined): string {
  if (typeof currentRoute !== "string") return "";
  const { path } = stripLocaleFromPath(currentRoute);
  const p = normalizePathForRoute(path);
  if (p === "/") return "";
  if (STATIC_HOME_ONLY_ROUTES.has(p)) return "";
  return p;
}

function makeLanguageHref(
  langCode: string,
  currentRoute: string | undefined,
  getLanguageRoute?: (code: string) => string
): string {
  const prefix =
    langCode === "en"
      ? ""
      : (getLanguageRoute?.(langCode) ?? defaultGetLanguageRoute(langCode));
  const routePath = getRoutePath(currentRoute);
  return `${prefix}${routePath}/`;
}

export type HeaderProps = {
  logoHref?: string;
  /** Override detected path (e.g. from server). Defaults to `usePathname()`. */
  currentRoute?: string;
  getLanguageRoute?: (langCode: string) => string;
};

export default function Header({
  logoHref = "/",
  currentRoute: currentRouteProp,
  getLanguageRoute,
}: HeaderProps) {
  const pathname = usePathname();
  const currentRoute = currentRouteProp ?? pathname ?? "/";

  return (
    <header className="bg-white z-50">
      <div className="flex items-center justify-between py-3 container max-w-6xl mx-auto px-4">
        <div className="flex items-center gap-4">
          <Link href={logoHref} className="text-xl font-bold flex items-center gap-2">
            <Image
              src="/img/SaveInstaVideo.svg"
              alt="logo"
              width={120}
              height={24}
              className="h-4 sm:h-6 w-auto"
              unoptimized
            />
          </Link>
        </div>
        <div className="flex items-center sm:gap-4 gap-2">
          <div className="flex items-center gap-10">
            <div
              id="lang-dropdown"
              className="relative has-dropdown group"
            >
              <button
                id="lang-dropdown-trigger"
                type="button"
                aria-haspopup="true"
                aria-expanded="false"
                className="flex items-center gap-2 bg-white drop-shadow-[0_0_24px_rgba(0,0,0,0.1)] px-2 md:px-5 py-2 md:py-3 rounded-full cursor-pointer"
              >
                <Image
                  src="/img/translation.svg"
                  alt=""
                  width={20}
                  height={20}
                  className="w-5 h-5"
                  unoptimized
                />
                <svg
                  className="w-5 h-5 text-[#cb2444]"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden
                >
                  <path
                    fillRule="evenodd"
                    d="M5.23 7.21a.75.75 0 011.06.02L10 11.293l3.71-4.06a.75.75 0 111.12 1l-4.25 4.656a.75.75 0 01-1.12 0L5.21 8.27a.75.75 0 01.02-1.06z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
              <div
                id="lang-dropdown-menu"
                className="hidden group-hover:block absolute right-0 top-[36px] mt-2 bg-white border border-gray-200 shadow-md rounded-md p-1 md:p-2 w-[168px]"
              >
                <ul className="list-none">
                  {LANGUAGES.map(({ code, label }) => (
                    <li key={code}>
                      <Link
                        href={makeLanguageHref(code, currentRoute, getLanguageRoute)}
                        className="block px-3 md:py-2 py-1 text-sm text-gray-700 hover:bg-gray-50 lang-item"
                      >
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
