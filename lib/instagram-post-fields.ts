import {
  isLikelyVideo,
  pickPermalink,
  pickThumbnail,
  type MediaCard,
} from "@/lib/instagram-normalize-media";

const PLACEHOLDER_THUMB =
  "data:image/svg+xml," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect fill="#e5e7eb" width="100%" height="100%"/></svg>`,
  );

/** Merge GraphQL `node` and `media` into the parent (common in scraper APIs). */
export function flattenMediaItem(item: Record<string, unknown>): Record<string, unknown> {
  let o: Record<string, unknown> = { ...item };
  const node = o.node;
  if (node && typeof node === "object" && !Array.isArray(node)) {
    o = { ...o, ...(node as Record<string, unknown>) };
  }
  const m = o.media;
  if (m && typeof m === "object" && !Array.isArray(m)) {
    o = { ...o, ...(m as Record<string, unknown>) };
  }
  return o;
}

function num(n: unknown): number | null {
  if (typeof n === "number" && Number.isFinite(n)) return n;
  if (typeof n === "string" && n.trim() !== "") {
    const x = Number(n.replace(/,/g, ""));
    return Number.isFinite(x) ? x : null;
  }
  return null;
}

export function pickCaption(item: Record<string, unknown>): string {
  const cap = item.caption;
  if (typeof cap === "string") return cap.trim();
  if (cap && typeof cap === "object" && "text" in cap) {
    return String((cap as { text?: string }).text ?? "").trim();
  }
  const edge = item.edge_media_to_caption as { edges?: unknown[] } | undefined;
  const edges = edge?.edges;
  if (Array.isArray(edges) && edges[0] && typeof edges[0] === "object") {
    const n = (edges[0] as { node?: { text?: string } }).node;
    if (n?.text) return String(n.text).trim();
  }
  const plain = item.title ?? item.description ?? item.text ?? item.caption_text;
  if (typeof plain === "string" && plain.trim()) return plain.trim();
  return "";
}

export function pickLikeCount(item: Record<string, unknown>): number | null {
  const by = item.edge_liked_by;
  const byCount =
    typeof by === "object" && by !== null && "count" in by
      ? num((by as { count: unknown }).count)
      : null;
  const previewLike = item.edge_media_preview_like;
  const previewCount =
    typeof previewLike === "object" && previewLike !== null && "count" in previewLike
      ? num((previewLike as { count: unknown }).count)
      : typeof previewLike === "number"
        ? previewLike
        : null;

  return (
    num(item.like_count) ??
    num(item.likes) ??
    byCount ??
    previewCount ??
    num((item.like_and_view_counts as { like_count?: unknown } | undefined)?.like_count)
  );
}

export function pickCommentCount(item: Record<string, unknown>): number | null {
  const c = item.edge_media_to_comment;
  const cc =
    typeof c === "object" && c !== null && "count" in c
      ? num((c as { count: unknown }).count)
      : null;
  return num(item.comment_count) ?? num(item.comments) ?? cc;
}

export function pickTakenTimestamp(item: Record<string, unknown>): number | null {
  return (
    num(item.taken_at_timestamp) ??
    num(item.device_timestamp) ??
    num(item.taken_at) ??
    num(item.created_time) ??
    num(item.timestamp) ??
    num(item.date)
  );
}

export function formatCompactCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

export function formatRelativeTime(tsSeconds: number): string {
  const t = tsSeconds > 1e12 ? Math.floor(tsSeconds / 1000) : tsSeconds;
  const now = Date.now() / 1000;
  const d = now - t;
  if (d < 60) return "just now";
  if (d < 3600) return `${Math.floor(d / 60)}m ago`;
  if (d < 86400) return `${Math.floor(d / 3600)}h ago`;
  if (d < 86400 * 7) return `${Math.floor(d / 86400)}d ago`;
  if (d < 86400 * 30) return `${Math.floor(d / (86400 * 7))}w ago`;
  return `${Math.floor(d / (86400 * 30))}mo ago`;
}

function pickVideoDownloadUrl(item: Record<string, unknown>): string {
  const vv = item.video_versions;
  if (Array.isArray(vv) && vv.length > 0) {
    const best = vv.reduce(
      (a, b) => {
        const wa = num((a as { width?: unknown }).width) ?? 0;
        const wb = num((b as { width?: unknown }).width) ?? 0;
        return wb > wa ? b : a;
      },
      vv[0],
    );
    if (best && typeof best === "object" && "url" in best) {
      const u = String((best as { url: string }).url);
      if (u) return u;
    }
  }
  return String(item.video_url ?? item.url ?? "");
}

export function pickDownloadUrl(item: Record<string, unknown>): string {
  if (isLikelyVideo(item)) {
    const v = pickVideoDownloadUrl(item);
    if (v) return v;
  }
  return String(
    item.display_url ?? pickThumbnail(item) ?? "",
  );
}

export type RichPostCard = MediaCard & {
  caption: string;
  likesLabel: string;
  commentsLabel: string;
  timeLabel: string;
  downloadUrl: string;
};

export function toRichPostCard(
  raw: Record<string, unknown>,
  profileUrlFallback: string,
): RichPostCard {
  const item = flattenMediaItem(raw);
  const thumb = pickThumbnail(item);
  let href = pickPermalink(item);
  if (href === "#") href = profileUrlFallback;

  const likes = pickLikeCount(item);
  const comments = pickCommentCount(item);
  const ts = pickTakenTimestamp(item);

  const likesLabel = likes != null && likes >= 0 ? formatCompactCount(likes) : "—";
  const commentsLabel = comments != null && comments >= 0 ? formatCompactCount(comments) : "—";
  const timeLabel = ts != null && ts > 0 ? formatRelativeTime(ts) : "—";

  const downloadUrl = pickDownloadUrl(item);
  const caption = pickCaption(item) || "—";

  const card = {
    thumbUrl: thumb || PLACEHOLDER_THUMB,
    href,
    isVideo: isLikelyVideo(item),
    caption,
    likesLabel,
    commentsLabel,
    timeLabel,
    downloadUrl: downloadUrl || href,
  };
  return card;
}
