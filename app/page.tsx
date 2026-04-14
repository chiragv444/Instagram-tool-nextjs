import type { Metadata } from "next";
import {
  generateVideoHomeMetadata,
  HomePageView,
} from "./home-page-view";

export async function generateMetadata(): Promise<Metadata> {
  return generateVideoHomeMetadata("en");
}

export default async function Home() {
  return <HomePageView locale="en" />;
}
