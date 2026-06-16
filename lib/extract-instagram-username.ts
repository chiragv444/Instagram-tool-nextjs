/**
 * Resolved details from an Instagram search input.
 */
export type InstagramInputResult =
  | { type: "profile"; username: string; url: string }
  | { type: "media"; shortcode: string; url: string }
  | { type: "stories"; username: string; storyId?: string; url: string };

/**
 * Parses a bare username, @handle, profile URL, or media URL (post, reel, story).
 */
export function parseInstagramInput(input: string | undefined): InstagramInputResult | null {
  const raw = input?.trim();
  if (!raw) return null;

  // 1. Check if it's a bare username or @handle
  if (!raw.includes("instagram.com") && !raw.includes("://")) {
    const noAt = raw.replace(/^@/, "").split(/[/?#]/)[0] ?? "";
    if (/^[\w.]+$/.test(noAt)) {
      return {
        type: "profile",
        username: noAt,
        url: `https://www.instagram.com/${noAt}/`,
      };
    }
  }

  // 2. Parse as URL
  try {
    const withProto = raw.includes("://") ? raw : `https://${raw}`;
    const parsed = new URL(withProto);
    const host = parsed.hostname.replace(/^www\./, "");
    if (host !== "instagram.com") {
      return null;
    }

    const parts = parsed.pathname.split("/").filter(Boolean);
    const first = parts[0];
    if (!first) return null;

    if (first === "stories") {
      const username = parts[1]?.replace(/^@/, "");
      if (username && /^[\w.]+$/.test(username)) {
        const storyId = parts[2];
        return {
          type: "stories",
          username,
          storyId: storyId && /^[\d_]+$/.test(storyId) ? storyId : undefined,
          url: withProto,
        };
      }
      return null;
    }

    if (first === "p" || first === "reel" || first === "reels" || first === "tv") {
      const shortcode = parts[1];
      if (shortcode) {
        return {
          type: "media",
          shortcode,
          url: withProto,
        };
      }
      return null;
    }

    // Otherwise, treat as a profile URL
    const username = first.replace(/^@/, "");
    if (/^[\w.]+$/.test(username)) {
      const skip = new Set(["explore", "accounts"]);
      if (skip.has(username)) return null;
      return {
        type: "profile",
        username,
        url: `https://www.instagram.com/${username}/`,
      };
    }
  } catch {
    return null;
  }

  return null;
}

/**
 * Resolve an Instagram handle from a bare username, @handle, or profile URL.
 * Bypasses media URLs (p, reel, tv) to preserve original behavior.
 */
export function extractInstagramUsername(input: {
  username?: string;
  url?: string;
}): string | null {
  const raw = (input.url ?? input.username)?.trim();
  if (!raw) return null;
  const parsed = parseInstagramInput(raw);
  if (!parsed) return null;
  if (parsed.type === "profile" || parsed.type === "stories") {
    return parsed.username;
  }
  return null;
}

