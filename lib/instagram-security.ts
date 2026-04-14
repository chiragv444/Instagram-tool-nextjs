import { createHmac, timingSafeEqual } from "node:crypto";

const DEFAULT_WINDOW_MS = 5 * 60 * 1000;

/** Max age of `timestamp` vs server clock (override with `INSTAGRAM_SIGNATURE_WINDOW_MS`, milliseconds). */
export function getInstagramSignatureWindowMs(): number {
  const raw = process.env.INSTAGRAM_SIGNATURE_WINDOW_MS?.trim();
  if (!raw) return DEFAULT_WINDOW_MS;
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n) || n < 1000) return DEFAULT_WINDOW_MS;
  return Math.min(n, 24 * 60 * 60 * 1000);
}

/**
 * Validates URLs used as Referer / page context for Instagram (profile, post, reel).
 */
export function validateInstagramUrl(raw: string | undefined): boolean {
  if (!raw || typeof raw !== "string" || raw.trim().length === 0) return false;
  try {
    const u = new URL(raw.trim());
    if (u.protocol !== "http:" && u.protocol !== "https:") return false;
    const h = u.hostname.toLowerCase();
    return (
      h === "instagram.com" ||
      h === "www.instagram.com" ||
      h.endsWith(".instagram.com")
    );
  } catch {
    return false;
  }
}

/**
 * Validates direct media URLs we are willing to proxy (CDN).
 */
export function validateInstagramMediaUrl(raw: string | undefined): boolean {
  if (!raw || typeof raw !== "string" || raw.trim().length === 0) return false;
  try {
    const u = new URL(raw.trim());
    if (u.protocol !== "http:" && u.protocol !== "https:") return false;
    const h = u.hostname.toLowerCase();
    return (
      h.includes("cdninstagram") ||
      h.includes("fbcdn") ||
      h.endsWith(".instagram.com") ||
      h === "instagram.com" ||
      h === "www.instagram.com" ||
      h.includes("fbsbx.com")
    );
  } catch {
    return false;
  }
}

/**
 * HMAC verification for secure proxy bodies (matches typical `verifyInstagramSignature` with `url` = originalUrl).
 * Adjust the `.update(...)` payload if your legacy `instagramSecurity` module used a different string.
 */
export type InstagramSignedPayload = {
  url: string;
  token: string;
  timestamp: string;
  secretToken: string;
};

/** Non-empty `url`, `token`, `timestamp`, `secretToken` (Fastify-style body). */
export function parseInstagramSignedPayload(
  body: Record<string, unknown>,
): InstagramSignedPayload | null {
  const url = typeof body.url === "string" ? body.url.trim() : "";
  const token = typeof body.token === "string" ? body.token.trim() : "";
  const timestamp = typeof body.timestamp === "string" ? body.timestamp.trim() : "";
  const secretToken = typeof body.secretToken === "string" ? body.secretToken.trim() : "";
  if (!url || !token || !timestamp || !secretToken) return null;
  return { url, token, timestamp, secretToken };
}

/** Client sent at least one signing field (excluding url-only, to avoid treating profile URL as auth). */
export function hasInstagramSigningIntent(body: Record<string, unknown>): boolean {
  return (
    typeof body.secretToken === "string" ||
    typeof body.token === "string" ||
    typeof body.timestamp === "string"
  );
}

export function verifyInstagramSignature(params: {
  url: string;
  token: string;
  timestamp: string;
  secretToken: string;
}): boolean {
  const secret = process.env.AUTH_SECRET?.trim();
  if (!secret) return false;

  const ts = Number(params.timestamp);
  const windowMs = getInstagramSignatureWindowMs();
  if (!Number.isFinite(ts) || Math.abs(Date.now() - ts) > windowMs) {
    return false;
  }

  const expected = createHmac("sha256", secret)
    .update(`${params.timestamp}\n${params.token}\n${params.url}`)
    .digest("hex");

  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(params.secretToken, "utf8");
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
