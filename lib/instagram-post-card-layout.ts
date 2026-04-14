import {
  flattenMediaItem,
  formatCompactCount,
  formatRelativeTime,
  pickCaption,
  pickTakenTimestamp,
} from "@/lib/instagram-post-fields";
import { pickThumbnail } from "@/lib/instagram-normalize-media";

export type PostMediaKind = "image" | "video" | "carousel";

export type ResolvedPostMedia = {
  mediaUrl: string;
  thumbnailUrl: string;
  mediaType: PostMediaKind;
  isCarousel: boolean;
};

/**
 * Mirrors legacy `createPostCard` media selection: video_versions, carousel first slide, image_versions2.candidates.
 */
export function resolvePostMedia(post: Record<string, unknown>): ResolvedPostMedia {
  const isCarousel =
    Array.isArray(post.carousel_media) && (post.carousel_media as unknown[]).length > 0;

  const vv = post.video_versions as { url?: string }[] | undefined;
  if (Array.isArray(vv) && vv.length > 0 && vv[0]?.url) {
    const mediaUrl = String(vv[0].url);
    let thumbnailUrl = "";
    const iv2 = post.image_versions2 as { candidates?: { url?: string }[] } | undefined;
    if (iv2?.candidates?.length) {
      thumbnailUrl = String(iv2.candidates[0].url ?? "");
    }
    return { mediaUrl, thumbnailUrl, mediaType: "video", isCarousel: false };
  }

  if (isCarousel) {
    const first = (post.carousel_media as Record<string, unknown>[])[0];
    if (first && typeof first === "object") {
      const iv2 = first.image_versions2 as { candidates?: { url?: string }[] } | undefined;
      if (iv2?.candidates?.length) {
        const mediaUrl = String(iv2.candidates[0].url ?? "");
        return { mediaUrl, thumbnailUrl: "", mediaType: "carousel", isCarousel: true };
      }
      const fvv = first.video_versions as { url?: string }[] | undefined;
      if (Array.isArray(fvv) && fvv.length > 0 && fvv[0]?.url) {
        const mediaUrl = String(fvv[0].url);
        let thumbnailUrl = "";
        const civ2 = first.image_versions2 as { candidates?: { url?: string }[] } | undefined;
        if (civ2?.candidates?.length) {
          thumbnailUrl = String(civ2.candidates[0].url ?? "");
        }
        return { mediaUrl, thumbnailUrl, mediaType: "carousel", isCarousel: true };
      }
    }
  }

  const iv2 = post.image_versions2 as { candidates?: { url?: string }[] } | undefined;
  if (iv2?.candidates?.length) {
    const mediaUrl = String(iv2.candidates[0].url ?? "");
    return { mediaUrl, thumbnailUrl: "", mediaType: "image", isCarousel: false };
  }

  const fallback = pickThumbnail(post);
  return {
    mediaUrl: fallback,
    thumbnailUrl: "",
    mediaType: "image",
    isCarousel: false,
  };
}

export type StoryMediaKind = "image" | "video";

/** Legacy `createStoryCard` media: video_versions or image_versions2 only (no carousel). */
export function resolveStoryMedia(post: Record<string, unknown>): {
  mediaUrl: string;
  thumbnailUrl: string;
  mediaType: StoryMediaKind;
} {
  const vv = post.video_versions as { url?: string }[] | undefined;
  if (Array.isArray(vv) && vv.length > 0 && vv[0]?.url) {
    const mediaUrl = String(vv[0].url);
    let thumbnailUrl = "";
    const iv2 = post.image_versions2 as { candidates?: { url?: string }[] } | undefined;
    if (iv2?.candidates?.length) {
      thumbnailUrl = String(iv2.candidates[0].url ?? "");
    }
    return { mediaUrl, thumbnailUrl, mediaType: "video" };
  }
  const iv2 = post.image_versions2 as { candidates?: { url?: string }[] } | undefined;
  if (iv2?.candidates?.length) {
    return {
      mediaUrl: String(iv2.candidates[0].url ?? ""),
      thumbnailUrl: "",
      mediaType: "image",
    };
  }
  const fallback = pickThumbnail(post);
  return { mediaUrl: fallback, thumbnailUrl: "", mediaType: "image" };
}

export function buildStoryFilenameBase(
  story: Record<string, unknown>,
  highlightTitle: string,
  fallbackUsername: string,
): string {
  const flat = flattenMediaItem(story);
  const u =
    ((flat.user as { username?: string } | undefined)?.username ??
      (flat.owner as { username?: string } | undefined)?.username ??
      (typeof flat.username === "string" ? flat.username : "")) ||
    fallbackUsername;
  const code = pickPostCode(flat);
  if (highlightTitle.trim()) {
    return buildFilenameBase(highlightTitle, code);
  }
  const ts = pickTakenTimestamp(flat);
  const sec = ts != null && ts > 0 ? (ts > 1e12 ? Math.floor(ts / 1000) : ts) : null;
  const datePart =
    sec != null ? new Date(sec * 1000).toISOString().slice(0, 10) : "story";
  const slug = `${(u || "instagram").replace(/[^\w.-]/g, "")}-${datePart}`;
  return buildFilenameBase(slug, code);
}

export function timeLabelFromPost(post: Record<string, unknown>): string {
  const ts = pickTakenTimestamp(post);
  if (ts == null || ts <= 0) return "";
  return formatRelativeTime(ts);
}

export type CarouselSlide = {
  kind: "image" | "video";
  url: string;
  thumb?: string;
};

export function getCarouselSlides(post: Record<string, unknown>): CarouselSlide[] {
  const cm = post.carousel_media;
  if (!Array.isArray(cm) || cm.length === 0) return [];
  const out: CarouselSlide[] = [];
  for (const raw of cm) {
    const m = flattenMediaItem(raw as Record<string, unknown>);
    const fvv = m.video_versions as { url?: string }[] | undefined;
    if (Array.isArray(fvv) && fvv.length > 0 && fvv[0]?.url) {
      const iv2 = m.image_versions2 as { candidates?: { url?: string }[] } | undefined;
      const thumb = iv2?.candidates?.[0]?.url;
      out.push({
        kind: "video",
        url: String(fvv[0].url),
        thumb: thumb ? String(thumb) : undefined,
      });
      continue;
    }
    const iv2 = m.image_versions2 as { candidates?: { url?: string }[] } | undefined;
    if (iv2?.candidates?.[0]?.url) {
      out.push({ kind: "image", url: String(iv2.candidates[0].url) });
    }
  }
  return out;
}

export function overlayCaptionLine(caption: string): string {
  const first = (caption.split("\n")[0] ?? "").trim();
  if (first) return first.length > 50 ? first.slice(0, 50) : first;
  return caption.trim().slice(0, 50);
}

export function buildFilenameBase(caption: string, code: string): string {
  const base = caption
    .slice(0, 40)
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 30);
  return (base || "instagram") + "-" + (code || "post");
}

export function pickPostCode(post: Record<string, unknown>): string {
  return String(post.shortcode ?? post.code ?? "instagram-post").trim();
}

export { flattenMediaItem, formatCompactCount, pickCaption };
