import type { Metadata } from "next";
import Image from "next/image";
import {
  getCachedPageDictionary,
  type DictionaryPageKey,
} from "@/lib/dictionaries/server";
import { buildMarketingHreflang } from "@/lib/marketing-hreflang";
import Hero from "./components/hero";
import { HeroInstagramMarkup } from "./components/hero-instagram-markup";
import HomePageFaq from "./components/home-page-faq";

function SectionRule() {
  return (
    <div className="h-[3px] bg-gradient-to-r from-[#6a4bff] via-[#b232e9] to-[#ff1667] mx-auto mb-6" />
  );
}

export async function generateMarketingMetadata(
  locale: string,
  pageKey: DictionaryPageKey,
): Promise<Metadata> {
  const dict = getCachedPageDictionary(pageKey, locale);
  return {
    title: dict.meta.title,
    description: dict.meta.description,
    keywords: dict.meta.keywords,
    alternates: buildMarketingHreflang(locale, pageKey),
  };
}

/** @deprecated use generateMarketingMetadata(locale, "video") */
export async function generateVideoHomeMetadata(
  locale: string,
): Promise<Metadata> {
  return generateMarketingMetadata(locale, "video");
}

export async function MarketingPageView({
  locale,
  pageKey,
}: {
  locale: string;
  pageKey: DictionaryPageKey;
}) {
  const c = getCachedPageDictionary(pageKey, locale);
  const useMockApi = process.env.NEXT_PUBLIC_USE_MOCK_API === "true";

  return (
    <div className="flex flex-col flex-1 bg-zinc-50">
      <Hero
        locale={locale}
        nav={c.nav}
        hero={c.hero}
        form={c.form}
        useMockApi={useMockApi}
      />

      <HeroInstagramMarkup />

      <section className="container max-w-6xl mx-auto my-3 px-4">
        <h2 className="text-[26px] font-bold text-center text-[#1923B8] mb-4">
          {c.introduction.title}
        </h2>
        <SectionRule />
        {c.introduction.descriptionHtml.map((html, i) => (
          <p
            key={i}
            className="mt-3 text-gray-700 text-justify text-wrap tracking-tight"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        ))}
      </section>

      <section className="container max-w-6xl mx-auto my-3 px-4">
        <h2 className="text-[26px] font-bold text-center text-[#1923B8] mb-4">
          {c.whatSection.title}
        </h2>
        <SectionRule />
        {c.whatSection.descriptionHtml.map((html, i) => (
          <p
            key={i}
            className="mt-3 text-gray-700 text-justify text-wrap tracking-tight"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        ))}
      </section>

      <section className="container max-w-6xl mx-auto my-3 px-4">
        <h2 className="text-[26px] font-bold text-center text-[#1923B8] mb-4">
          {c.howToDownload.title}
        </h2>
        <SectionRule />
        <p className="text-center text-base text-gray-700 max-w-3xl mx-auto mb-10 leading-relaxed">
          {c.howToDownload.description}
        </p>
        <div className="flex flex-col gap-10 items-center mt-10">
          {c.howToDownload.steps.map((step, i) => {
            const stepBg =
              i === 0
                ? "from-pink-50 to-white"
                : i === 1
                  ? "from-purple-50 to-white"
                  : "from-indigo-50 to-white";
            return (
              <div
                key={i}
                className={`w-full flex gap-6 items-start bg-gradient-to-r ${stepBg} p-6 rounded-2xl border border-pink-100`}
              >
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-pink-600 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                    <span>{i + 1}</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {step.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed text-justify">
                      {step.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="container max-w-6xl mx-auto my-3 px-4">
        <h2 className="text-[26px] font-bold text-center text-[#1923B8] mb-4">
          {c.whySection.title}
        </h2>
        <SectionRule />
        <p className="text-center text-base text-gray-700 max-w-3xl mx-auto mb-10 leading-relaxed">
          {c.whySection.description}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
          {c.whySection.items.map((item, i) => (
            <div
              key={i}
              className="flex flex-col items-center text-center border border-[#e5e7eb] bg-indigo-50 rounded-xl py-5 px-10"
            >
              <div
                className="mb-4 flex items-center justify-center w-16 h-16 [&_svg]:max-w-full [&_svg]:max-h-full"
                dangerouslySetInnerHTML={{ __html: item.iconsvg }}
              />
              <h3 className="text-xl font-bold text-[#be185d] mb-4 w-full">
                {item.title}
              </h3>
              <p
                className="text-gray-700 text-base text-justify"
                dangerouslySetInnerHTML={{ __html: item.description }}
              />
            </div>
          ))}
        </div>
      </section>

      <section className="container max-w-6xl mx-auto my-3 px-4">
        <h2 className="text-[26px] font-bold text-center text-[#1923B8] mb-4">
          {c.features.title}
        </h2>
        <SectionRule />
        {c.features.description ? (
          <p className="text-center text-base text-gray-700 max-w-3xl mx-auto mb-10 leading-relaxed">
            {c.features.description}
          </p>
        ) : null}
        <div className="grid grid-cols-1 md:grid-cols-1 gap-10">
          <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-10 xs2:px-12 sm:px-0">
            {c.features.items.map((item, i) => (
              <li
                key={i}
                className="border-2 border-[#ffd5ec] rounded-[20px] min-h-[350px] shadow-sm"
              >
                <div className="flex justify-center rounded-t-[17px] bg-[#ffd5ec] h-[200px] relative overflow-hidden">
                  <Image
                    src={item.imageUrl}
                    alt={item.imageAlt}
                    fill
                    className="object-cover rounded-t-[17px]"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    unoptimized
                  />
                </div>
                <div className="p-5 text-left">
                  <h3 className="text-xl font-bold leading-snug text-[#1d4ed8]">
                    {item.title}
                  </h3>
                  <p
                    className="mt-3 text-gray-700 text-justify"
                    dangerouslySetInnerHTML={{ __html: item.description }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <HomePageFaq
        title={c.faq.title}
        description={c.faq.description}
        items={c.faq.items}
      />

      {getJsonLdScript(locale, pageKey) ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: getJsonLdScript(locale, pageKey) as string }}
        />
      ) : null}

      <script defer src="/instagram-widget.js" />
    </div>
  );
}

export function HomePageView({ locale }: { locale: string }) {
  return <MarketingPageView locale={locale} pageKey="video" />;
}

function getJsonLdScript(locale: string, pageKey: DictionaryPageKey) {
  if (locale !== "en") return undefined;

  const jsonLdByPageKey: Record<DictionaryPageKey, string> = {
    video: `{"@context": "https://schema.org","@graph": [{"@type": "WebSite","name": "saveinstavideo","alternateName": ["Instagram Video Downloader","Download Video IG","Download Instagram Videos"],"url": "https://saveinstavideo.io/","potentialAction": {"@type": "SearchAction","target": "https://saveinstavideo.io/?url={search_term_string","query-input": "required name=search_term_string"}},{"@type": "WebPage","name": "SaveInstaVideo - Free Instagram Video Downloader","description": "SaveInstaVideo is a free Instagram downloader to download instagram videos, Reels, photos, and Stories online. Works smoothly on mobile, tablet, and desktop.","url": "https://saveinstavideo.io/","inLanguage": "en"},{"@type": "Organization","name": "saveinstavideo","alternateName": "Instagram Downloader","url": "https://saveinstavideo.io/","logo": "https://saveinstavideo.io/img/SaveInstaVideo.svg"},{"@type": "WebApplication","name": "Saveinstavideo","alternateName": ["Instagram downloader","Instagram Video Downloader","Download Video IG","Download Instagram Videos"],"url": "https://saveinstavideo.io/","description": "SaveInstaVideo is a free Instagram downloader to download instagram videos, Reels, photos, and Stories online. Works smoothly on mobile, tablet, and desktop.\r\n ","image": "https://saveinstavideo.io/img/SaveInstaVideo.svg","operatingSystem": "Windows, Linux, iOS, Android, OSX, macOS","applicationCategory": "UtilitiesApplication","featureList": ["Photo downloader","Video Downloader","Reel Downloader","Story Downloader","Story Viewer"],"contentRating": "Everyone","aggregateRating": {"@type": "AggregateRating","ratingValue": "4.97","reviewCount": "96545"},"offers": {"@type": "Offer","price": "0"}}]}`,
    photo: `{"@context": "https://schema.org","@graph": [{"@type": "WebSite","name": "saveinstavideo","alternateName": ["Instagram Photo Download","Instagram Pic Download","Instagram Pic Downloader"],"url": "https://saveinstavideo.io/instagram-photo-downloader/","potentialAction": {"@type": "SearchAction","target": "https://saveinstavideo.io/instagram-photo-downloader/?url={search_term_string","query-input": "required name=search_term_string"}},{"@type": "WebPage","name": "Free Instagram Photo Download - SaveInstaVideo","description": "Instagram Photo Download is used to save photos from Instagram in seconds. Free, safe and works on any device without sign-up with 100% original picture quality.","url": "https://saveinstavideo.io/instagram-photo-downloader/","inLanguage": "en"},{"@type": "Organization","name": "saveinstavideo","alternateName": "Instagram Photo Download","url": "https://saveinstavideo.io/instagram-photo-downloader/","logo": "https://saveinstavideo.io/img/SaveInstaVideo.svg"},{"@type": "WebApplication","name": "Saveinstavideo","alternateName": ["Instagram Photo Download","Instagram Photo Downloader","Instagram Image Download","Instagram Pic Download"],"url": "https://saveinstavideo.io/instagram-photo-downloader/","description": "Instagram Photo Download is used to save photos from Instagram in seconds. Free, safe and works on any device without sign-up with 100% original picture quality.","image": "https://saveinstavideo.io/img/SaveInstaVideo.svg","operatingSystem": "Windows, Linux, iOS, Android, OSX, macOS","applicationCategory": "UtilitiesApplication","featureList": ["Photo downloader","Video Downloader","Reel Downloader","Story Downloader","Story Viewer"],"contentRating": "Everyone","aggregateRating": {"@type": "AggregateRating","ratingValue": "4.96","reviewCount": "83544"},"offers": {"@type": "Offer","price": "0"}}]}`,
    reels: `{"@context": "https://schema.org","@graph": [{"@type": "WebSite","name": "saveinstavideo","alternateName": ["Instagram Reels Download","Insta Reel Download","Instagram Reels Video Download"],"url": "https://saveinstavideo.io/instagram-reels-downloader/","potentialAction": {"@type": "SearchAction","target": "https://saveinstavideo.io/instagram-reels-downloader/?url={search_term_string","query-input": "required name=search_term_string"}},{"@type": "WebPage","name": "Instagram Reels Downloader: Free Download Insta Reel by Link","description": "Download Instagram Reels in HD without watermark for free. Fast, secure, and easy Instagram Reels downloader with no login.","url": "https://saveinstavideo.io/instagram-reels-downloader/","inLanguage": "en"},{"@type": "Organization","name": "saveinstavideo","alternateName": "Instagram Reels Download","url": "https://saveinstavideo.io/instagram-reels-downloader/","logo": "https://saveinstavideo.io/img/SaveInstaVideo.svg"},{"@type": "WebApplication","name": "Saveinstavideo","alternateName": ["Instagram Reels Download","Download Instagram Reels","Instagram Reel Downloader","Instagram Reels Downloader"],"url": "https://saveinstavideo.io/instagram-reels-downloader/","description": "Download Instagram Reels in HD without watermark for free. Fast, secure, and easy Instagram Reels downloader with no login.","image": "https://saveinstavideo.io/img/SaveInstaVideo.svg","operatingSystem": "Windows, Linux, iOS, Android, OSX, macOS","applicationCategory": "UtilitiesApplication","featureList": ["Photo downloader","Video Downloader","Reel Downloader","Story Downloader","Story Viewer"],"contentRating": "Everyone","aggregateRating": {"@type": "AggregateRating","ratingValue": "4.94","reviewCount": "93457"},"offers": {"@type": "Offer","price": "0"}}]}`,
    story: `{"@context": "https://schema.org","@graph": [{"@type": "WebSite","name": "saveinstavideo","alternateName": ["Instagram Story Download","Download Instagram Story","Instagram Story Downloader"],"url": "https://saveinstavideo.io/instagram-story-downloader/","potentialAction": {"@type": "SearchAction","target": "https://saveinstavideo.io/instagram-story-downloader/?url={search_term_string","query-input": "required name=search_term_string"}},{"@type": "WebPage","name": "Instagram Story Saver - Download Instagram Story (HD)","description": "Instagram Story Download tool to save photos and videos from IG Stories online. Fast, free Instagram Story Saver for PC, iPhone, and Android.","url": "https://saveinstavideo.io/instagram-story-downloader/","inLanguage": "en"},{"@type": "Organization","name": "saveinstavideo","alternateName": "Instagram Story Saver","url": "https://saveinstavideo.io/instagram-story-downloader/","logo": "https://saveinstavideo.io/img/SaveInstaVideo.svg"},{"@type": "WebApplication","name": "Saveinstavideo","alternateName": ["Instagram Story Saver","Instagram Story Download","Download Instagram Story","Instagram Story Downloader"],"url": "https://saveinstavideo.io/instagram-story-downloader/","description": "Instagram Story Download tool to save photos and videos from IG Stories online. Fast, free Instagram Story Saver for PC, iPhone, and Android.","image": "https://saveinstavideo.io/img/SaveInstaVideo.svg","operatingSystem": "Windows, Linux, iOS, Android, OSX, macOS","applicationCategory": "UtilitiesApplication","featureList": ["Photo downloader","Video Downloader","Reel Downloader","Story Downloader","Story Viewer"],"contentRating": "Everyone","aggregateRating": {"@type": "AggregateRating","ratingValue": "4.99","reviewCount": "98642"},"offers": {"@type": "Offer","price": "0"}}]}`,
    viewer: `{"@context": "https://schema.org","@graph": [{"@type": "WebSite","name": "saveinstavideo","alternateName": ["Instagram Story Viewer","Anonymous Instagram Story Viewer","Watch IG Stories"],"url": "https://saveinstavideo.io/instagram-story-viewer/","potentialAction": {"@type": "SearchAction","target": "https://saveinstavideo.io/instagram-story-viewer/?url={search_term_string","query-input": "required name=search_term_string"}},{"@type": "WebPage","name": "Anonymous Instagram Story Viewer - Instagram Story Viewer","description": "Instagram Story Viewer is an online tool to view and download content from Instagram anonymously. 100% free and safe unlimited use on any device without logging in.","url": "https://saveinstavideo.io/instagram-story-viewer/","inLanguage": "en"},{"@type": "Organization","name": "saveinstavideo","alternateName": "Instagram Story Viewer","url": "https://saveinstavideo.io/instagram-story-viewer/","logo": "https://saveinstavideo.io/img/SaveInstaVideo.svg"},{"@type": "WebApplication","name": "Saveinstavideo","alternateName": ["Instagram Story Viewer","Anonymous Instagram Story Viewer","Watch IG Stories","Insta Story Viewer"],"url": "https://saveinstavideo.io/instagram-story-viewer/","description": "Instagram Story Viewer is an online tool to view and download content from Instagram anonymously. 100% free and safe unlimited use on any device without logging in.","image": "https://saveinstavideo.io/img/SaveInstaVideo.svg","operatingSystem": "Windows, Linux, iOS, Android, OSX, macOS","applicationCategory": "UtilitiesApplication","featureList": ["Photo downloader","Video Downloader","Reel Downloader","Story Downloader","Story Viewer"],"contentRating": "Everyone","aggregateRating": {"@type": "AggregateRating","ratingValue": "4.93","reviewCount": "99534"},"offers": {"@type": "Offer","price": "0"}}]}`,
  };

  return jsonLdByPageKey[pageKey];
}
