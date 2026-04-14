/**
 * Moves SEO metadata (next-size-adjust, title, meta, canonical, hreflang, icons)
 * before the first Next.js stylesheet and following chunk scripts in <head>.
 *
 * Next.js / React emit hoisted assets before resolved metadata; this corrects
 * source order for audits without changing body or RSC payloads.
 */
export function reorderHeadHtml(html: string): string {
  const headOpen = html.indexOf("<head");
  if (headOpen === -1) return html;
  const headInnerStart = html.indexOf(">", headOpen) + 1;
  const headClose = html.indexOf("</head>", headInnerStart);
  if (headClose === -1) return html;

  const inner = html.slice(headInnerStart, headClose);

  const sizeAdjustIdx = inner.indexOf('<meta name="next-size-adjust"');
  const titleIdx = inner.indexOf("<title");
  let metaStart = -1;
  if (sizeAdjustIdx !== -1 && titleIdx !== -1) {
    metaStart = Math.min(sizeAdjustIdx, titleIdx);
  } else {
    metaStart = sizeAdjustIdx !== -1 ? sizeAdjustIdx : titleIdx;
  }
  if (metaStart === -1) return html;

  const sheetNeedle = '<link rel="stylesheet"';
  let sheetIdx = inner.indexOf(sheetNeedle);
  while (sheetIdx !== -1) {
    const tagEnd = inner.indexOf("/>", sheetIdx);
    if (tagEnd === -1) break;
    const tag = inner.slice(sheetIdx, tagEnd + 2);
    if (tag.includes("/_next/static")) break;
    sheetIdx = inner.indexOf(sheetNeedle, sheetIdx + 1);
  }
  if (sheetIdx === -1) return html;

  if (metaStart <= sheetIdx) return html;

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
  if (metaEnd === -1) return html;

  const preamble = inner.slice(0, sheetIdx);
  const assets = inner.slice(sheetIdx, metaStart);
  const metaBlock = inner.slice(metaStart, metaEnd);
  const tail = inner.slice(metaEnd);

  const newInner = preamble + metaBlock + assets + tail;
  return html.slice(0, headInnerStart) + newInner + html.slice(headClose);
}
