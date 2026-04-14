import { headers } from "next/headers";

export async function getRequestLocale(): Promise<string> {
  const h = await headers();
  return h.get("x-locale") ?? "en";
}

export async function getRequestPathname(): Promise<string> {
  const h = await headers();
  return h.get("x-pathname") ?? "/";
}
