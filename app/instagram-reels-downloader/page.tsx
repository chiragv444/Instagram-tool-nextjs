import type { Metadata } from "next";
import {
  generateMarketingMetadata,
  MarketingPageView,
} from "../home-page-view";

export async function generateMetadata(): Promise<Metadata> {
  return generateMarketingMetadata("en", "reels");
}

export default async function InstagramReelsDownloaderPage() {
  return <MarketingPageView locale="en" pageKey="reels" />;
}
