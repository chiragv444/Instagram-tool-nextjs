import { NextResponse } from "next/server";
import { fetchInstagramFeed } from "@/lib/fetch-instagram-feed";
import {
  assertInstagramApiRequest,
  jsonError,
  parseOptionalCursor,
  parseOptionalLimit,
  resolveUsername,
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

  const username = resolveUsername(body);
  if (!username) {
    return jsonError("Could not resolve an Instagram username from the input", 400);
  }

  const cursor = parseOptionalCursor(body);
  const limit = parseOptionalLimit(body);

  try {
    const data = await fetchInstagramFeed("posts", username, { cursor, limit });
    return NextResponse.json({ success: true, data });
  } catch (error) {
    const { message, status } = upstreamOr500(error);
    return jsonError(message, status);
  }
}
