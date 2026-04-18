/**
 * Moves SEO metadata (next-size-adjust, title, meta, canonical, hreflang, icons)
 * before the first Next.js stylesheet and following chunk scripts in <head>.
 *
 * Next.js / React emit hoisted assets before resolved metadata; this corrects
 * source order for audits without changing body or RSC payloads.
 */

/**
 * Robots, Open Graph, Twitter, author, publisher — before canonical & hreflang.
 */
function moveGlobalMetaBeforeCanonical(inner: string): string {
  const canonNeedle = '<link rel="canonical"';
  const canonIdx = inner.indexOf(canonNeedle);
  if (canonIdx === -1) return inner;

  type Span = { start: number; end: number; html: string };

  function sliceMetaStartingAt(start: number): Span | null {
    const endSelf = inner.indexOf("/>", start);
    const endGt = inner.indexOf(">", start);
    let end = -1;
    if (endSelf !== -1 && (endGt === -1 || endSelf < endGt)) {
      end = endSelf + 2;
    } else if (endGt !== -1) {
      end = endGt + 1;
    }
    if (end === -1) return null;
    return { start, end, html: inner.slice(start, end) };
  }

  function findMeta(needle: string): Span | null {
    const start = inner.indexOf(needle);
    if (start === -1) return null;
    return sliceMetaStartingAt(start);
  }

  /** First `og:image` tag only (skip `og:image:width`, etc.). */
  function findOgImage(): Span | null {
    const prefix = '<meta property="og:image"';
    let pos = 0;
    while (pos < inner.length) {
      const start = inner.indexOf(prefix, pos);
      if (start === -1) return null;
      const rest = inner.slice(start + prefix.length);
      if (!rest.startsWith(":")) {
        const span = sliceMetaStartingAt(start);
        if (span) return span;
      }
      pos = start + 1;
    }
    return null;
  }

  const META_BEFORE_CANON_ORDER = [
    '<meta name="robots"',
    '<meta name="theme-color"',
    '<meta property="og:locale"',
    "__og_image__",
    '<meta property="og:title"',
    '<meta property="og:description"',
    '<meta name="twitter:card"',
    '<meta name="twitter:title"',
    '<meta name="twitter:description"',
    '<meta name="twitter:image"',
    '<meta name="author"',
    '<meta name="publisher"',
    '<meta name="theme-color"',
  ] as const;

  const spans: Span[] = [];
  for (const key of META_BEFORE_CANON_ORDER) {
    const s =
      key === "__og_image__" ? findOgImage() : findMeta(key);
    if (s) spans.push(s);
  }

  const unique = spans.filter(
    (s, i, arr) => arr.findIndex((t) => t.start === s.start) === i,
  );
  if (unique.length === 0) return inner;

  unique.sort((a, b) => a.start - b.start);

  const extracted = unique.map((s) => s.html).join("");
  let stripped = inner;
  for (let i = unique.length - 1; i >= 0; i--) {
    const { start, end } = unique[i]!;
    stripped = stripped.slice(0, start) + stripped.slice(end);
  }

  const newCanonIdx = stripped.indexOf(canonNeedle);
  if (newCanonIdx === -1) return inner;

  return (
    stripped.slice(0, newCanonIdx) + extracted + stripped.slice(newCanonIdx)
  );
}

/** Moves `<meta name="next-size-adjust">` and `<title>` before the first Next.js stylesheet. */
function reorderMetaBlockBeforeAssets(inner: string): string | null {
  const sizeAdjustIdx = inner.indexOf('<meta name="next-size-adjust"');
  const titleIdx = inner.indexOf("<title");
  let metaStart = -1;
  if (sizeAdjustIdx !== -1 && titleIdx !== -1) {
    metaStart = Math.min(sizeAdjustIdx, titleIdx);
  } else {
    metaStart = sizeAdjustIdx !== -1 ? sizeAdjustIdx : titleIdx;
  }
  if (metaStart === -1) return null;

  const sheetNeedle = '<link rel="stylesheet"';
  let sheetIdx = inner.indexOf(sheetNeedle);
  while (sheetIdx !== -1) {
    const tagEnd = inner.indexOf("/>", sheetIdx);
    if (tagEnd === -1) break;
    const tag = inner.slice(sheetIdx, tagEnd + 2);
    if (tag.includes("/_next/static")) break;
    sheetIdx = inner.indexOf(sheetNeedle, sheetIdx + 1);
  }
  if (sheetIdx === -1) return null;

  if (metaStart <= sheetIdx) return null;

  let metaEnd = -1;
  const appleIdx = inner.indexOf('<link rel="apple-touch-icon"', metaStart);
  if (appleIdx !== -1) {
    metaEnd = inner.indexOf("/>", appleIdx) + 2;
  } else {
    const shortcutIdx = inner.indexOf('<link rel="shortcut icon"', metaStart);
    if (shortcutIdx !== -1) {
      metaEnd = inner.indexOf("/>", shortcutIdx) + 2;
    }
  }
  if (metaEnd === -1) return null;

  const preamble = inner.slice(0, sheetIdx);
  const assets = inner.slice(sheetIdx, metaStart);
  const metaBlock = inner.slice(metaStart, metaEnd);
  const tail = inner.slice(metaEnd);

  return preamble + metaBlock + assets + tail;
}

const SITEMAP_LINK =
  '<link rel="sitemap" type="application/xml" href="/sitemap_index.xml"/>';

const GA_MEASUREMENT_ID = "G-B716H6W4TC";

/** Google tag (gtag.js): matches requested snippet (no Cloudflare `type="…-text/javascript"` — that is added by the CDN). */
const GOOGLE_TAG_SNIPPET =
  `<script async src="https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}"></script>` +
  `<script>function gtag(){dataLayer.push(arguments)}window.dataLayer=window.dataLayer||[],gtag("js",new Date),gtag("config","${GA_MEASUREMENT_ID}")</script>`;

function endIndexAfterSitemapLink(inner: string): number {
  const exact = inner.indexOf(SITEMAP_LINK);
  if (exact !== -1) return exact + SITEMAP_LINK.length;
  const s = inner.indexOf('<link rel="sitemap"');
  if (s === -1) return -1;
  const end = inner.indexOf("/>", s);
  if (end === -1) return -1;
  return end + 2;
}

/** Inserts gtag immediately after the sitemap `<link>`. */
function insertGoogleTagAfterSitemap(inner: string): string {
  if (inner.includes("googletagmanager.com/gtag/js")) return inner;
  const afterSitemap = endIndexAfterSitemapLink(inner);
  if (afterSitemap === -1) return inner;
  return (
    inner.slice(0, afterSitemap) + GOOGLE_TAG_SNIPPET + inner.slice(afterSitemap)
  );
}

/** After last `link[rel="alternate"]` (hreflang); else after canonical. */
function insertSitemapLinkAfterAlternates(inner: string): string {
  if (inner.includes('rel="sitemap"')) return inner;

  let lastAltEnd = -1;
  let pos = 0;
  while (pos < inner.length) {
    const start = inner.indexOf('<link rel="alternate"', pos);
    if (start === -1) break;
    const end = inner.indexOf("/>", start);
    if (end === -1) break;
    lastAltEnd = end + 2;
    pos = lastAltEnd;
  }

  let insertAt: number;
  if (lastAltEnd !== -1) {
    insertAt = lastAltEnd;
  } else {
    const canonNeedle = '<link rel="canonical"';
    const c = inner.indexOf(canonNeedle);
    if (c === -1) return inner;
    const end = inner.indexOf("/>", c);
    if (end === -1) return inner;
    insertAt = end + 2;
  }

  return inner.slice(0, insertAt) + SITEMAP_LINK + inner.slice(insertAt);
}

export function reorderHeadHtml(html: string): string {
  const headOpen = html.indexOf("<head");
  if (headOpen === -1) return html;
  const headInnerStart = html.indexOf(">", headOpen) + 1;
  const headClose = html.indexOf("</head>", headInnerStart);
  if (headClose === -1) return html;

  let inner = html.slice(headInnerStart, headClose);
  const assetsReordered = reorderMetaBlockBeforeAssets(inner);
  if (assetsReordered !== null) {
    inner = assetsReordered;
  }
  inner = moveGlobalMetaBeforeCanonical(inner);
  inner = insertSitemapLinkAfterAlternates(inner);
  inner = insertGoogleTagAfterSitemap(inner);

  return html.slice(0, headInnerStart) + inner + html.slice(headClose);
}
