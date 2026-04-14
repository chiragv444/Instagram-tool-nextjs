import type { Metadata } from "next";
import {
  generateMarketingMetadata,
  MarketingPageView,
} from "../home-page-view";

export async function generateMetadata(): Promise<Metadata> {
  return generateMarketingMetadata("en", "viewer");
}

export default async function InstagramStoryViewerPage() {
  return <MarketingPageView locale="en" pageKey="viewer" />;
}
