import type { Metadata } from "next";
import { parseLocaleParam } from "@/lib/locale-param";
import {
  generateMarketingMetadata,
  MarketingPageView,
} from "../../home-page-view";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = parseLocaleParam((await params).locale);
  return generateMarketingMetadata(locale, "viewer");
}

export default async function LocaleInstagramStoryViewerPage({ params }: Props) {
  const locale = parseLocaleParam((await params).locale);
  return <MarketingPageView locale={locale} pageKey="viewer" />;
}
