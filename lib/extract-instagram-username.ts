/**
 * Resolve an Instagram handle from a bare username, @handle, or profile URL.
 */
export function extractInstagramUsername(input: {
  username?: string;
  url?: string;
}): string | null {
  const rawUser = input.username?.trim();
  if (rawUser) {
    const noAt = rawUser.replace(/^@/, "");
    if (/^[\w.]+$/.test(noAt)) return noAt;
  }

  const raw = (input.url ?? input.username)?.trim();
  if (!raw) return null;

  if (!raw.includes("instagram.com") && !raw.includes("://")) {
    const noAt = raw.replace(/^@/, "").split(/[/?#]/)[0] ?? "";
    if (/^[\w.]+$/.test(noAt)) return noAt;
  }

  try {
    const withProto = raw.includes("://") ? raw : `https://${raw}`;
    const parsed = new URL(withProto);
    const host = parsed.hostname.replace(/^www\./, "");
    if (host !== "instagram.com" && host !== "www.instagram.com") {
      return null;
    }
    const parts = parsed.pathname.split("/").filter(Boolean);
    const skip = new Set(["p", "reel", "reels", "tv", "stories", "explore", "accounts"]);
    const first = parts[0];
    if (!first || skip.has(first)) return null;
    const handle = first.replace(/^@/, "");
    return /^[\w.]+$/.test(handle) ? handle : null;
  } catch {
    return null;
  }
}
