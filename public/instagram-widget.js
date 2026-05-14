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

  // Profile picture download handler
  function initProfileDownload() {
    const profileDownloadBtn = document.getElementById("profile-download-btn");
    const profilePic = document.getElementById("profile-pic");

    if (profileDownloadBtn && profilePic) {
      profileDownloadBtn.addEventListener("click", function (e) {
        e.preventDefault();
        const imageUrl = profilePic.src;
        const username = document.getElementById("profile-username")?.textContent || "profile";

        if (!imageUrl) {
          console.warn("[instagram-widget.js] No profile picture URL found");
          return;
        }

        downloadImage(imageUrl, `${username}_profile.jpg`);
      });
    }
  }

  // Helper function to download image
  function downloadImage(url, filename) {
    // Use fetch to get the image as a blob
    fetch(url)
      .then((response) => {
        if (!response.ok) throw new Error("Network response was not ok");
        return response.blob();
      })
      .then((blob) => {
        // Create a temporary URL for the blob
        const blobUrl = window.URL.createObjectURL(blob);

        // Create a temporary anchor element and trigger download
        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Clean up the blob URL
        window.URL.revokeObjectURL(blobUrl);
      })
      .catch((error) => {
        console.error("[instagram-widget.js] Download failed:", error);
        alert("Failed to download the profile picture. Please try again.");
      });
  }

  // Initialize when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initProfileDownload);
  } else {
    initProfileDownload();
  }

  console.warn(
    "[instagram-widget.js] Stub loaded. Paste your InstagramWidget + InstagramDownloadWidget IIFE here.",
  );
})();
