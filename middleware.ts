import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { LOCALE_PREFIX_SET } from "@/lib/i18n-config";
import { reorderHeadHtml } from "@/lib/reorder-head-html";

const HEAD_REORDER_INTERNAL = "x-head-reorder-internal";

/** Only full document GETs; skip RSC / prefetch / actions (see app-router-headers). */
function isHtmlDocumentRequest(request: NextRequest): boolean {
  if (request.method !== "GET") return false;
  const h = request.headers;
  if (h.has("rsc")) return false;
  if (h.has("next-router-state-tree")) return false;
  if (h.has("next-router-prefetch")) return false;
  if (h.has("next-router-segment-prefetch")) return false;
  if (h.has("next-action")) return false;
  if (h.has("next-hmr-refresh")) return false;
  return true;
}

function resolveLocaleAndMaybeRedirect(request: NextRequest): {
  locale: string;
  pathname: string;
  redirect?: NextResponse;
} {
  const pathname = request.nextUrl.pathname;
  const parts = pathname.split("/").filter(Boolean);
  const first = parts[0];
  const firstLower = first?.toLowerCase();
  let locale = "en";
  if (firstLower && LOCALE_PREFIX_SET.has(firstLower)) {
    locale = firstLower;
    if (first !== firstLower) {
      const tail = parts.slice(1);
      let newPath = "/" + [firstLower, ...tail].join("/");
      if (pathname.endsWith("/") && newPath !== "/") {
        newPath += "/";
      }
      const url = request.nextUrl.clone();
      url.pathname = newPath;
      return { locale, pathname, redirect: NextResponse.redirect(url, 308) };
    }
  }
  return { locale, pathname };
}

export async function middleware(request: NextRequest) {
  if (request.headers.get(HEAD_REORDER_INTERNAL) === "1") {
    const { locale, pathname, redirect } = resolveLocaleAndMaybeRedirect(request);
    if (redirect) return redirect;
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-locale", locale);
    requestHeaders.set("x-pathname", pathname);
    return NextResponse.next({
      request: { headers: requestHeaders },
    });
  }

  const { locale, pathname, redirect } = resolveLocaleAndMaybeRedirect(request);
  if (redirect) return redirect;

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-locale", locale);
  requestHeaders.set("x-pathname", pathname);

  if (
    process.env.DISABLE_HEAD_REORDER !== "1" &&
    isHtmlDocumentRequest(request)
  ) {
    try {
      const internalHeaders = new Headers(request.headers);
      internalHeaders.set(HEAD_REORDER_INTERNAL, "1");
      internalHeaders.set("x-locale", locale);
      internalHeaders.set("x-pathname", pathname);

      const res = await fetch(request.url, {
        headers: internalHeaders,
        cache: "no-store",
      });

      const ct = res.headers.get("content-type") ?? "";
      if (ct.includes("text/html")) {
        const html = await res.text();
        const body = reorderHeadHtml(html);
        const out = new NextResponse(body, {
          status: res.status,
          statusText: res.statusText,
        });
        const skip = new Set(["content-encoding", "content-length", "transfer-encoding"]);
        res.headers.forEach((value, key) => {
          const k = key.toLowerCase();
          if (skip.has(k) || k === "set-cookie") return;
          out.headers.append(key, value);
        });
        for (const cookie of res.headers.getSetCookie()) {
          out.headers.append("Set-Cookie", cookie);
        }
        return out;
      }
    } catch {
      /* fall through */
    }
  }

  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
