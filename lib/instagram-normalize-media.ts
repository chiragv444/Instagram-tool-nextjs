function asObjectArray(x: unknown): Record<string, unknown>[] | null {
  if (!Array.isArray(x)) return null;
  const out = x.filter((i) => i && typeof i === "object") as Record<string, unknown>[];
  return out.length ? out : null;
}

function edgesToNodes(edges: unknown): Record<string, unknown>[] | null {
  if (!Array.isArray(edges)) return null;
  const nodes = edges
    .map((e) => {
      if (e && typeof e === "object" && "node" in (e as object)) {
        return (e as { node: unknown }).node;
      }
      return e;
    })
    .filter((n) => n && typeof n === "object") as Record<string, unknown>[];
  return nodes.length ? nodes : null;
}

/** Pull media rows from one object (RapidAPI / GraphQL-style). */
function extractArrayFromRecord(obj: Record<string, unknown>): Record<string, unknown>[] | null {
  const listKeys = [
    "items",
    "medias",
    "posts",
    "user_posts",
    "feed",
    "rows",
    "contents",
    "media",
    "reels",
    "stories",
    "highlights",
    "highlight_reels",
    "edge_highlight_reels",
    "highlight_tray",
    "tray",
    "result",
    "response",
    "data",
  ];
  for (const key of listKeys) {
    const inner = obj[key];
    const arr = asObjectArray(inner);
    if (arr) return arr;
    if (inner && typeof inner === "object" && !Array.isArray(inner)) {
      const nested = extractArrayFromRecord(inner as Record<string, unknown>);
      if (nested) return nested;
    }
  }
  const fromEdges = edgesToNodes(obj.edges);
  if (fromEdges) return fromEdges;
  const timeline = obj.edge_owner_to_timeline_media as { edges?: unknown } | undefined;
  if (timeline) {
    const fromT = edgesToNodes(timeline.edges);
    if (fromT) return fromT;
  }
  return null;
}

function hasMediaUrlFields(obj: Record<string, unknown>): boolean {
  const u = obj.url;
  const urlOk = typeof u === "string" && /^https?:\/\//i.test(u);
  const cover = obj.cover_media;
  if (cover && typeof cover === "object") {
    const c = cover as Record<string, unknown>;
    if (
      c.cropped_thumbnail_url ??
      c.cropped_image_version ??
      c.thumbnail_url ??
      (typeof c.media === "object" && c.media !== null)
    ) {
      return true;
    }
  }
  return Boolean(
    obj.display_url ??
      obj.thumbnail_url ??
      obj.image_versions2 ??
      obj.video_versions ??
      obj.thumbnail_src ??
      obj.media_url ??
      obj.image_url ??
      obj.photo_url ??
      obj.carousel_media ??
      obj.resources ??
      urlOk,
  );
}

/** Highlight tray rows often only have `title` + `id` + `cover_media` (no feed-style media fields). */
function looksLikeHighlightTrayRow(obj: Record<string, unknown>): boolean {
  if (obj.cover_media && typeof obj.cover_media === "object") return true;
  const t = obj.title ?? obj.highlight_title ?? obj.name;
  if (
    typeof t === "string" &&
    t.length > 0 &&
    (obj.id != null || obj.pk != null || obj.highlight_id != null)
  ) {
    return true;
  }
  return false;
}

/** GraphQL / app responses often wrap each row as `{ node: { id, title, cover_media }, cursor }`. */
function unwrapHighlightTrayRow(item: Record<string, unknown>): Record<string, unknown> {
  const node = item.node;
  if (node && typeof node === "object" && node !== null) {
    const n = node as Record<string, unknown>;
    if (looksLikeHighlightTrayRow(n)) return n;
  }
  return item;
}

/** Avoid treating sparse id-only arrays as posts (they have no thumbnails). */
function looksLikeMediaRow(obj: Record<string, unknown>): boolean {
  if (hasMediaUrlFields(obj)) return true;
  if (looksLikeHighlightTrayRow(obj)) return true;
  const code = obj.shortcode ?? obj.code;
  const nestedMedia = obj.media && typeof obj.media === "object";
  return Boolean(code && nestedMedia);
}

/** Last resort: find an array of objects that look like media rows. */
function deepFindMediaList(value: unknown, depth = 0): Record<string, unknown>[] {
  if (depth > 14 || value == null) return [];
  if (Array.isArray(value)) {
    const objs = value.filter((x) => x && typeof x === "object") as Record<string, unknown>[];
    if (objs.length > 0 && looksLikeMediaRow(objs[0])) return objs;
    for (const el of value) {
      const inner = deepFindMediaList(el, depth + 1);
      if (inner.length) return inner;
    }
    return [];
  }
  if (typeof value !== "object") return [];
  for (const v of Object.values(value as object)) {
    const inner = deepFindMediaList(v, depth + 1);
    if (inner.length) return inner;
  }
  return [];
}

function extractMediaLikeItemsInner(o: Record<string, unknown>): Record<string, unknown>[] {
  const direct = asObjectArray(o);
  if (direct) return direct;

  const fromRoot = extractArrayFromRecord(o);
  if (fromRoot) return fromRoot;

  const data = o.data;
  if (data && typeof data === "object") {
    const d = data as Record<string, unknown>;
    const fromData = asObjectArray(d) ?? extractArrayFromRecord(d);
    if (fromData) return fromData;
  }

  return [];
}

/** Flatten common Instagram JSON shapes into a list of media-like objects. */
export function extractMediaLikeItems(payload: unknown): Record<string, unknown>[] {
  let p: unknown = payload;
  if (typeof p === "string") {
    try {
      p = JSON.parse(p) as unknown;
    } catch {
      return [];
    }
  }
  if (!p || typeof p !== "object") return [];
  const o = p as Record<string, unknown>;

  const first = extractMediaLikeItemsInner(o);
  if (first.length) return first;

  return deepFindMediaList(p);
}

const CURSOR_KEYS = [
  "pagination_token",
  "next_cursor",
  "end_cursor",
  "cursor",
  "next_max_id",
  "max_id",
] as const;

function readCursorFromRecord(r: Record<string, unknown>): string | null {
  for (const k of CURSOR_KEYS) {
    const v = r[k];
    if (typeof v === "string" && v.trim().length > 0) return v.trim();
  }
  const pi = r.page_info;
  if (pi && typeof pi === "object" && pi !== null) {
    const p = pi as Record<string, unknown>;
    for (const k of CURSOR_KEYS) {
      const v = p[k];
      if (typeof v === "string" && v.trim().length > 0) return v.trim();
    }
  }
  return null;
}

/** Next page token for `postsV2` / `pagination_token` (RapidAPI / Instagram-style payloads). */
export function extractFeedPaginationCursor(payload: unknown): string | null {
  const visit = (node: unknown): string | null => {
    if (node == null) return null;
    if (typeof node !== "object") return null;
    const r = node as Record<string, unknown>;
    const direct = readCursorFromRecord(r);
    if (direct) return direct;
    const data = r.data;
    if (data && typeof data === "object") {
      const inner = readCursorFromRecord(data as Record<string, unknown>);
      if (inner) return inner;
    }
    return null;
  };
  const top = visit(payload);
  if (top) return top;
  if (payload && typeof payload === "object" && "data" in payload) {
    return visit((payload as { data: unknown }).data);
  }
  return null;
}

/**
 * Highlights list from `get_ig_user_highlights.php` — often nested (e.g. `tray`, `reels.items`) or
 * tray-shaped rows with only `id` + `title` + `cover_media`. Falls back when `extractMediaLikeItems` is empty.
 */
export function extractHighlightTrayItems(payload: unknown): Record<string, unknown>[] {
  const first = extractMediaLikeItems(payload);
  if (first.length > 0) return first.map(unwrapHighlightTrayRow);
  return findArrayOfHighlightLikeObjects(payload, 0);
}

function findArrayOfHighlightLikeObjects(value: unknown, depth: number): Record<string, unknown>[] {
  if (depth > 22 || value == null) return [];
  if (Array.isArray(value)) {
    const objs = value.filter((x) => x && typeof x === "object") as Record<string, unknown>[];
    if (objs.length > 0) {
      const head = unwrapHighlightTrayRow(objs[0]);
      const looksHighlight =
        (head.cover_media != null && typeof head.cover_media === "object") ||
        (typeof head.title === "string" &&
          head.title.length > 0 &&
          (head.id != null || head.pk != null || head.highlight_id != null)) ||
        head.highlight_reel != null ||
        (typeof head.highlight_title === "string" && (head.id != null || head.pk != null));
      if (looksHighlight) return objs.map(unwrapHighlightTrayRow);
    }
    for (const el of value) {
      const inner = findArrayOfHighlightLikeObjects(el, depth + 1);
      if (inner.length > 0) return inner;
    }
    return [];
  }
  if (typeof value !== "object") return [];
  for (const v of Object.values(value as object)) {
    const inner = findArrayOfHighlightLikeObjects(v, depth + 1);
    if (inner.length > 0) return inner;
  }
  return [];
}

const PLACEHOLDER_THUMB =
  "data:image/svg+xml," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect fill="#e5e7eb" width="100%" height="100%"/></svg>`,
  );

export function pickThumbnail(item: Record<string, unknown>): string {
  const iv2 = item.image_versions2 as { candidates?: { url?: string }[] } | undefined;
  const cover = item.cover_media as
    | {
        cropped_thumbnail_url?: string;
        cropped_image_version?: { url?: string };
        media?: { display_url?: string };
      }
    | undefined;
  const media = item.media as { display_url?: string; thumbnail_url?: string } | undefined;
  const resources = item.resources as { src?: string }[] | undefined;
  const res0 =
    Array.isArray(resources) && resources[0] && typeof resources[0] === "object"
      ? String((resources[0] as { src?: string }).src ?? "")
      : "";
  const srcField = item.src;
  const srcOk =
    typeof srcField === "string" && /^https?:\/\//i.test(srcField) ? srcField : "";

  const direct = String(
    item.thumbnail_url ??
      item.display_url ??
      item.preview_image_url ??
      item.thumbnail_src ??
      item.thumbnail ??
      item.photo_url ??
      item.image_url ??
      item.image ??
      item.media_url ??
      item.poster ??
      (typeof item.url === "string" && item.url.match(/\.(jpg|jpeg|png|webp)/i) ? item.url : "") ??
      media?.display_url ??
      media?.thumbnail_url ??
      iv2?.candidates?.[0]?.url ??
      cover?.cropped_image_version?.url ??
      cover?.cropped_thumbnail_url ??
      cover?.media?.display_url ??
      res0 ??
      srcOk ??
      "",
  );
  if (direct) return direct;

  const fallbackUrl = item.url;
  if (typeof fallbackUrl === "string" && fallbackUrl.startsWith("http")) {
    return fallbackUrl;
  }

  const cm = item.carousel_media;
  if (Array.isArray(cm) && cm[0] && typeof cm[0] === "object") {
    return pickThumbnail(cm[0] as Record<string, unknown>);
  }

  return "";
}

/** Highlight row: prefer `cover_media.cropped_image_version.url` (legacy Fastify UI). */
export function pickHighlightCoverUrl(item: Record<string, unknown>): string {
  const cover = item.cover_media;
  if (cover && typeof cover === "object" && cover !== null) {
    const c = cover as { cropped_image_version?: { url?: string } };
    const u = c.cropped_image_version?.url;
    if (typeof u === "string" && u.startsWith("http")) return u;
  }
  return pickThumbnail(item);
}

export function pickPermalink(item: Record<string, unknown>): string {
  const code = item.shortcode ?? item.code ?? item.media_shortcode;
  if (typeof code === "string" && code.length > 0) {
    if (isLikelyReel(item)) {
      return `https://www.instagram.com/reel/${code}/`;
    }
    return `https://www.instagram.com/p/${code}/`;
  }
  const link = item.link ?? item.permalink;
  if (typeof link === "string" && link.includes("instagram.com")) {
    try {
      const path = new URL(link).pathname.split("/").filter(Boolean);
      const pi = path.indexOf("p");
      if (pi >= 0 && path[pi + 1]) {
        return `https://www.instagram.com/p/${path[pi + 1]}/`;
      }
      const ri = path.indexOf("reel");
      if (ri >= 0 && path[ri + 1]) {
        return `https://www.instagram.com/reel/${path[ri + 1]}/`;
      }
    } catch {
      /* ignore */
    }
  }
  const pk = item.pk ?? item.id;
  if (pk != null) return `#media-${pk}`;
  return "#";
}

export function isLikelyReel(item: Record<string, unknown>): boolean {
  if (item.product_type === "clips") return true;
  if (String(item.media_type) === "2" && item.video_versions) return true;
  if (String(item.__typename ?? "").toLowerCase().includes("reel")) return true;
  return false;
}

export function isLikelyVideo(item: Record<string, unknown>): boolean {
  return Boolean(
    item.video_versions ??
      item.is_video ??
      item.has_video ??
      item.video_url ??
      (item.media_type != null && Number(item.media_type) === 2),
  );
}

export type MediaCard = {
  thumbUrl: string;
  href: string;
  isVideo: boolean;
};

export function toMediaCard(item: Record<string, unknown>): MediaCard | null {
  const href = pickPermalink(item);
  const thumbUrl = pickThumbnail(item);
  if (!thumbUrl && href === "#") return null;
  return {
    thumbUrl: thumbUrl || PLACEHOLDER_THUMB,
    href,
    isVideo: isLikelyVideo(item),
  };
}

export function pickHighlightTitle(item: Record<string, unknown>): string {
  return String(item.title ?? item.highlight_title ?? item.name ?? "Highlight");
}

/**
 * RapidAPI `get_highlights_stories.php` expects `highlight_id` like `highlight:18013275710773447`,
 * not a bare numeric id.
 */
function normalizeHighlightIdForStoriesApi(raw: string): string {
  const s = raw.trim();
  if (!s) return "";
  if (/^highlight:/i.test(s)) return s;
  if (/^\d+$/.test(s)) return `highlight:${s}`;
  return s;
}

/** ID for `get_highlights_stories.php` / highlightStory API (legacy uses `highlight.id`). */
export function pickHighlightId(item: Record<string, unknown>): string {
  const direct =
    item.id ??
    item.pk ??
    item.highlight_id ??
    item.highlight_reel_id ??
    item.media_id ??
    item.reel_id;
  if (direct != null && String(direct).trim() !== "") {
    return normalizeHighlightIdForStoriesApi(String(direct));
  }
  const reel = item.reel;
  if (reel && typeof reel === "object" && reel !== null && "id" in reel) {
    const rid = (reel as { id?: unknown }).id;
    if (rid != null && String(rid).trim() !== "") {
      return normalizeHighlightIdForStoriesApi(String(rid));
    }
  }
  const hr = item.highlight_reel;
  if (hr && typeof hr === "object" && hr !== null && "id" in hr) {
    const hid = (hr as { id?: unknown }).id;
    if (hid != null && String(hid).trim() !== "") {
      return normalizeHighlightIdForStoriesApi(String(hid));
    }
  }
  return "";
}
