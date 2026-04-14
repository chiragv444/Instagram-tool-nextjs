import type { PageDictionary } from "./types";

type RawWhyItem = {
  title: string;
  description: string;
  iconsvg: string;
};

type RawFeatureItem = {
  title: string;
  description: string;
  imageUrl: string;
  imageAlt: string;
};

/** Map `dictionaries/<page>/<locale>.json` into `PageDictionary`. */
export function normalizePageDictionary(raw: Record<string, unknown>): PageDictionary {
  const whyItems = (raw.why_section as { items?: RawWhyItem[] })?.items ?? [];
  const featureItems =
    (raw.features as { items?: RawFeatureItem[] })?.items ?? [];

  return {
    meta: raw.meta as PageDictionary["meta"],
    hero: raw.hero as PageDictionary["hero"],
    nav: raw.nav as PageDictionary["nav"],
    form: raw.form as PageDictionary["form"],
    introduction: {
      title: (raw.page_introduction as { title: string }).title,
      descriptionHtml: (raw.page_introduction as { description: string[] })
        .description,
    },
    whatSection: {
      title: (raw.what_section as { title: string }).title,
      descriptionHtml: (raw.what_section as { description: string[] })
        .description,
    },
    howToDownload: {
      title: (raw.how_to_download as { title: string }).title,
      description: (raw.how_to_download as { description: string }).description,
      steps: (raw.how_to_download as { steps: PageDictionary["howToDownload"]["steps"] })
        .steps,
    },
    whySection: {
      title: (raw.why_section as { title: string }).title,
      description: (raw.why_section as { description: string }).description,
      items: whyItems.map((item) => ({
        title: item.title,
        description: item.description,
        iconsvg: item.iconsvg,
      })),
    },
    features: {
      title: (raw.features as { title: string }).title,
      description: (raw.features as { description: string }).description ?? "",
      items: featureItems.map((item) => ({
        title: item.title,
        description: item.description,
        imageUrl: item.imageUrl,
        imageAlt: item.imageAlt,
      })),
    },
    faq: {
      title: (raw.faq as { title: string }).title,
      description: (raw.faq as { description: string }).description ?? "",
      items: (raw.faq as { items: PageDictionary["faq"]["items"] }).items,
    },
    footer: raw.footer as PageDictionary["footer"],
  };
}
