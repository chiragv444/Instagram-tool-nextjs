import type { FooterContent } from "@/app/components/footer-types";
import type { HeroFormLabels, HeroNavLabels } from "@/app/components/hero-types";

export type DictionaryPageKey =
  | "video"
  | "photo"
  | "reels"
  | "story"
  | "viewer";

export type HomeMeta = {
  title: string;
  description: string;
  keywords: string;
};

export type HomeFaqItem = {
  question: string;
  answer: string;
};

export type HowToDownloadStep = {
  title: string;
  description: string;
  imageUrl?: string;
  imageAlt?: string;
};

export type WhySectionItem = {
  title: string;
  description: string;
  iconsvg: string;
};

export type FeatureItem = {
  title: string;
  description: string;
  imageUrl: string;
  imageAlt: string;
};

/** Normalized page dictionary for tool landing pages (matches JSON + UI shape). */
export type PageDictionary = {
  meta: HomeMeta;
  hero: { title: string; subtitle: string };
  nav: HeroNavLabels;
  form: HeroFormLabels;
  introduction: {
    title: string;
    descriptionHtml: string[];
  };
  whatSection: {
    title: string;
    descriptionHtml: string[];
  };
  howToDownload: {
    title: string;
    description: string;
    steps: HowToDownloadStep[];
  };
  whySection: {
    title: string;
    description: string;
    items: WhySectionItem[];
  };
  features: {
    title: string;
    description: string;
    items: FeatureItem[];
  };
  faq: {
    title: string;
    description: string;
    items: HomeFaqItem[];
  };
  footer: FooterContent;
};
