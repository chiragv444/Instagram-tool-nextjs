/**
 * Legacy Instagram tool bootstrap.
 *
 * `Hero` sets `window.__INSTAGRAM_FORM__ = { paste, clear }` before this file runs.
 *
 * Replace this stub with your full IIFE from the original site (the `<script>` block).
 * In `InstagramDownloadWidget`, replace EJS template strings with:
 *   window.__INSTAGRAM_FORM__?.clear  /  window.__INSTAGRAM_FORM__?.paste
 *
 * Optional: set `var USE_MOCK_API = true` in your bundle for mock endpoints.
 */
(function () {
  "use strict";
  if (typeof window === "undefined") return;
  if (window.__INSTAGRAM_WIDGET_LEGACY__) return;
  window.__INSTAGRAM_WIDGET_LEGACY__ = true;

  console.warn(
    "[instagram-widget.js] Stub loaded. Paste your InstagramWidget + InstagramDownloadWidget IIFE here.",
  );
})();
