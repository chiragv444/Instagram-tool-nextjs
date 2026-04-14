import { NextResponse } from "next/server";
import { rapidApiFormPost } from "@/lib/fetch-instagram-rapid-form";
import { assertInstagramApiRequest, jsonError, upstreamOr500 } from "@/lib/instagram-route-common";

const HIGHLIGHT_STORIES_PATH =
  process.env.RAPIDAPI_PATH_HIGHLIGHT_STORIES?.trim() || "get_highlights_stories.php";

/**
 * POST /api/v1/highlightStory/ — RapidAPI `get_highlights_stories.php`
 * (same as Fastify POST /v1/highlightStory).
 */
export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return jsonError("Invalid JSON body", 400);
  }

  const auth = assertInstagramApiRequest(body);
  if (auth) return auth;

  const raw = body.highlight_id;
  const highlightId =
    typeof raw === "string"
      ? raw.trim()
      : typeof raw === "number" && Number.isFinite(raw)
        ? String(Math.trunc(raw))
        : "";
  if (!highlightId) {
    return jsonError("Missing or invalid highlight_id", 400);
  }

  try {
    const data = await rapidApiFormPost(HIGHLIGHT_STORIES_PATH, {
      highlight_id: highlightId,
    });
    return NextResponse.json({ success: true, data });
  } catch (error) {
    const { message, status } = upstreamOr500(error);
    return jsonError(message, status);
  }
}
