import { validateInstagramMediaUrl } from "@/lib/instagram-security";
import { imageProxyErrorMessage } from "@/lib/proxy-errors";

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36";

const allowAnyUrl = process.env.PROXY_ALLOW_ANY_URL === "true";

/** GET /proxy/image?url= — public image proxy (same idea as Fastify). */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");
  if (!url || typeof url !== "string" || url.trim().length === 0) {
    return Response.json({ success: false, error: "Invalid image URL" }, { status: 400 });
  }

  if (!allowAnyUrl && !validateInstagramMediaUrl(url)) {
    return Response.json({ success: false, error: "URL not allowed for proxy" }, { status: 400 });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30_000);

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "User-Agent": UA,
        Accept: "image/*,*/*;q=0.8",
        Referer: "https://www.instagram.com/",
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
    const buf = await response.arrayBuffer();

    return new Response(buf, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000",
        "Access-Control-Allow-Origin": "*",
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
