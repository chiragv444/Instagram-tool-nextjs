import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  /** Redirect `/es` → `/es/`, `/pl/foo` → `/pl/foo/`, etc. */
  trailingSlash: true,
  /** Let middleware control slash redirects so we can return 302 instead of 308. */
  skipTrailingSlashRedirect: true,
  /**
   * Disable streaming metadata for all clients so `<title>`, `<meta>`, and
   * canonical/hreflang stay in `<head>` (not appended in `<body>`).
   * Does not reorder framework `<script>` / `<link rel="stylesheet">` tags.
   * @see https://nextjs.org/docs/app/api-reference/config/next-config-js/htmlLimitedBots
   */
  htmlLimitedBots: /.*/,
};

export default nextConfig;
