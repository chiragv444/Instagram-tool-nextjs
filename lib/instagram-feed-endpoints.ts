/**
 * RapidAPI PHP paths — override in .env if your subscription uses different filenames.
 * See Instagram Scraper Stable API docs on RapidAPI.
 */
export type InstagramFeedKind = "posts" | "reels" | "stories" | "highlights";

const DEFAULT_PATH: Record<InstagramFeedKind, string> = {
  posts: "get_ig_user_posts.php",
  reels: "get_ig_user_reels.php",
  stories: "get_ig_user_stories.php",
  highlights: "get_ig_user_highlights.php",
};

export function rapidPathForFeed(kind: InstagramFeedKind): string {
  switch (kind) {
    case "posts":
      return process.env.RAPIDAPI_PATH_POSTS?.trim() || DEFAULT_PATH.posts;
    case "reels":
      return process.env.RAPIDAPI_PATH_REELS?.trim() || DEFAULT_PATH.reels;
    case "stories":
      return process.env.RAPIDAPI_PATH_STORIES?.trim() || DEFAULT_PATH.stories;
    case "highlights":
      return process.env.RAPIDAPI_PATH_HIGHLIGHTS?.trim() || DEFAULT_PATH.highlights;
    default: {
      const _exhaustive: never = kind;
      return _exhaustive;
    }
  }
}
