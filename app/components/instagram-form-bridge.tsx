"use client";

import { useEffect } from "react";
import {
  extractFeedPaginationCursor,
  extractHighlightTrayItems,
  extractMediaLikeItems,
  isLikelyReel,
  isLikelyVideo,
  pickHighlightCoverUrl,
  pickHighlightId,
  pickHighlightTitle,
  pickPermalink,
  pickThumbnail,
} from "@/lib/instagram-normalize-media";
import { pickCommentCount, pickLikeCount } from "@/lib/instagram-post-fields";
import {
  buildFilenameBase,
  buildStoryFilenameBase,
  flattenMediaItem,
  formatCompactCount,
  getCarouselSlides,
  overlayCaptionLine,
  pickCaption,
  pickPostCode,
  resolvePostMedia,
  resolveStoryMedia,
  timeLabelFromPost,
  type CarouselSlide,
} from "@/lib/instagram-post-card-layout";
import { proxiedImageUrl, proxiedVideoUrl } from "@/lib/proxy-client";

/** Match `trailingSlash: true` in next.config so POST is not redirected. */
const API = {
  /** Server HMAC for Fastify-style `token` / `timestamp` / `secretToken` on all `/api/v1/*` calls */
  authSign: "/api/v1/auth/sign/",
  userInfo: "/api/v1/userInfo/",
  postsV2: "/api/v1/postsV2/",
  /** RapidAPI `get_ig_user_stories.php` — same contract as Fastify POST /v1/stories */
  stories: "/api/v1/stories/",
  /** RapidAPI `get_ig_user_highlights.php` — same contract as Fastify POST /v1/highlights */
  highlights: "/api/v1/highlights/",
  /** RapidAPI `get_highlights_stories.php` — same contract as Fastify POST /v1/highlightStory */
  highlightStory: "/api/v1/highlightStory/",
} as const;

type InstagramSessionAuth = {
  username: string;
  url: string;
  token: string;
  timestamp: string;
  secretToken: string;
};

let sessionAuth: InstagramSessionAuth | null = null;

function clearSessionAuth() {
  sessionAuth = null;
}

async function fetchSessionAuthFromInput(raw: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch(API.authSign, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: raw, username: raw }),
    });
    const payload = (await res.json()) as {
      success?: boolean;
      error?: string;
      username?: string;
      url?: string;
      token?: string;
      timestamp?: string;
      secretToken?: string;
    };
    if (
      !res.ok ||
      !payload.success ||
      !payload.username ||
      !payload.url ||
      !payload.token ||
      !payload.timestamp ||
      !payload.secretToken
    ) {
      return {
        ok: false,
        error: typeof payload.error === "string" ? payload.error : "Could not create session signature.",
      };
    }
    sessionAuth = {
      username: payload.username,
      url: payload.url,
      token: payload.token,
      timestamp: payload.timestamp,
      secretToken: payload.secretToken,
    };
    return { ok: true };
  } catch {
    return { ok: false, error: "Network error while signing request." };
  }
}

async function refreshSessionAuthForUsername(username: string): Promise<boolean> {
  const url = `https://www.instagram.com/${username}/`;
  try {
    const res = await fetch(API.authSign, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, url }),
    });
    const payload = (await res.json()) as {
      success?: boolean;
      username?: string;
      url?: string;
      token?: string;
      timestamp?: string;
      secretToken?: string;
    };
    if (
      !res.ok ||
      !payload.success ||
      !payload.username ||
      !payload.url ||
      !payload.token ||
      !payload.timestamp ||
      !payload.secretToken
    ) {
      return false;
    }
    sessionAuth = {
      username: payload.username,
      url: payload.url,
      token: payload.token,
      timestamp: payload.timestamp,
      secretToken: payload.secretToken,
    };
    return true;
  } catch {
    return false;
  }
}

function coerceNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const n = Number(value.replace(/,/g, ""));
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function pickUserRoot(data: unknown): Record<string, unknown> | null {
  if (!data || typeof data !== "object") return null;
  const o = data as Record<string, unknown>;
  if (o.user && typeof o.user === "object") {
    return o.user as Record<string, unknown>;
  }
  if (o.data && typeof o.data === "object") {
    const d = o.data as Record<string, unknown>;
    if (d.user && typeof d.user === "object") {
      return d.user as Record<string, unknown>;
    }
    return d;
  }
  return o;
}

function mapUserInfoToProfile(data: unknown): {
  username: string;
  biography: string;
  followers: string;
  following: string;
  posts: string;
  profilePicUrl: string;
  profileUrl: string;
} | null {
  const u = pickUserRoot(data);
  if (!u) return null;

  const username = String(u.username ?? u.user_name ?? "").trim();
  if (!username) return null;

  const biography = String(u.biography ?? u.bio ?? "");

  const edgeFollowed = u.edge_followed_by as { count?: unknown } | undefined;
  const edgeFollow = u.edge_follow as { count?: unknown } | undefined;
  const edgeMedia = u.edge_owner_to_timeline_media as { count?: unknown } | undefined;

  const followers =
    coerceNumber(u.follower_count) ??
    coerceNumber(u.followers) ??
    coerceNumber(edgeFollowed?.count) ??
    0;
  const following =
    coerceNumber(u.following_count) ??
    coerceNumber(u.following) ??
    coerceNumber(edgeFollow?.count) ??
    0;
  const posts =
    coerceNumber(u.media_count) ??
    coerceNumber(edgeMedia?.count) ??
    0;

  const hdInfo = u.hd_profile_pic_url_info;
  const hdFromInfo =
    typeof hdInfo === "object" &&
    hdInfo !== null &&
    "url" in hdInfo &&
    typeof (hdInfo as { url: unknown }).url === "string"
      ? (hdInfo as { url: string }).url
      : "";

  const profilePicUrl = String(
    u.profile_pic_url_hd ?? u.profile_pic_url ?? hdFromInfo ?? "",
  );

  return {
    username,
    biography,
    followers: String(followers),
    following: String(following),
    posts: String(posts),
    profilePicUrl,
    profileUrl: `https://www.instagram.com/${username}/`,
  };
}

function show(el: HTMLElement | null) {
  if (el) el.classList.remove("hidden");
}

function hide(el: HTMLElement | null) {
  if (el) el.classList.add("hidden");
}

function setHighlightsEmptyBanner(message: string | null) {
  const el = document.getElementById("highlights-empty-message");
  if (!el) return;
  if (message) {
    el.textContent = message;
    show(el);
  } else {
    hide(el);
  }
}

function setText(id: string, text: string) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

const TAB_PANEL: Record<string, string> = {
  posts: "instagram-posts",
  reels: "instagram-reels",
  stories: "instagram-stories",
  highlights: "instagram-highlights",
};

const PANEL_IDS = Object.values(TAB_PANEL);

function setTabActive(name: string) {
  const tabsRoot = document.getElementById("instagram-tabs");
  if (!tabsRoot) return;
  tabsRoot.querySelectorAll(".tab-btn").forEach((btn) => {
    const el = btn as HTMLElement;
    const tab = el.getAttribute("data-tab");
    const active = tab === name;
    el.classList.toggle("active", active);
    el.classList.toggle("text-gray-900", active);
    el.classList.toggle("text-gray-500", !active);
    el.classList.toggle("border-pink-500", active);
    el.classList.toggle("border-transparent", !active);
  });

  for (const id of PANEL_IDS) {
    hide(document.getElementById(id));
  }
  const panelId = TAB_PANEL[name];
  if (panelId) show(document.getElementById(panelId));
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function downloadPostMedia(
  directUrl: string,
  mediaType: "image" | "video" | "carousel",
  filenameBase: string,
): void {
  if (!directUrl) return;
  const treatAsVideo =
    mediaType === "video" ||
    (mediaType === "carousel" && /\.(mp4|webm)(\?|$)/i.test(directUrl));
  const url = treatAsVideo ? proxiedVideoUrl(directUrl) : proxiedImageUrl(directUrl);
  const ext = treatAsVideo ? "mp4" : "jpg";
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filenameBase}.${ext}`;
  a.target = "_blank";
  a.rel = "noreferrer";
  document.body.appendChild(a);
  a.click();
  a.remove();
}

let modalPost: Record<string, unknown> | null = null;
let modalSlides: CarouselSlide[] = [];
let modalSlideIndex = 0;
type ModalDownload = { url: string; isVideo: boolean; filenameBase: string };
let modalDownloadTarget: ModalDownload | null = null;

function hidePostModal() {
  const shell = document.getElementById("instagram-post-modal");
  shell?.classList.add("hidden");
  shell?.classList.remove("flex");
  const mainVid = document.getElementById("instagram-modal-video-element") as HTMLVideoElement | null;
  if (mainVid) {
    mainVid.pause();
    mainVid.removeAttribute("src");
    mainVid.load();
  }
  const carVid = document.getElementById("instagram-modal-carousel-video") as HTMLVideoElement | null;
  if (carVid) {
    carVid.pause();
    carVid.removeAttribute("src");
    carVid.load();
  }
  modalPost = null;
  modalSlides = [];
  modalDownloadTarget = null;
}

function renderModalCarouselSlide(i: number) {
  const slide = modalSlides[i];
  if (!slide) return;
  const imgEl = document.getElementById("instagram-modal-carousel-image") as HTMLImageElement | null;
  const vidEl = document.getElementById("instagram-modal-carousel-video") as HTMLVideoElement | null;
  if (!imgEl || !vidEl) return;
  const caption = pickCaption(modalPost ?? {});
  const code = pickPostCode(modalPost ?? {});
  const base = buildFilenameBase(caption, code);

  if (slide.kind === "video") {
    imgEl.classList.add("hidden");
    vidEl.classList.remove("hidden");
    vidEl.src = proxiedVideoUrl(slide.url);
    void vidEl.play().catch(() => {});
    modalDownloadTarget = { url: slide.url, isVideo: true, filenameBase: base };
  } else {
    vidEl.pause();
    vidEl.removeAttribute("src");
    vidEl.load();
    vidEl.classList.add("hidden");
    imgEl.classList.remove("hidden");
    imgEl.src = proxiedImageUrl(slide.url);
    modalDownloadTarget = { url: slide.url, isVideo: false, filenameBase: base };
  }
  const cur = document.getElementById("carousel-current");
  if (cur) cur.textContent = String(i + 1);
  const prevBtn = document.getElementById("instagram-carousel-prev");
  const nextBtn = document.getElementById("instagram-carousel-next");
  if (prevBtn instanceof HTMLButtonElement) prevBtn.disabled = i <= 0;
  if (nextBtn instanceof HTMLButtonElement) nextBtn.disabled = i >= modalSlides.length - 1;
}

function modalCarouselPrev() {
  if (modalSlideIndex <= 0) return;
  modalSlideIndex -= 1;
  const vid = document.getElementById("instagram-modal-carousel-video") as HTMLVideoElement | null;
  vid?.pause();
  renderModalCarouselSlide(modalSlideIndex);
}

function modalCarouselNext() {
  if (modalSlideIndex >= modalSlides.length - 1) return;
  modalSlideIndex += 1;
  const vid = document.getElementById("instagram-modal-carousel-video") as HTMLVideoElement | null;
  vid?.pause();
  renderModalCarouselSlide(modalSlideIndex);
}

function openPostModal(raw: Record<string, unknown>, profileUrl: string) {
  const post = flattenMediaItem(raw);
  modalPost = post;
  const caption = pickCaption(post);
  const code = pickPostCode(post);
  const filenameBase = buildFilenameBase(caption, code);

  const capBox = document.getElementById("instagram-modal-caption");
  const capText = document.getElementById("instagram-modal-caption-text");
  if (capText) capText.textContent = caption;
  capBox?.classList.toggle("hidden", !caption);

  document.getElementById("instagram-modal-video")?.classList.add("hidden");
  document.getElementById("instagram-modal-image")?.classList.add("hidden");
  document.getElementById("instagram-modal-carousel")?.classList.add("hidden");

  const resolved = resolvePostMedia(post);
  modalSlides = getCarouselSlides(post);

  if (resolved.isCarousel && modalSlides.length > 0) {
    modalSlideIndex = 0;
    const totalEl = document.getElementById("carousel-total");
    if (totalEl) totalEl.textContent = String(modalSlides.length);
    document.getElementById("instagram-modal-carousel")?.classList.remove("hidden");
    renderModalCarouselSlide(0);
  } else if (resolved.isCarousel && modalSlides.length === 0 && resolved.mediaUrl) {
    const likelyVideo =
      Boolean(resolved.thumbnailUrl) || /\.(mp4|webm)(\?|$)/i.test(resolved.mediaUrl);
    if (likelyVideo) {
      document.getElementById("instagram-modal-video")?.classList.remove("hidden");
      const v = document.getElementById("instagram-modal-video-element") as HTMLVideoElement | null;
      if (v) {
        v.src = proxiedVideoUrl(resolved.mediaUrl);
        void v.play().catch(() => {});
      }
      modalDownloadTarget = { url: resolved.mediaUrl, isVideo: true, filenameBase };
    } else {
      document.getElementById("instagram-modal-image")?.classList.remove("hidden");
      const img = document.getElementById("instagram-modal-image-element") as HTMLImageElement | null;
      if (img) img.src = proxiedImageUrl(resolved.mediaUrl);
      modalDownloadTarget = { url: resolved.mediaUrl, isVideo: false, filenameBase };
    }
  } else if (resolved.mediaType === "video" && resolved.mediaUrl) {
    document.getElementById("instagram-modal-video")?.classList.remove("hidden");
    const v = document.getElementById("instagram-modal-video-element") as HTMLVideoElement | null;
    if (v) {
      v.src = proxiedVideoUrl(resolved.mediaUrl);
      void v.play().catch(() => {});
    }
    modalDownloadTarget = {
      url: resolved.mediaUrl,
      isVideo: true,
      filenameBase,
    };
  } else if (resolved.mediaUrl) {
    document.getElementById("instagram-modal-image")?.classList.remove("hidden");
    const img = document.getElementById("instagram-modal-image-element") as HTMLImageElement | null;
    if (img) img.src = proxiedImageUrl(resolved.mediaUrl);
    modalDownloadTarget = {
      url: resolved.mediaUrl,
      isVideo: false,
      filenameBase,
    };
  } else {
    let href = pickPermalink(post);
    if (href === "#") href = profileUrl;
    window.open(href, "_blank", "noopener,noreferrer");
    modalPost = null;
    return;
  }

  const shell = document.getElementById("instagram-post-modal");
  shell?.classList.remove("hidden");
  shell?.classList.add("flex");
}

const DEFAULT_POSTS_EMPTY_HINT =
  "No posts to show. The profile may be private, or try again later. Try another public username.";

function buildPostCardElement(raw: Record<string, unknown>, profileUrl: string): HTMLElement {
  const post = flattenMediaItem(raw);
  const { mediaUrl, thumbnailUrl, mediaType, isCarousel } = resolvePostMedia(post);
  const caption = pickCaption(post);
  const overlayText = overlayCaptionLine(caption);
  const timeAgo = timeLabelFromPost(post);
  const likes = pickLikeCount(post) ?? 0;
  const comments = pickCommentCount(post) ?? 0;

  const displayUrl =
    mediaType === "image" || mediaType === "carousel"
      ? proxiedImageUrl(mediaUrl)
      : proxiedImageUrl(thumbnailUrl || mediaUrl);
  const filenameBase = buildFilenameBase(caption, pickPostCode(post));

  const card = document.createElement("div");
  card.className =
    "bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer flex flex-col";

  const videoPlaySvg =
    '<svg width="20" height="20" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M51.247 21.9975C55.776 24.717 55.776 31.283 51.247 34.0025L19.3515 53.1405C14.686 55.9405 8.7535 52.5805 8.75 47.138V8.86198C8.75 3.42298 14.686 0.0629823 19.355 2.86298L51.247 21.9975Z" fill="black"/></svg>';

  const carouselIcon = `<div class="absolute top-2 right-2"><svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path></svg></div>`;

  const mediaBlock =
    mediaType === "video"
      ? `<img alt="Post thumbnail" class="w-full h-full object-cover" loading="lazy">
          <div class="absolute inset-0 flex items-center justify-center bg-black/20">
            <div class="flex items-center justify-center bg-white rounded-full p-2">${videoPlaySvg}</div>
          </div>`
      : `<img alt="Post" class="w-full h-full object-cover" loading="lazy">`;

  const overlayBlock = overlayText
    ? `<div class="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/60 to-transparent p-3"><p class="text-white text-sm font-medium line-clamp-2">${escapeHtml(overlayText)}</p></div>`
    : "";

  card.innerHTML = `
    <div class="relative aspect-square bg-gray-100 overflow-hidden">
      ${mediaBlock}
      ${isCarousel ? carouselIcon : ""}
      ${overlayBlock}
    </div>
    <div class="p-4 flex flex-col flex-grow">
      <div class="flex-grow">
        ${
          caption
            ? `<p class="text-gray-700 text-sm mb-3 line-clamp-2">${escapeHtml(caption.substring(0, 100))}${caption.length > 100 ? "..." : ""}</p>`
            : ""
        }
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-4 text-sm text-gray-600">
            <span class="flex items-center gap-1">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd"></path></svg>
              ${escapeHtml(formatCompactCount(likes))}
            </span>
            <span class="flex items-center gap-1">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
              ${escapeHtml(formatCompactCount(comments))}
            </span>
          </div>
          <span class="text-xs text-gray-500">${escapeHtml(timeAgo)}</span>
        </div>
      </div>
      <button type="button" class="w-full px-4 py-2 bg-[#2d8cff] text-white font-semibold rounded hover:bg-[#2573d9] transition-colors download-post-btn mt-auto cursor-pointer">
        Download
      </button>
    </div>
  `;

  const imgEl = card.querySelector(".relative.aspect-square > img") as HTMLImageElement | null;
  if (imgEl) {
    imgEl.src = displayUrl;
    imgEl.referrerPolicy = "no-referrer";
    const thumbForFallback = thumbnailUrl || mediaUrl;
    if (thumbForFallback && !thumbForFallback.startsWith("data:")) {
      imgEl.addEventListener(
        "error",
        () => {
          if (imgEl.src.includes("/proxy/image") && thumbForFallback.startsWith("http")) {
            imgEl.src = thumbForFallback;
          }
        },
        { once: true },
      );
    }
  }

  const downloadBtn = card.querySelector(".download-post-btn") as HTMLButtonElement | null;
  if (downloadBtn) {
    downloadBtn.dataset.url = mediaUrl;
    downloadBtn.dataset.type = mediaType;
  }

  card.addEventListener("click", (e) => {
    const t = e.target as HTMLElement;
    if (t.closest(".download-post-btn")) return;
    openPostModal(raw, profileUrl);
  });

  downloadBtn?.addEventListener("click", (e) => {
    e.stopPropagation();
    const url = downloadBtn.dataset.url ?? "";
    const type = (downloadBtn.dataset.type ?? "image") as "image" | "video" | "carousel";
    downloadPostMedia(url, type, filenameBase);
  });

  return card;
}

function renderPostCards(
  grid: HTMLElement | null,
  items: Record<string, unknown>[],
  profileUrl: string,
  /** Set to `null` to show an empty grid (e.g. before a tab has loaded). Omit or pass a string for errors / real empty results. */
  errorHint?: string | null,
) {
  if (!grid) return;
  grid.replaceChildren();
  grid.className = "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6";

  if (items.length === 0) {
    if (errorHint === null) return;
    const empty = document.createElement("div");
    empty.className =
      "col-span-full rounded-lg border border-dashed border-gray-200 bg-gray-50 px-6 py-12 text-center text-sm text-gray-600";
    empty.textContent = errorHint ?? DEFAULT_POSTS_EMPTY_HINT;
    grid.appendChild(empty);
    return;
  }

  const frag = document.createDocumentFragment();
  for (const raw of items) {
    frag.appendChild(buildPostCardElement(raw, profileUrl));
  }
  grid.appendChild(frag);
}

function appendPostCardsToGrid(
  grid: HTMLElement | null,
  items: Record<string, unknown>[],
  profileUrl: string,
) {
  if (!grid || items.length === 0) return;
  const frag = document.createDocumentFragment();
  for (const raw of items) {
    frag.appendChild(buildPostCardElement(raw, profileUrl));
  }
  grid.appendChild(frag);
}

function buildStoryCardElement(
  raw: Record<string, unknown>,
  profileUrl: string,
  highlightTitle: string,
  fallbackUsername: string,
): HTMLElement {
  const post = flattenMediaItem(raw);
  const { mediaUrl, thumbnailUrl, mediaType } = resolveStoryMedia(post);
  const caption = pickCaption(post);
  const overlayText = overlayCaptionLine(caption);
  const timeAgo = timeLabelFromPost(post);
  const filenameBase = buildStoryFilenameBase(post, highlightTitle, fallbackUsername);

  const displayUrl =
    mediaType === "image"
      ? proxiedImageUrl(mediaUrl)
      : proxiedImageUrl(thumbnailUrl || mediaUrl);

  const card = document.createElement("div");
  card.className =
    "bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer flex flex-col";

  const videoPlaySvg =
    '<svg width="20" height="20" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M51.247 21.9975C55.776 24.717 55.776 31.283 51.247 34.0025L19.3515 53.1405C14.686 55.9405 8.7535 52.5805 8.75 47.138V8.86198C8.75 3.42298 14.686 0.0629823 19.355 2.86298L51.247 21.9975Z" fill="black"/></svg>';

  const mediaBlock =
    mediaType === "video"
      ? `<img alt="Story thumbnail" class="w-full h-full object-cover" loading="lazy">
          <div class="absolute inset-0 flex items-center justify-center bg-black/20">
            <div class="flex items-center justify-center bg-white rounded-full p-2">${videoPlaySvg}</div>
          </div>`
      : `<img alt="Story" class="w-full h-full object-cover" loading="lazy">`;

  const overlayBlock = overlayText
    ? `<div class="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/60 to-transparent p-3"><p class="text-white text-sm font-medium line-clamp-2">${escapeHtml(overlayText)}</p></div>`
    : "";

  card.innerHTML = `
    <div class="relative aspect-square bg-gray-100 overflow-hidden">
      ${mediaBlock}
      ${overlayBlock}
    </div>
    <div class="p-4 flex flex-col flex-grow">
      <div class="flex-grow">
        ${
          caption
            ? `<p class="text-gray-700 text-sm mb-3 line-clamp-2">${escapeHtml(caption.substring(0, 100))}${caption.length > 100 ? "..." : ""}</p>`
            : ""
        }
      </div>
      <div class="flex items-center justify-end mb-3">
        <span class="text-xs text-gray-500">${escapeHtml(timeAgo)}</span>
      </div>
      <button type="button" class="w-full px-4 py-2 bg-[#2d8cff] text-white font-semibold rounded hover:bg-[#2573d9] transition-colors download-story-btn mt-auto cursor-pointer">
        Download
      </button>
    </div>
  `;

  const imgEl = card.querySelector(".relative.aspect-square > img") as HTMLImageElement | null;
  if (imgEl) {
    imgEl.src = displayUrl;
    imgEl.referrerPolicy = "no-referrer";
    const thumbForFallback = thumbnailUrl || mediaUrl;
    if (thumbForFallback && !thumbForFallback.startsWith("data:")) {
      imgEl.addEventListener(
        "error",
        () => {
          if (imgEl.src.includes("/proxy/image") && thumbForFallback.startsWith("http")) {
            imgEl.src = thumbForFallback;
          }
        },
        { once: true },
      );
    }
  }

  const downloadBtn = card.querySelector(".download-story-btn") as HTMLButtonElement | null;
  if (downloadBtn) {
    downloadBtn.dataset.url = mediaUrl;
    downloadBtn.dataset.type = mediaType;
  }

  card.addEventListener("click", (e) => {
    const t = e.target as HTMLElement;
    if (t.closest(".download-story-btn")) return;
    openPostModal(raw, profileUrl);
  });

  downloadBtn?.addEventListener("click", (e) => {
    e.stopPropagation();
    const url = downloadBtn.dataset.url ?? "";
    const type = (downloadBtn.dataset.type ?? "image") as "image" | "video";
    downloadPostMedia(url, type, filenameBase);
  });

  return card;
}

function renderStoryCards(
  grid: HTMLElement | null,
  items: Record<string, unknown>[],
  profileUrl: string,
  highlightTitle: string,
  fallbackUsername: string,
  errorHint?: string,
) {
  if (!grid) return;
  grid.replaceChildren();
  grid.className = "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6";

  if (items.length === 0) {
    if (errorHint) {
      const empty = document.createElement("div");
      empty.className =
        "col-span-full rounded-lg border border-dashed border-gray-200 bg-gray-50 px-6 py-12 text-center text-sm text-gray-600";
      empty.textContent = errorHint;
      grid.appendChild(empty);
    }
    return;
  }

  const frag = document.createDocumentFragment();
  for (const raw of items) {
    frag.appendChild(buildStoryCardElement(raw, profileUrl, highlightTitle, fallbackUsername));
  }
  grid.appendChild(frag);
}

const HIGHLIGHT_STORIES_PAGE = 18;
let highlightStoriesBuffer: Record<string, unknown>[] = [];
let highlightStoriesNextStart = 0;
/** Active highlight title (legacy `currentHighlightTitle`) — exposed on the grid `dataset.highlightTitle`. */
let currentHighlightTitleForStories = "";

function resetHighlightStoriesPagination() {
  highlightStoriesBuffer = [];
  highlightStoriesNextStart = 0;
  currentHighlightTitleForStories = "";
  const g = document.getElementById("highlight-stories-grid");
  if (g) delete g.dataset.highlightTitle;
  hide(document.getElementById("highlight-stories-load-more"));
  hide(document.getElementById("highlight-stories-no-more"));
}

function showHighlightStoriesBounceInGrid(grid: HTMLElement | null) {
  if (!grid) return;
  grid.innerHTML = `
    <div class="col-span-full flex items-center justify-center py-12">
      <div class="flex items-center justify-center gap-2">
        <div class="w-3 h-3 rounded-full bg-[#ff1667] border-2 border-[#b232e9] animate-bounce" style="animation-delay: 0s; animation-duration: 0.6s;"></div>
        <div class="w-3 h-3 rounded-full bg-[#ff1667] border-2 border-[#b232e9] animate-bounce" style="animation-delay: 0.2s; animation-duration: 0.6s;"></div>
        <div class="w-3 h-3 rounded-full bg-[#ff1667] border-2 border-[#b232e9] animate-bounce" style="animation-delay: 0.4s; animation-duration: 0.6s;"></div>
      </div>
    </div>`;
}

function extractHighlightStoryItems(data: unknown): Record<string, unknown>[] {
  if (data && typeof data === "object" && data !== null && "items" in data) {
    const items = (data as { items: unknown }).items;
    if (Array.isArray(items)) {
      return items.filter(
        (x): x is Record<string, unknown> => x != null && typeof x === "object",
      ) as Record<string, unknown>[];
    }
  }
  return extractMediaLikeItems(data);
}

function renderNextHighlightStoriesPage() {
  const grid = document.getElementById("highlight-stories-grid");
  const loadMoreBtn = document.getElementById("highlight-stories-load-more");
  const endMsg = document.getElementById("highlight-stories-no-more");
  if (!grid) return;

  const start = highlightStoriesNextStart;
  const slice = highlightStoriesBuffer.slice(start, start + HIGHLIGHT_STORIES_PAGE);

  if (slice.length === 0) {
    if (start === 0) {
      grid.innerHTML =
        '<div class="col-span-full text-center py-12"><p class="text-gray-500">No highlight stories found</p></div>';
    }
    hide(loadMoreBtn);
    if (highlightStoriesBuffer.length > 0 && start > 0) show(endMsg);
    return;
  }

  if (start === 0) {
    grid.className = "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6";
  }

  const profileUrl = `https://www.instagram.com/${feedCache.username}/`;
  const highlightTitle = grid.dataset.highlightTitle ?? currentHighlightTitleForStories ?? "";

  for (const story of slice) {
    grid.appendChild(
      buildStoryCardElement(story, profileUrl, highlightTitle, feedCache.username ?? ""),
    );
  }

  highlightStoriesNextStart += slice.length;

  if (highlightStoriesNextStart < highlightStoriesBuffer.length) {
    show(loadMoreBtn);
    hide(endMsg);
  } else {
    hide(loadMoreBtn);
    if (highlightStoriesBuffer.length > 0) show(endMsg);
  }
}

async function fetchHighlightStories(highlightId: string) {
  const grid = document.getElementById("highlight-stories-grid");
  if (!grid) return;

  const topLoading = document.getElementById("highlight-stories-loading");
  const loadMoreBtn = document.getElementById("highlight-stories-load-more");
  const endMsg = document.getElementById("highlight-stories-no-more");

  hide(topLoading);
  hide(loadMoreBtn);
  hide(endMsg);
  showHighlightStoriesBounceInGrid(grid);

  const r = await postInstagramApi(API.highlightStory, { highlight_id: highlightId });

  if (!feedCache.username) {
    grid.replaceChildren();
    return;
  }

  if (!r.ok) {
    highlightStoriesBuffer = [];
    highlightStoriesNextStart = 0;
    hide(loadMoreBtn);
    hide(endMsg);
    const errText =
      typeof r.payload.error === "string"
        ? r.payload.error
        : "Failed to load highlight stories.";
    grid.innerHTML = `<div class="col-span-full text-center py-12"><p class="text-gray-500">${escapeHtml(errText)}</p></div>`;
    return;
  }

  highlightStoriesBuffer = extractHighlightStoryItems(r.payload.data);
  highlightStoriesNextStart = 0;
  grid.replaceChildren();
  grid.dataset.highlightTitle = currentHighlightTitleForStories;

  if (highlightStoriesBuffer.length === 0) {
    grid.innerHTML =
      '<div class="col-span-full text-center py-12"><p class="text-gray-500">No highlight stories found</p></div>';
    return;
  }

  renderNextHighlightStoriesPage();
}

function createHighlightCard(highlight: Record<string, unknown>): HTMLElement | null {
  const hid = pickHighlightId(highlight);
  if (!hid) return null;

  const card = document.createElement("div");
  card.className =
    "highlight-pill flex-shrink-0 w-24 flex flex-col items-center cursor-pointer group";
  card.setAttribute("data-highlight-id", hid);

  const directUrl = pickHighlightCoverUrl(highlight);
  const proxiedThumb = directUrl ? proxiedImageUrl(directUrl) : "";

  const ring = document.createElement("div");
  ring.className =
    "w-20 h-20 rounded-full overflow-hidden border-2 border-gray-300 group-hover:border-gray-500 transition-colors mb-2 relative bg-gray-100";

  const spinner = document.createElement("div");
  spinner.className =
    "highlight-loading-spinner absolute inset-0 flex items-center justify-center z-10";
  if (!proxiedThumb) spinner.classList.add("hidden");
  spinner.innerHTML = `
    <div class="w-16 h-16 rounded-full relative">
      <svg class="w-16 h-16 animate-spin" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" stroke="#e5e7eb" stroke-width="2" fill="none"/>
        <path d="M12 2C13.3132 2 14.6136 2.25866 15.8268 2.7612C17.0401 3.26375 18.1425 4.00035 19.0711 4.92893C19.9997 5.85752 20.7362 6.95991 21.2388 8.17317C21.7413 9.38642 22 10.6868 22 12" stroke="#9ca3af" stroke-width="2.5" stroke-linecap="round" fill="none" stroke-dasharray="15 45"/>
      </svg>
    </div>`;

  const img = document.createElement("img");
  img.className = "w-full h-full object-cover highlight-image";
  img.loading = "lazy";
  img.alt = pickHighlightTitle(highlight);
  img.style.opacity = proxiedThumb ? "0" : "1";
  img.referrerPolicy = "no-referrer";

  if (proxiedThumb) {
    const onDone = () => {
      img.style.opacity = "1";
      spinner.classList.add("hidden");
    };
    img.addEventListener("load", onDone, { once: true });
    img.addEventListener(
      "error",
      () => {
        spinner.classList.add("hidden");
        img.style.opacity = "1";
        if (img.src.includes("/proxy/image") && directUrl.startsWith("http")) {
          img.src = directUrl;
        }
      },
      { once: true },
    );
    img.src = proxiedThumb;
    if (img.complete && img.naturalHeight !== 0) onDone();
  }

  ring.appendChild(spinner);
  ring.appendChild(img);

  const label = document.createElement("p");
  label.className = "text-xs text-gray-700 text-center truncate w-full";
  label.textContent = pickHighlightTitle(highlight);

  card.appendChild(ring);
  card.appendChild(label);

  card.addEventListener("click", () => {
    document.querySelectorAll("#highlights-carousel .highlight-pill").forEach((el) => {
      el.classList.remove("ring-2", "ring-pink-500", "ring-offset-2", "shadow-md");
    });
    card.classList.add("ring-2", "ring-pink-500", "ring-offset-2", "shadow-md");
    currentHighlightTitleForStories = pickHighlightTitle(highlight);
    void fetchHighlightStories(hid);
  });

  return card;
}

function renderHighlightCarousel(carousel: HTMLElement | null, raw: Record<string, unknown>[]) {
  if (!carousel) return;
  setHighlightsEmptyBanner(null);
  carousel.replaceChildren();
  const frag = document.createDocumentFragment();
  let count = 0;
  for (const item of raw) {
    const el = createHighlightCard(item);
    if (el) {
      frag.appendChild(el);
      count++;
    }
  }
  carousel.appendChild(frag);
  if (raw.length > 0 && count === 0) {
    setHighlightsEmptyBanner(
      "Highlights were returned but could not be shown (missing cover or ID). Check the API response shape.",
    );
  }
}

type ApiPayload = { success?: boolean; data?: unknown; error?: string };

async function postInstagramApi(
  path: string,
  body: Record<string, unknown>,
  attempt = 0,
): Promise<{ ok: boolean; payload: ApiPayload }> {
  if (!sessionAuth) {
    return { ok: false, payload: { error: "Session not signed. Reload and try again." } };
  }
  const full = {
    ...body,
    username: sessionAuth.username,
    url: sessionAuth.url,
    token: sessionAuth.token,
    timestamp: sessionAuth.timestamp,
    secretToken: sessionAuth.secretToken,
  };
  try {
    const res = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(full),
    });
    const payload = (await res.json()) as ApiPayload;
    /** Treat `success: true` as OK even when `data` is null/omitted (caller uses empty extraction). */
    const ok = res.ok && payload.success === true;

    const authLikeFailure =
      (res.status === 401 || res.status === 403) && payload.error === "Unauthorized request";
    if (authLikeFailure && attempt < 1 && sessionAuth.username) {
      const refreshed = await refreshSessionAuthForUsername(sessionAuth.username);
      if (refreshed) return postInstagramApi(path, body, attempt + 1);
    }

    return { ok, payload };
  } catch {
    return { ok: false, payload: {} };
  }
}

const MEDIA_LIMIT = 18;

/** Per-search cache: merged postsV2 pages (deduped), shared cursor for posts + reels “load more”. */
const feedCache = {
  username: null as string | null,
  mergedPostRows: [] as Record<string, unknown>[],
  seenPostKeys: new Set<string>(),
  nextFeedCursor: null as string | null,
  hasMoreFeed: false,
  loadingMoreFeed: false,
  loaded: { stories: false, highlights: false },
};

function resetFeedPagination() {
  feedCache.mergedPostRows = [];
  feedCache.seenPostKeys.clear();
  feedCache.nextFeedCursor = null;
  feedCache.hasMoreFeed = false;
  feedCache.loadingMoreFeed = false;
}

function feedItemDedupeKey(raw: Record<string, unknown>): string {
  const flat = flattenMediaItem(raw);
  const code = pickPostCode(flat);
  if (code) return `c:${code}`;
  const id = flat.id ?? flat.pk ?? flat.media_id;
  if (id != null && String(id).trim() !== "") return `id:${id}`;
  return `h:${JSON.stringify(raw).slice(0, 120)}`;
}

/** Items from `batch` that were newly merged into `mergedPostRows`. */
function mergeFeedBatch(batch: Record<string, unknown>[]): Record<string, unknown>[] {
  const newly: Record<string, unknown>[] = [];
  for (const raw of batch) {
    const k = feedItemDedupeKey(raw);
    if (feedCache.seenPostKeys.has(k)) continue;
    feedCache.seenPostKeys.add(k);
    feedCache.mergedPostRows.push(raw);
    newly.push(raw);
  }
  return newly;
}

function updatePostsFeedPaginationUi() {
  const noMore = document.getElementById("posts-no-more");
  if (feedCache.loadingMoreFeed) {
    return;
  }
  if (feedCache.hasMoreFeed) {
    hide(noMore);
  } else {
    if (feedCache.mergedPostRows.length > 0) show(noMore);
    else hide(noMore);
  }
}

function updateReelsFeedPaginationUi() {
  const noMore = document.getElementById("reels-no-more");
  if (feedCache.loadingMoreFeed) {
    return;
  }
  if (feedCache.hasMoreFeed) {
    hide(noMore);
  } else {
    if (feedCache.mergedPostRows.length > 0) show(noMore);
    else hide(noMore);
  }
}

async function fetchNextFeedPage(username: string): Promise<{
  ok: boolean;
  newItems: Record<string, unknown>[];
  error?: string;
}> {
  const cursor = feedCache.nextFeedCursor;
  if (!cursor) {
    return { ok: false, newItems: [] };
  }
  const postsR = await postInstagramApi(API.postsV2, {
    username,
    limit: MEDIA_LIMIT,
    cursor,
  });
  if (feedCache.username !== username) {
    return { ok: false, newItems: [] };
  }
  if (!postsR.ok) {
    return {
      ok: false,
      newItems: [],
      error:
        typeof postsR.payload.error === "string"
          ? postsR.payload.error
          : "Could not load more.",
    };
  }
  const batch = extractMediaLikeItems(postsR.payload.data);
  const newItems = mergeFeedBatch(batch);
  feedCache.nextFeedCursor = extractFeedPaginationCursor(postsR.payload.data);
  feedCache.hasMoreFeed = Boolean(feedCache.nextFeedCursor);
  return { ok: true, newItems };
}

/** Append items from one postsV2 page to both grids (same underlying feed). */
function appendNewFeedPageToGrids(newItems: Record<string, unknown>[], profileUrl: string) {
  const nonReels = newItems.filter((i) => !isLikelyReel(i));
  const videos = newItems.filter((i) => isLikelyVideo(flattenMediaItem(i)));
  appendPostCardsToGrid(document.getElementById("posts-grid"), nonReels, profileUrl);
  appendPostCardsToGrid(document.getElementById("reels-grid"), videos, profileUrl);
}

/**
 * One shared “load more” for posts + reels: single cursor, one API call, update both grids.
 * @param context — which tab’s loader/spinner to show (the other tab’s grid still updates if it has matching items).
 */
async function loadMoreFeed(context: "posts" | "reels") {
  const username = feedCache.username;
  const profileUrl = username ? `https://www.instagram.com/${username}/` : "";
  if (
    feedCache.loadingMoreFeed ||
    !feedCache.hasMoreFeed ||
    !username ||
    !feedCache.nextFeedCursor
  ) {
    return;
  }
  feedCache.loadingMoreFeed = true;
  const postsLoading = document.getElementById("posts-loading");
  const postsNoMore = document.getElementById("posts-no-more");
  const reelsLoading = document.getElementById("reels-loading");
  const reelsNoMore = document.getElementById("reels-no-more");
  if (context === "posts") {
    show(postsLoading);
    hide(postsNoMore);
  } else {
    show(reelsLoading);
    hide(reelsNoMore);
  }
  updatePostsFeedPaginationUi();
  updateReelsFeedPaginationUi();
  try {
    const { ok, newItems, error } = await fetchNextFeedPage(username);
    if (feedCache.username !== username) return;
    if (!ok) {
      console.error("Failed to load more feed:", error);
      feedCache.hasMoreFeed = false;
      return;
    }
    appendNewFeedPageToGrids(newItems, profileUrl);
  } finally {
    feedCache.loadingMoreFeed = false;
    hide(postsLoading);
    hide(reelsLoading);
    updatePostsFeedPaginationUi();
    updateReelsFeedPaginationUi();
  }
}

function resetSecondaryFeeds(username: string) {
  const profileUrl = `https://www.instagram.com/${username}/`;
  feedCache.username = username;
  resetFeedPagination();
  feedCache.loaded = { stories: false, highlights: false };
  document.getElementById("posts-grid")?.replaceChildren();
  /** Reels/stories not loaded yet — avoid "no posts" copy above the tab loaders. */
  renderPostCards(document.getElementById("reels-grid"), [], profileUrl, null);
  renderStoryCards(document.getElementById("stories-grid"), [], profileUrl, "", username);
  resetHighlightStoriesPagination();
  hide(document.getElementById("highlight-stories-loading"));
  setHighlightsEmptyBanner(null);
  renderHighlightCarousel(document.getElementById("highlights-carousel"), []);
  document.getElementById("highlight-stories-grid")?.replaceChildren();
  hide(document.getElementById("posts-no-more"));
  hide(document.getElementById("reels-no-more"));
}

/** Called after a successful profile lookup — only fetches posts (not reels/stories/highlights). */
async function loadPostsOnly(username: string) {
  const postsLoading = document.getElementById("posts-loading");
  const profileUrl = `https://www.instagram.com/${username}/`;
  show(postsLoading);
  hide(document.getElementById("posts-no-more"));

  const postsR = await postInstagramApi(API.postsV2, {
    username,
    limit: MEDIA_LIMIT,
  });

  if (feedCache.username !== username) return;

  hide(postsLoading);

  if (!postsR.ok) {
    resetFeedPagination();
    const err =
      typeof postsR.payload.error === "string"
        ? postsR.payload.error
        : "Could not load posts.";
    renderPostCards(document.getElementById("posts-grid"), [], profileUrl, err);
    updatePostsFeedPaginationUi();
    updateReelsFeedPaginationUi();
    return;
  }

  const batch = extractMediaLikeItems(postsR.payload.data);
  mergeFeedBatch(batch);
  feedCache.nextFeedCursor = extractFeedPaginationCursor(postsR.payload.data);
  feedCache.hasMoreFeed = Boolean(feedCache.nextFeedCursor);

  const nonReelPosts = batch.filter((i) => !isLikelyReel(i));
  const forPostsGrid = nonReelPosts.length > 0 ? nonReelPosts : batch;

  renderPostCards(document.getElementById("posts-grid"), forPostsGrid, profileUrl);
  updatePostsFeedPaginationUi();
  updateReelsFeedPaginationUi();
}

/** Fetches reels / stories / highlights only when the user switches to that tab (once per search). */
async function loadTabFeedIfNeeded(tab: string) {
  const username = feedCache.username;
  if (!username || tab === "posts") return;

  if (tab === "reels") {
    const profileUrl = `https://www.instagram.com/${username}/`;
    const videoPosts = feedCache.mergedPostRows.filter((i) =>
      isLikelyVideo(flattenMediaItem(i)),
    );
    renderPostCards(
      document.getElementById("reels-grid"),
      videoPosts,
      profileUrl,
      videoPosts.length === 0 ? "No reels to show for this profile." : undefined,
    );
    updateReelsFeedPaginationUi();
  }

  if (tab === "stories" && !feedCache.loaded.stories) {
    feedCache.loaded.stories = true;
    const storiesLoading = document.getElementById("stories-loading");
    show(storiesLoading);
    const storiesR = await postInstagramApi(API.stories, {
      username,
      limit: MEDIA_LIMIT,
    });
    if (feedCache.username !== username) {
      hide(storiesLoading);
      return;
    }
    const profileUrl = `https://www.instagram.com/${username}/`;
    const storyItems = storiesR.ok ? extractMediaLikeItems(storiesR.payload.data) : [];
    if (!storiesR.ok) {
      renderStoryCards(
        document.getElementById("stories-grid"),
        [],
        profileUrl,
        "",
        username,
        typeof storiesR.payload.error === "string"
          ? storiesR.payload.error
          : "Could not load stories.",
      );
    } else if (storyItems.length === 0) {
      renderStoryCards(
        document.getElementById("stories-grid"),
        [],
        profileUrl,
        "",
        username,
        "No stories found for this profile.",
      );
    } else {
      renderStoryCards(document.getElementById("stories-grid"), storyItems, profileUrl, "", username);
    }
    hide(storiesLoading);
  }

  if (tab === "highlights" && !feedCache.loaded.highlights) {
    feedCache.loaded.highlights = true;
    const highlightsLoading = document.getElementById("highlights-loading");
    show(highlightsLoading);
    setHighlightsEmptyBanner(null);

    const highsR = await postInstagramApi(API.highlights, {
      username,
    });
    if (feedCache.username !== username) {
      hide(highlightsLoading);
      return;
    }

    resetHighlightStoriesPagination();
    hide(document.getElementById("highlight-stories-loading"));
    document.getElementById("highlight-stories-grid")?.replaceChildren();

    if (!highsR.ok) {
      const err =
        typeof highsR.payload.error === "string"
          ? highsR.payload.error
          : "Could not load highlights. Check RapidAPI credentials and server logs.";
      document.getElementById("highlights-carousel")?.replaceChildren();
      setHighlightsEmptyBanner(err);
      hide(highlightsLoading);
      return;
    }

    const highItems = extractHighlightTrayItems(highsR.payload.data);
    if (highItems.length === 0) {
      document.getElementById("highlights-carousel")?.replaceChildren();
      setHighlightsEmptyBanner(
        "No highlights found. This account may have none, they may be private.",
      );
    } else {
      renderHighlightCarousel(document.getElementById("highlights-carousel"), highItems);
    }

    hide(highlightsLoading);
  }
}

export default function InstagramFormBridge() {
  useEffect(() => {
    const form = document.getElementById("get_video") as HTMLFormElement | null;
    if (!form) return;

    const onSubmit = async (e: Event) => {
      e.preventDefault();
      const input = document.getElementById("url") as HTMLInputElement | null;
      const raw = input?.value?.trim() ?? "";
      if (!raw) return;

      const results = document.getElementById("instagram-results");
      const loading = document.getElementById("instagram-loading");
      const errBox = document.getElementById("instagram-error");
      const errMsg = document.getElementById("instagram-error-message");
      const profile = document.getElementById("instagram-profile");
      const singlePost = document.getElementById("instagram-single-post");
      const tabs = document.getElementById("instagram-tabs");

      show(results);
      show(loading);
      hide(errBox);
      hide(profile);
      hide(singlePost);
      if (tabs) hide(tabs);
      for (const id of PANEL_IDS) {
        hide(document.getElementById(id));
      }

      clearSessionAuth();

      const signResult = await fetchSessionAuthFromInput(raw);
      if (!signResult.ok) {
        hide(loading);
        show(errBox);
        if (errMsg) {
          errMsg.textContent =
            signResult.error ??
            "Could not authorize request. Ensure AUTH_SECRET is set on the server.";
        }
        return;
      }

      if (!sessionAuth) {
        hide(loading);
        show(errBox);
        if (errMsg) errMsg.textContent = "Session signing failed.";
        return;
      }

      let response: Response;
      try {
        response = await fetch(API.userInfo, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            url: sessionAuth.url,
            username: sessionAuth.username,
            token: sessionAuth.token,
            timestamp: sessionAuth.timestamp,
            secretToken: sessionAuth.secretToken,
          }),
        });
      } catch {
        clearSessionAuth();
        hide(loading);
        show(errBox);
        if (errMsg) errMsg.textContent = "Network error. Check your connection and try again.";
        return;
      }

      const payload = (await response.json().catch(() => null)) as
        | { success?: boolean; data?: unknown; error?: string }
        | null;

      hide(loading);

      if (!response.ok || !payload?.success || payload.data === undefined) {
        clearSessionAuth();
        show(errBox);
        if (errMsg) {
          errMsg.textContent =
            typeof payload?.error === "string"
              ? payload.error
              : "Failed to fetch Instagram user info.";
        }
        return;
      }

      const mapped = mapUserInfoToProfile(payload.data);
      if (!mapped) {
        clearSessionAuth();
        show(errBox);
        if (errMsg) {
          errMsg.textContent = "Unexpected response from Instagram API.";
        }
        return;
      }

      if (mapped.username !== sessionAuth.username) {
        const refreshed = await refreshSessionAuthForUsername(mapped.username);
        if (!refreshed) {
          clearSessionAuth();
          show(errBox);
          if (errMsg) {
            errMsg.textContent = "Could not align session with the resolved Instagram username.";
          }
          return;
        }
      }

      show(profile);
      if (tabs) show(tabs);
      setText("profile-username", mapped.username);
      setText("profile-posts", mapped.posts);
      setText("profile-followers", mapped.followers);
      setText("profile-following", mapped.following);
      setText("profile-bio", mapped.biography);

      const link = document.getElementById("profile-link") as HTMLAnchorElement | null;
      if (link) {
        link.href = mapped.profileUrl;
      }

      const pic = document.getElementById("profile-pic") as HTMLImageElement | null;
      if (pic && mapped.profilePicUrl) {
        pic.src = proxiedImageUrl(mapped.profilePicUrl);
        pic.alt = `@${mapped.username}`;
      }

      resetSecondaryFeeds(mapped.username);
      setTabActive("posts");
      results?.scrollIntoView({ behavior: "smooth", block: "start" });

      void loadPostsOnly(mapped.username);
    };

    form.addEventListener("submit", onSubmit);
    return () => form.removeEventListener("submit", onSubmit);
  }, []);

  useEffect(() => {
    const tabsRoot = document.getElementById("instagram-tabs");
    if (!tabsRoot) return;

    const onTabClick = (e: MouseEvent) => {
      const t = (e.target as HTMLElement).closest(".tab-btn");
      if (!t || !tabsRoot.contains(t)) return;
      const name = t.getAttribute("data-tab");
      if (!name) return;
      setTabActive(name);
      void loadTabFeedIfNeeded(name);
    };

    tabsRoot.addEventListener("click", onTabClick);
    return () => tabsRoot.removeEventListener("click", onTabClick);
  }, []);

  useEffect(() => {
    const btn = document.getElementById("instagram-close");
    if (!btn) return;
    const onClose = () => {
      hide(document.getElementById("instagram-results"));
    };
    btn.addEventListener("click", onClose);
    return () => btn.removeEventListener("click", onClose);
  }, []);

  useEffect(() => {
    const btn = document.getElementById("highlight-stories-load-more");
    if (!btn) return;
    const onMore = () => renderNextHighlightStoriesPage();
    btn.addEventListener("click", onMore);
    return () => btn.removeEventListener("click", onMore);
  }, []);

  useEffect(() => {
    const sentinel = document.getElementById("posts-infinite-sentinel");
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const hit = entries.some((e) => e.isIntersecting);
        if (!hit) return;
        const panel = document.getElementById("instagram-posts");
        if (!panel || panel.classList.contains("hidden")) return;
        void loadMoreFeed("posts");
      },
      {
        root: null,
        rootMargin: "320px 0px 0px 0px",
        threshold: 0,
      },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const sentinel = document.getElementById("reels-infinite-sentinel");
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const hit = entries.some((e) => e.isIntersecting);
        if (!hit) return;
        const panel = document.getElementById("instagram-reels");
        if (!panel || panel.classList.contains("hidden")) return;
        void loadMoreFeed("reels");
      },
      {
        root: null,
        rootMargin: "320px 0px 0px 0px",
        threshold: 0,
      },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const shell = document.getElementById("instagram-post-modal");
    const closeBtn = document.getElementById("instagram-modal-close");
    const dlBtn = document.getElementById("instagram-modal-download");
    const prevBtn = document.getElementById("instagram-carousel-prev");
    const nextBtn = document.getElementById("instagram-carousel-next");

    const onClose = () => hidePostModal();
    const onBackdrop = (e: MouseEvent) => {
      if (e.target === shell) hidePostModal();
    };
    const onDownload = () => {
      if (!modalDownloadTarget) return;
      downloadPostMedia(
        modalDownloadTarget.url,
        modalDownloadTarget.isVideo ? "video" : "image",
        modalDownloadTarget.filenameBase,
      );
    };
    const onPrev = (e: MouseEvent) => {
      e.stopPropagation();
      modalCarouselPrev();
    };
    const onNext = (e: MouseEvent) => {
      e.stopPropagation();
      modalCarouselNext();
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") hidePostModal();
    };

    shell?.addEventListener("click", onBackdrop);
    document.addEventListener("keydown", onKeyDown);
    closeBtn?.addEventListener("click", onClose);
    dlBtn?.addEventListener("click", onDownload);
    prevBtn?.addEventListener("click", onPrev);
    nextBtn?.addEventListener("click", onNext);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      shell?.removeEventListener("click", onBackdrop);
      closeBtn?.removeEventListener("click", onClose);
      dlBtn?.removeEventListener("click", onDownload);
      prevBtn?.removeEventListener("click", onPrev);
      nextBtn?.removeEventListener("click", onNext);
    };
  }, []);

  return null;
}
