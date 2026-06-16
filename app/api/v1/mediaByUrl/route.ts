import { NextResponse } from "next/server";
import { fetchInstagramMediaByUrlOrCode } from "@/lib/fetch-instagram-user-info";
import {
  assertInstagramApiRequest,
  jsonError,
  upstreamOr500,
} from "@/lib/instagram-route-common";

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return jsonError("Invalid JSON body", 400);
  }

  const auth = assertInstagramApiRequest(body);
  if (auth) return auth;

  // We sign canonicalUrl like https://www.instagram.com/p/SHORTCODE/.
  // So the signed URL is available in body.url. We can pass it directly to fetchInstagramMediaByUrlOrCode.
  const targetUrl = typeof body.url === "string" ? body.url.trim() : "";
  if (!targetUrl) {
    return jsonError("Missing signed URL in the request", 400);
  }

  try {
    const data = await fetchInstagramMediaByUrlOrCode(targetUrl);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    const { message, status } = upstreamOr500(error);
    return jsonError(message, status);
  }
}
