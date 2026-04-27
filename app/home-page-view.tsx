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
                  <h3 className="text-3xl font-bold leading-snug text-[#1d4ed8]">
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

      <script defer src="/instagram-widget.js" />
    </div>
  );
}

export async function HomePageView({ locale }: { locale: string }) {
  return <MarketingPageView locale={locale} pageKey="video" />;
}
