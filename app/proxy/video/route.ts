import {
  validateInstagramMediaUrl,
  validateInstagramUrl,
  verifyInstagramSignature,
} from "@/lib/instagram-security";
import { videoProxyErrorMessage } from "@/lib/proxy-errors";

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36";

const allowAnyUrl = process.env.PROXY_ALLOW_ANY_URL === "true";

type SecureBody = {
  videoUrl?: string;
  originalUrl?: string;
  token?: string;
  timestamp?: string;
  secretToken?: string;
};

function assertSecureVideo(body: SecureBody): Response | null {
  const { originalUrl, token, timestamp, secretToken } = body;
  if (!validateInstagramUrl(originalUrl)) {
    return Response.json({ success: false, error: "Invalid URL" }, { status: 400 });
  }
  if (
    !verifyInstagramSignature({
      url: originalUrl || "",
      token: token || "",
      timestamp: timestamp || "",
      secretToken: secretToken || "",
    })
  ) {
    return Response.json({ success: false, error: "Unauthorized request" }, { status: 403 });
  }
  return null;
}

/** GET /proxy/video?url= — range-capable stream (Fastify-compatible). */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");
  if (!url || typeof url !== "string" || url.trim().length === 0) {
    return Response.json({ success: false, error: "Invalid video URL" }, { status: 400 });
  }

  if (!allowAnyUrl && !validateInstagramMediaUrl(url)) {
    return Response.json({ success: false, error: "URL not allowed for proxy" }, { status: 400 });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 120_000);

  try {
    const headers: Record<string, string> = {
      "User-Agent": UA,
      Accept: "video/*,*/*;q=0.8",
      Referer: "https://www.instagram.com/",
    };
    const clientRange = request.headers.get("range");
    if (clientRange) headers.Range = clientRange;

    const response = await fetch(url, {
      method: "GET",
      headers,
      signal: controller.signal,
    });

    if (!response.ok) {
      return Response.json(
        { success: false, error: "Failed to fetch video" },
        { status: response.status, headers: { "Content-Type": "application/json" } },
      );
    }

    const contentType = response.headers.get("content-type") || "video/mp4";
    const contentLength = response.headers.get("content-length");
    const contentRange = response.headers.get("content-range");
    const acceptRanges = response.headers.get("accept-ranges") || "bytes";

    const out = new Headers();
    out.set("Content-Type", contentType);
    out.set("Cache-Control", "public, max-age=31536000");
    out.set("Access-Control-Allow-Origin", "*");
    out.set("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
    out.set("Access-Control-Allow-Headers", "Range");
    out.set("Accept-Ranges", acceptRanges);

    if (response.status === 206) {
      if (contentRange) out.set("Content-Range", contentRange);
      if (contentLength) out.set("Content-Length", contentLength);
    } else if (contentLength) {
      out.set("Content-Length", contentLength);
    }

    if (response.body == null) {
      return Response.json(
        { success: false, error: "No response body from upstream" },
        { status: 502, headers: { "Content-Type": "application/json" } },
      );
    }

    return new Response(response.body, {
      status: response.status,
      headers: out,
    });
  } catch (error) {
    return Response.json(
      { success: false, error: videoProxyErrorMessage(error) },
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  } finally {
    clearTimeout(timeout);
  }
}

/** POST /proxy/video — signed video download (attachment stream). */
export async function POST(request: Request) {
  let body: SecureBody;
  try {
    body = (await request.json()) as SecureBody;
  } catch {
    return Response.json({ success: false, error: "Invalid JSON" }, { status: 400 });
  }

  const authErr = assertSecureVideo(body);
  if (authErr) return authErr;

  const { videoUrl, originalUrl } = body;
  if (!videoUrl || typeof videoUrl !== "string" || videoUrl.trim().length === 0) {
    return Response.json({ success: false, error: "Invalid video URL" }, { status: 400 });
  }

  if (!validateInstagramMediaUrl(videoUrl)) {
    return Response.json({ success: false, error: "Invalid media URL" }, { status: 400 });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 120_000);

  try {
    const response = await fetch(videoUrl, {
      method: "GET",
      headers: {
        "User-Agent": UA,
        Accept: "video/*,*/*;q=0.8",
        Referer: originalUrl || "https://www.instagram.com/",
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      return Response.json({ success: false, error: "Failed to fetch video" }, { status: response.status });
    }

    const contentType = response.headers.get("content-type") || "video/mp4";
    let filename = "instagram-video.mp4";
    try {
      const urlPath = new URL(videoUrl).pathname;
      const match = urlPath.match(/\/([^/]+\.(mp4|mov|webm|mkv))$/i);
      if (match?.[1]) filename = match[1];
    } catch {
      /* default */
    }

    if (response.body == null) {
      return Response.json({ success: false, error: "No response body from upstream" }, { status: 502 });
    }

    return new Response(response.body, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Accept-Ranges": "bytes",
      },
    });
  } catch (error) {
    return Response.json({ success: false, error: videoProxyErrorMessage(error) }, { status: 500 });
  } finally {
    clearTimeout(timeout);
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS, POST",
      "Access-Control-Allow-Headers": "Range, Content-Type",
    },
  });
}
