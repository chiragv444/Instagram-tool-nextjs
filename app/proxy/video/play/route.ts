import {
  validateInstagramMediaUrl,
  validateInstagramUrl,
  verifyInstagramSignature,
} from "@/lib/instagram-security";
import { videoProxyErrorMessage } from "@/lib/proxy-errors";

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36";

type Body = {
  videoUrl?: string;
  originalUrl?: string;
  token?: string;
  timestamp?: string;
  secretToken?: string;
};

/** POST /proxy/video/play — signed playback with Range (Fastify-compatible). */
export async function POST(request: Request) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return Response.json({ success: false, error: "Invalid JSON" }, { status: 400 });
  }

  const { videoUrl, originalUrl, token, timestamp, secretToken } = body;

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

  if (!videoUrl || typeof videoUrl !== "string" || videoUrl.trim().length === 0) {
    return Response.json({ success: false, error: "Invalid video URL" }, { status: 400 });
  }

  if (!validateInstagramMediaUrl(videoUrl)) {
    return Response.json({ success: false, error: "Invalid media URL" }, { status: 400 });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 120_000);

  try {
    const headers: Record<string, string> = {
      "User-Agent": UA,
      Accept: "video/*,*/*;q=0.8",
      Referer: originalUrl || "https://www.instagram.com/",
    };
    const clientRange = request.headers.get("range");
    if (clientRange) headers.Range = clientRange;

    const response = await fetch(videoUrl, {
      method: "GET",
      headers,
      signal: controller.signal,
    });

    if (!response.ok) {
      return Response.json({ success: false, error: "Failed to fetch video" }, { status: response.status });
    }

    const contentType = response.headers.get("content-type") || "video/mp4";
    const contentLength = response.headers.get("content-length");
    const contentRange = response.headers.get("content-range");
    const acceptRanges = response.headers.get("accept-ranges") || "bytes";

    const out = new Headers();
    out.set("Content-Type", contentType);
    out.set("Cache-Control", "public, max-age=60");
    out.set("Accept-Ranges", acceptRanges);

    if (response.status === 206) {
      if (contentRange) out.set("Content-Range", contentRange);
      if (contentLength) out.set("Content-Length", contentLength);
    } else if (contentLength) {
      out.set("Content-Length", contentLength);
    }

    if (response.body == null) {
      return Response.json({ success: false, error: "No response body from upstream" }, { status: 502 });
    }

    return new Response(response.body, {
      status: response.status,
      headers: out,
    });
  } catch (error) {
    return Response.json({ success: false, error: videoProxyErrorMessage(error) }, { status: 500 });
  } finally {
    clearTimeout(timeout);
  }
}
