const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY?.trim();
const RAPIDAPI_HOST =
  process.env.RAPIDAPI_HOST?.trim() || "instagram-scraper-stable-api.p.rapidapi.com";
const INSTAGRAM_API_BASE_URL =
  process.env.RAPIDAPI_URL?.trim() || "https://instagram-scraper-stable-api.p.rapidapi.com";

export function assertRapidConfig(): void {
  if (!RAPIDAPI_KEY) {
    throw new Error("Missing RapidAPI configuration. Check RAPIDAPI_KEY");
  }
}

export async function fetchInstagramUserInfoFromRapid(username: string): Promise<unknown> {
  assertRapidConfig();

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30_000);

  try {
    const formData = new URLSearchParams();
    formData.append("username_or_url", username);

    const response = await fetch(`${INSTAGRAM_API_BASE_URL}/ig_get_fb_profile_v3.php`, {
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
