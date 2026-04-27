"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { stripLocaleFromPath } from "@/lib/i18n-config";
import {
  type HeroProps,
  homeHrefForLocale,
  normalizePath,
  pathWithLocale,
} from "./hero-types";
import InstagramFormBridge from "./instagram-form-bridge";

const defaultNav = {
  video: "Video",
  image: "Photo",
  reels: "Reels",
  story: "Story",
  viewer: "Viewer",
};

const defaultHero: HeroProps["hero"] = {
  title: "Instagram Video Downloader",
  subtitle: "Paste a link or username to get started.",
};

const defaultForm: HeroProps["form"] = {
  placeholder: "Paste Instagram link here…",
  paste: "Paste",
  clear: "Clear",
  download_btn: "Download",
};

declare global {
  interface Window {
    __INSTAGRAM_FORM__?: { paste: string; clear: string };
    __INSTAGRAM_WIDGET_LEGACY__?: boolean;
    __USE_MOCK_API__?: boolean;
  }
}

function tabClass(active: boolean) {
  return [
    "flex items-center gap-2 md:px-6 md:py-2 px-4 py-3 border-r border-white/20 cursor-pointer",
    active ? "bg-white/20" : "",
  ]
    .filter(Boolean)
    .join(" ");
}

function lastTabClass(active: boolean) {
  return [
    "flex items-center gap-2 md:px-6 md:py-2 px-4 py-3 cursor-pointer",
    active ? "bg-white/20" : "",
  ]
    .filter(Boolean)
    .join(" ");
}

export default function Hero({
  locale = "en",
  currentRoute: currentRouteProp,
  nav = defaultNav,
  hero = defaultHero,
  form = defaultForm,
  useMockApi = false,
}: HeroProps) {
  const pathname = usePathname();
  const rawPath = currentRouteProp ?? pathname ?? "/";
  const { path: pathNoLocale } = stripLocaleFromPath(rawPath);
  const path = pathNoLocale;
  const home = homeHrefForLocale(locale);

  const routes = {
    home: "/",
    photo: "/instagram-photo-downloader",
    reels: "/instagram-reels-downloader",
    story: "/instagram-story-downloader",
    viewer: "/instagram-story-viewer",
  } as const;

  const segs = normalizePath(path).split("/").filter(Boolean);
  const isLocaleHome = segs.length === 0;

  const active = {
    home: isLocaleHome,
    photo: path.includes("/instagram-photo-downloader"),
    reels: path.includes("/instagram-reels-downloader"),
    story: path.includes("/instagram-story-downloader"),
    viewer: path.includes("/instagram-story-viewer"),
  };

  useEffect(() => {
    window.__INSTAGRAM_FORM__ = { paste: form?.paste ?? "", clear: form?.clear ?? "" };
    window.__USE_MOCK_API__ = useMockApi;
  }, [form?.paste, form?.clear, useMockApi]);

  return (
    <>
      <section
        id="hero"
        className="bg-gradient-to-r from-[#6a4bff] via-[#b232e9] to-[#ff1667] text-white"
      >
        <div className="mx-auto max-w-5xl px-4 py-16 text-center">
          <div className="flex justify-center mb-10">
            <div className="inline-flex rounded-md bg-white/15 text-sm overflow-hidden shadow-sm">
              <Link
                href={home}
                className="font-bold whitespace-nowrap"
                prefetch={false}
              >
                <span className={tabClass(active.home)} role="presentation">
                  <span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width={20}
                      height={20}
                      fill="none"
                      aria-hidden
                    >
                      <g
                        stroke="#fff"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.3"
                      >
                        <path d="m8.316 7.043 2.875 1.701a.556.556 0 0 1 0 .956l-2.875 1.701a.555.555 0 0 1-.839-.479v-3.4a.556.556 0 0 1 .839-.479Z" />
                        <path d="M13.544 15.889H4.656a2.222 2.222 0 0 1-2.223-2.222v-8.89a2.222 2.222 0 0 1 2.223-2.221h8.889a2.222 2.222 0 0 1 2.222 2.222v8.889a2.222 2.222 0 0 1-2.223 2.222Z" />
                      </g>
                    </svg>
                  </span>
                  <span className="menu-text hidden md:block">
                    {nav.video ?? defaultNav.video}
                  </span>
                </span>
              </Link>

              <Link
                href={pathWithLocale(locale, `${routes.photo}/`)}
                className="font-bold whitespace-nowrap"
                prefetch={false}
              >
                <span className={tabClass(active.photo)} role="presentation">
                  <span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width={20}
                      height={20}
                      fill="none"
                      aria-hidden
                    >
                      <path
                        stroke="#fff"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.3"
                        d="M14.878 15.333H3.03a1.481 1.481 0 0 1-1.481-1.481V3.482A1.481 1.481 0 0 1 3.03 2h11.848a1.481 1.481 0 0 1 1.481 1.481v10.37a1.481 1.481 0 0 1-1.481 1.482Z"
                      />
                      <path
                        fill="#fff"
                        d="M7.039 5.397a1.482 1.482 0 1 1-2.06 2.132 1.482 1.482 0 0 1 2.06-2.132Z"
                      />
                      <path
                        stroke="#fff"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.3"
                        d="m16.361 11.63-3.125-2.5a.742.742 0 0 0-1.041.115l-2.472 3.089a.742.742 0 0 1-1.041.116l-1.384-1.108a.74.74 0 0 0-1.032.105l-3.238 3.886"
                      />
                    </svg>
                  </span>
                  <span className="menu-text hidden md:block">
                    {nav.image ?? defaultNav.image}
                  </span>
                </span>
              </Link>

              <Link
                href={pathWithLocale(locale, `${routes.reels}/`)}
                className="font-bold whitespace-nowrap"
                prefetch={false}
              >
                <span className={tabClass(active.reels)} role="presentation">
                  <span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width={20}
                      height={20}
                      fill="none"
                      aria-hidden
                    >
                      <g
                        stroke="#fff"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.3"
                      >
                        <path d="M14.837 15.778H2.985a1.481 1.481 0 0 1-1.481-1.482V3.926a1.482 1.482 0 0 1 1.481-1.482h11.852a1.482 1.482 0 0 1 1.482 1.482v10.37a1.481 1.481 0 0 1-1.482 1.482ZM1.504 6.148h14.815M5.948 6.148l.74-3.704M11.133 6.148l.74-3.704" />
                      </g>
                    </svg>
                  </span>
                  <span className="menu-text hidden md:block">
                    {nav.reels ?? defaultNav.reels}
                  </span>
                </span>
              </Link>

              <Link
                href={pathWithLocale(locale, `${routes.story}/`)}
                className="font-bold whitespace-nowrap"
                prefetch={false}
              >
                <span className={tabClass(active.story)} role="presentation">
                  <span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width={20}
                      height={20}
                      fill="none"
                      aria-hidden
                    >
                      <g
                        stroke="#fff"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.3"
                      >
                        <path d="M1.991 6.741a7.12 7.12 0 0 1 2.233-3.16M1.578 9.112c0 .832.15 1.627.413 2.37M14.661 3.112A1.334 1.334 0 1 1 12.773 5a1.334 1.334 0 0 1 1.888-1.887Z" />
                        <path d="M12.681 3.227A7.105 7.105 0 0 0 6.62 2.31M7.852 6.787 10.919 8.6a.591.591 0 0 1 0 1.02l-3.067 1.814a.593.593 0 0 1-.894-.51V7.297a.593.593 0 0 1 .894-.51ZM4.224 14.62a7.036 7.036 0 0 1-.939-.894M6.619 15.914a7.108 7.108 0 0 0 8.42-3.604c.5-.992.76-2.088.76-3.199 0-.429-.043-.847-.116-1.254" />
                      </g>
                    </svg>
                  </span>
                  <span className="menu-text hidden md:block">
                    {nav.story ?? defaultNav.story}
                  </span>
                </span>
              </Link>

              <Link
                href={pathWithLocale(locale, `${routes.viewer}/`)}
                className="font-bold whitespace-nowrap"
                prefetch={false}
              >
                <span className={lastTabClass(active.viewer)} role="presentation">
                  <span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width={20}
                      height={20}
                      fill="none"
                      aria-hidden
                    >
                      <g
                        stroke="#fff"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.5"
                      >
                        <path d="M.75 9s3-6 8.25-6 8.25 6 8.25 6-3 6-8.25 6S.75 9 .75 9Z" />
                        <path d="M9 11.25a2.25 2.25 0 1 0 0-4.5 2.25 2.25 0 0 0 0 4.5Z" />
                      </g>
                    </svg>
                  </span>
                  <span className="menu-text hidden md:block">
                    {nav.viewer ?? defaultNav.viewer}
                  </span>
                </span>
              </Link>
            </div>
          </div>

          <div id="hero-title">
            {hero?.titleHtml ? (
              <h1
                className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight"
                dangerouslySetInnerHTML={{ __html: hero?.title ?? "" }}
              />
            ) : (
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight">
                {hero?.title ?? ""}
              </h1>
            )}
            {hero?.subtitleHtml ? (
              <p
                className="mt-3 text-base text-white/90 max-w-3xl mx-auto"
                dangerouslySetInnerHTML={{ __html: hero?.subtitle ?? "" }}
              />
            ) : (
              <p className="mt-3 text-base text-white/90 max-w-3xl mx-auto">
                {hero?.subtitle ?? ""}
              </p>
            )}
          </div>

          <form
            id="get_video"
            action=""
            name="formurl"
            autoComplete="off"
            method="post"
            noValidate
            className="mt-10 flex justify-center"
          >
            <div className="flex flex-col md:flex-row w-full gap-3 max-w-3xl items-stretch">
              <div className="flex flex-1 bg-white rounded-xl shadow overflow-hidden relative">
                <span className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-500 hidden md:block">
                  <svg
                    width={20}
                    height={20}
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden
                  >
                    <path
                      d="M10.75 3.75L12.75 1.75C13.75 0.75 15.75 0.75 16.75 1.75L17.75 2.75C18.75 3.75 18.75 5.75 17.75 6.75L12.75 11.75C11.75 12.75 9.75 12.75 8.75 11.75M8.75 15.75L6.75 17.75C5.75 18.75 3.75 18.75 2.75 17.75L1.75 16.75C0.75 15.75 0.75 13.75 1.75 12.75L6.75 7.75C7.75 6.75 9.75 6.75 10.75 7.75"
                      stroke="black"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>

                <input
                  id="url"
                  name="url"
                  type="text"
                  placeholder={form?.placeholder ?? ""}
                  aria-label="Url"
                  autoCapitalize="none"
                  className="flex-1 h-14 md:ml-5 md:px-5 px-3 text-base text-gray-800 placeholder:text-gray-500 focus:outline-none"
                />
                <input
                  name="mCoOt"
                  type="hidden"
                  value="a5aa3e00b7ddd3704d4d017b75d11d0d"
                />

                <button
                  type="button"
                  id="paste-mobile"
                  className="h-14 md:px-6 px-2 text-sm md:text-base font-medium text-gray-700 border-l border-gray-200 flex items-center justify-center gap-2 bg-[#f7f7f7] hover:bg-gray-200 hover:text-[#2d8cff] cursor-pointer"
                >
                  <span className="paste-text">{form?.paste ?? ""}</span>
                </button>
              </div>

              <button
                id="send"
                type="submit"
                className="h-14 px-8 bg-[#2d8cff] text-white text-sm md:text-base font-semibold rounded-xl shadow flex items-center justify-center hover:opacity-90 cursor-pointer"
              >
                {form?.download_btn ?? ""}
              </button>
            </div>
          </form>
        </div>
      </section>

      <InstagramFormBridge />
    </>
  );
}

export { defaultForm, defaultHero, defaultNav };
export type { HeroCopy, HeroFormLabels, HeroNavLabels, HeroProps } from "./hero-types";
