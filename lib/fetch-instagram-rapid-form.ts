import { assertRapidConfig } from "@/lib/fetch-instagram-user-info";

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY?.trim();
const RAPIDAPI_HOST =
  process.env.RAPIDAPI_HOST?.trim() || "instagram-scraper-stable-api.p.rapidapi.com";
const INSTAGRAM_API_BASE_URL =
  process.env.RAPIDAPI_URL?.trim() || "https://instagram-scraper-stable-api.p.rapidapi.com";

/**
 * POST application/x-www-form-urlencoded to a RapidAPI Instagram scraper path.
 */
export async function rapidApiFormPost(
  endpointFile: string,
  fields: Record<string, string | undefined>,
): Promise<unknown> {
  assertRapidConfig();

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30_000);

  try {
    const formData = new URLSearchParams();
    for (const [k, v] of Object.entries(fields)) {
      if (v !== undefined && v !== "") formData.append(k, v);
    }

    const response = await fetch(`${INSTAGRAM_API_BASE_URL}/${endpointFile.replace(/^\//, "")}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "x-rapidapi-host": RAPIDAPI_HOST,
        "x-rapidapi-key": RAPIDAPI_KEY as string,
      },
      body: formData.toString(),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Instagram API request failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
  } finally {
    clearTimeout(timeout);
  }
}
