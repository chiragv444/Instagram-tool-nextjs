import { NextResponse } from "next/server";
import { fetchInstagramFeed } from "@/lib/fetch-instagram-feed";
import type { InstagramFeedKind } from "@/lib/instagram-feed-endpoints";
import {
  assertInstagramApiRequest,
  jsonError,
  parseOptionalCursor,
  parseOptionalLimit,
  resolveUsername,
  upstreamOr500,
} from "@/lib/instagram-route-common";

const KINDS = new Set<InstagramFeedKind>(["posts", "reels", "stories", "highlights"]);

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return jsonError("Invalid JSON body", 400);
  }

  const auth = assertInstagramApiRequest(body);
  if (auth) return auth;

  const kindRaw = body.kind;
  if (typeof kindRaw !== "string" || !KINDS.has(kindRaw as InstagramFeedKind)) {
    return jsonError(
      "Invalid or missing kind (expected posts, reels, stories, or highlights)",
      400,
    );
  }
  const kind = kindRaw as InstagramFeedKind;

  const username = resolveUsername(body);
  if (!username) {
    return jsonError("Could not resolve an Instagram username from the input", 400);
  }

  const cursor = parseOptionalCursor(body);
  const limit = parseOptionalLimit(body);

  try {
    const data = await fetchInstagramFeed(kind, username, { cursor, limit });
    return NextResponse.json({ success: true, data });
  } catch (error) {
    const { message, status } = upstreamOr500(error);
    return jsonError(message, status);
  }
}
