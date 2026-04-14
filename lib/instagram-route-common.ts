import { NextResponse } from "next/server";
import { extractInstagramUsername } from "@/lib/extract-instagram-username";
import {
  hasInstagramSigningIntent,
  parseInstagramSignedPayload,
  validateInstagramUrl,
  verifyInstagramSignature,
} from "@/lib/instagram-security";

/**
 * When `true`, `/api/v1/*` accepts unsigned requests (legacy / local only).
 * Default is signed-only (Fastify-style `verifyInstagramToken`).
 */
const allowPublicInstagramApi = process.env.ALLOW_PUBLIC_USER_INFO === "true";

/**
 * Same order as Fastify `verifyInstagramToken`: `validateInstagramUrl` → `verifyInstagramSignature`
 * (`timestamp` within {@link getInstagramSignatureWindowMs}, HMAC `sha256(AUTH_SECRET, timestamp\\ntoken\\nurl)`).
 * Invalid / expired signature or timestamp → **403** `{ success: false, error: "Unauthorized request" }`.
 * Bad or missing Instagram `url` when signing is attempted → **400** `{ success: false, error: "Invalid URL" }`.
 */
export function assertInstagramApiRequest(body: Record<string, unknown>): NextResponse | null {
  const signIntent = hasInstagramSigningIntent(body);
  const payload = parseInstagramSignedPayload(body);

  if (signIntent || payload) {
    if (!payload || !validateInstagramUrl(payload.url)) {
      return NextResponse.json({ success: false, error: "Invalid URL" }, { status: 400 });
    }
    if (!verifyInstagramSignature(payload)) {
      return NextResponse.json({ success: false, error: "Unauthorized request" }, { status: 403 });
    }
    return null;
  }

  if (!allowPublicInstagramApi) {
    return NextResponse.json(
      {
        success: false,
        error:
          "Authentication required: include url, token, timestamp, and secretToken. Obtain them from POST /api/v1/auth/sign/ or set ALLOW_PUBLIC_USER_INFO=true for development only.",
      },
      { status: 401 },
    );
  }
  return null;
}

/** @deprecated Use {@link assertInstagramApiRequest} */
export const assertPublicOrSigned = assertInstagramApiRequest;

export function resolveUsername(body: Record<string, unknown>): string | null {
  return extractInstagramUsername({
    username: typeof body.username === "string" ? body.username : undefined,
    url: typeof body.url === "string" ? body.url : undefined,
  });
}

export function parseOptionalLimit(body: Record<string, unknown>): number | undefined {
  const raw = body.limit;
  if (typeof raw === "number" && Number.isFinite(raw)) {
    return Math.min(50, Math.max(1, Math.floor(raw)));
  }
  if (typeof raw === "string" && raw.trim() !== "") {
    const n = Number.parseInt(raw, 10);
    if (Number.isFinite(n)) return Math.min(50, Math.max(1, n));
  }
  return undefined;
}

export function parseOptionalCursor(body: Record<string, unknown>): string | undefined {
  const c = body.cursor;
  if (typeof c === "string" && c.length > 0) return c;
  return undefined;
}

export function jsonError(message: string, status: number) {
  return NextResponse.json({ success: false, error: message }, { status });
}

export function upstreamOr500(error: unknown): { message: string; status: number } {
  if (
    error instanceof Error &&
    error.message.includes("Missing RapidAPI configuration")
  ) {
    return { message: "Server configuration error", status: 500 };
  }
  const message =
    error instanceof Error && error.name === "AbortError"
      ? "Request timed out. Please try again."
      : error instanceof Error
        ? error.message
        : "Request failed";
  const upstream =
    error instanceof Error &&
    error.message.startsWith("Instagram API request failed:");
  return { message, status: upstream ? 502 : 500 };
}
