import type { Metadata } from "next";
import {
  generateMarketingMetadata,
  MarketingPageView,
} from "../home-page-view";

export async function generateMetadata(): Promise<Metadata> {
  return generateMarketingMetadata("en", "story");
}

export default async function InstagramStoryDownloaderPage() {
  return <MarketingPageView locale="en" pageKey="story" />;
}
