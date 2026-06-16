import { createHmac, randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { parseInstagramInput } from "@/lib/extract-instagram-username";
import { jsonError } from "@/lib/instagram-route-common";
import { validateInstagramUrl } from "@/lib/instagram-security";

/**
 * POST /api/v1/auth/sign/ — mint `token`, `timestamp`, `secretToken` for browser clients.
 * HMAC matches {@link verifyInstagramSignature}: `sha256(AUTH_SECRET, timestamp\\ntoken\\nurl)`.
 */
export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return jsonError("Invalid JSON body", 400);
  }

  const secret = process.env.AUTH_SECRET?.trim();
  if (!secret) {
    return jsonError("Server configuration error", 500);
  }

  const rawInput = (typeof body.url === "string" ? body.url : typeof body.username === "string" ? body.username : "")?.trim();
  const parsed = parseInstagramInput(rawInput);
  if (!parsed) {
    return jsonError("Could not resolve a valid Instagram profile, story, or media URL", 400);
  }

  let canonicalUrl = "";
  if (parsed.type === "profile") {
    canonicalUrl = `https://www.instagram.com/${parsed.username}/`;
  } else if (parsed.type === "stories") {
    canonicalUrl = `https://www.instagram.com/stories/${parsed.username}/`;
  } else {
    canonicalUrl = `https://www.instagram.com/p/${parsed.shortcode}/`;
  }

  if (!validateInstagramUrl(canonicalUrl)) {
    return jsonError("Invalid Instagram URL", 400);
  }

  const token = randomBytes(32).toString("hex");
  const timestamp = String(Date.now());
  const secretToken = createHmac("sha256", secret)
    .update(`${timestamp}\n${token}\n${canonicalUrl}`)
    .digest("hex");

  return NextResponse.json({
    success: true,
    type: parsed.type,
    username: "username" in parsed ? parsed.username : undefined,
    shortcode: "shortcode" in parsed ? parsed.shortcode : undefined,
    url: canonicalUrl,
    token,
    timestamp,
    secretToken,
  });
}

