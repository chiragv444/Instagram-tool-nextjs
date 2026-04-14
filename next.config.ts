import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /** Redirect `/es` → `/es/`, `/pl/foo` → `/pl/foo/`, etc. */
  trailingSlash: true,
  /**
   * Disable streaming metadata for all clients so `<title>`, `<meta>`, and
   * canonical/hreflang stay in `<head>` (not appended in `<body>`).
   * Does not reorder framework `<script>` / `<link rel="stylesheet">` tags.
   * @see https://nextjs.org/docs/app/api-reference/config/next-config-js/htmlLimitedBots
   */
  htmlLimitedBots: /.*/,
};

export default nextConfig;
