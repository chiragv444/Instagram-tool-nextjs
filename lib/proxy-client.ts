/**
 * Browser-safe URLs that load Instagram CDN media through same-origin GET proxies.
 * Matches Fastify GET `/proxy/image` and `/proxy/video`.
 */

const PROXY_IMAGE = "/proxy/image/";
const PROXY_VIDEO = "/proxy/video/";

function skipProxy(url: string): boolean {
  return (
    url.startsWith("data:") ||
    url.startsWith("blob:") ||
    url.startsWith("/proxy/")
  );
}

export function proxiedImageUrl(directUrl: string): string {
  if (!directUrl || skipProxy(directUrl)) return directUrl;
  return `${PROXY_IMAGE}?${new URLSearchParams({ url: directUrl }).toString()}`;
}

export function proxiedVideoUrl(directUrl: string): string {
  if (!directUrl || skipProxy(directUrl)) return directUrl;
  return `${PROXY_VIDEO}?${new URLSearchParams({ url: directUrl }).toString()}`;
}
