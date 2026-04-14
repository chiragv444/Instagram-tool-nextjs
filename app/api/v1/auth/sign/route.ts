import { createHmac, randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { extractInstagramUsername } from "@/lib/extract-instagram-username";
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

  const username = extractInstagramUsername({
    username: typeof body.username === "string" ? body.username : undefined,
    url: typeof body.url === "string" ? body.url : undefined,
  });
  if (!username) {
    return jsonError("Could not resolve an Instagram username from the input", 400);
  }

  const url = `https://www.instagram.com/${username}/`;
  if (!validateInstagramUrl(url)) {
    return jsonError("Invalid profile URL", 400);
  }

  const token = randomBytes(32).toString("hex");
  const timestamp = String(Date.now());
  const secretToken = createHmac("sha256", secret)
    .update(`${timestamp}\n${token}\n${url}`)
    .digest("hex");

  return NextResponse.json({
    success: true,
    username,
    url,
    token,
    timestamp,
    secretToken,
  });
}
