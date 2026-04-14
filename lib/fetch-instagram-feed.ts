import { rapidApiFormPost } from "@/lib/fetch-instagram-rapid-form";
import type { InstagramFeedKind } from "@/lib/instagram-feed-endpoints";
import { rapidPathForFeed } from "@/lib/instagram-feed-endpoints";

export async function fetchInstagramFeed(
  kind: InstagramFeedKind,
  username: string,
  options?: { cursor?: string; limit?: number },
): Promise<unknown> {
  const path = rapidPathForFeed(kind);
  const fields: Record<string, string | undefined> = {
    username_or_url: username,
  };
  if (options?.cursor) {
    fields.pagination_token = options.cursor;
  }
  if (options?.limit != null) {
    fields.limit = String(options.limit);
  }

  return rapidApiFormPost(path, fields);
}
