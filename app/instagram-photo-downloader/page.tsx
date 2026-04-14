import type { Metadata } from "next";
import {
  generateMarketingMetadata,
  MarketingPageView,
} from "../home-page-view";

export async function generateMetadata(): Promise<Metadata> {
  return generateMarketingMetadata("en", "photo");
}

export default async function InstagramPhotoDownloaderPage() {
  return <MarketingPageView locale="en" pageKey="photo" />;
}
