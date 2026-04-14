import {
  validateInstagramMediaUrl,
  validateInstagramUrl,
  verifyInstagramSignature,
} from "@/lib/instagram-security";
import { imageProxyErrorMessage } from "@/lib/proxy-errors";

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36";

type Body = {
  imageUrl?: string;
  originalUrl?: string;
  token?: string;
  timestamp?: string;
  secretToken?: string;
};

/** POST /proxy/image/instagram — signed download (Fastify-compatible). */
export async function POST(request: Request) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return Response.json({ success: false, error: "Invalid JSON" }, { status: 400 });
  }

  const { imageUrl, originalUrl, token, timestamp, secretToken } = body;

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

  if (!imageUrl || typeof imageUrl !== "string" || imageUrl.trim().length === 0) {
    return Response.json({ success: false, error: "Invalid image URL" }, { status: 400 });
  }

  if (!validateInstagramMediaUrl(imageUrl)) {
    return Response.json({ success: false, error: "Invalid media URL" }, { status: 400 });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30_000);

  try {
    const response = await fetch(imageUrl, {
      method: "GET",
      headers: {
        "User-Agent": UA,
        Accept: "image/*,*/*;q=0.8",
        Referer: originalUrl || "https://www.instagram.com/",
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      return Response.json(
        { success: false, error: "Failed to fetch image" },
        { status: response.status },
      );
    }

    const contentType = response.headers.get("content-type") || "image/jpeg";
    let filename = "instagram-image.jpg";
    try {
      const urlPath = new URL(imageUrl).pathname;
      const match = urlPath.match(/\/([^/]+\.(jpg|jpeg|png|gif|webp|bmp))$/i);
      if (match?.[1]) filename = match[1];
    } catch {
      /* keep default */
    }

    const buf = await response.arrayBuffer();

    return new Response(buf, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });
  } catch (error) {
    return Response.json(
      { success: false, error: imageProxyErrorMessage(error) },
      { status: 500 },
    );
  } finally {
    clearTimeout(timeout);
  }
}
