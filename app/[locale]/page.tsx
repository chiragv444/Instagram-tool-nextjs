import type { Metadata } from "next";
import { parseLocaleParam } from "@/lib/locale-param";
import {
  generateVideoHomeMetadata,
  HomePageView,
} from "../home-page-view";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = parseLocaleParam((await params).locale);
  return generateVideoHomeMetadata(locale);
}

export default async function LocaleHomePage({ params }: Props) {
  const locale = parseLocaleParam((await params).locale);
  return <HomePageView locale={locale} />;
}
