import Image from "next/image";
import Link from "next/link";
import { getDefaultFooterContent } from "@/lib/dictionaries/server";
import type { FooterContent } from "./footer-types";

export type { FooterContent, FooterLinkItem } from "./footer-types";

const defaultFooterContent = getDefaultFooterContent();

export type FooterProps = {
  logoHref?: string;
  content?: FooterContent;
};

export default function Footer({
  logoHref = "/",
  content = defaultFooterContent,
}: FooterProps) {
  return (
    <footer className="bg-[#f4f7fc] pt-10 pb-6 text-center">
      <div className="container max-w-6xl mx-auto px-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="w-full md:max-w-[50%] flex flex-col gap-2 col-span-1 md:col-span-2 md:pr-10">
            <div className="flex mb-4 mx-auto md:mx-0">
              <Link href={logoHref} className="">
                <Image
                  src="/img/SaveInstaVideo.svg"
                  alt="logo"
                  width={120}
                  height={24}
                  className="h-4 sm:h-6 w-auto"
                  unoptimized
                />
              </Link>
            </div>
            <p className="text-gray-700 text-base text-left text-justify">
              {content.description}
            </p>
            <p className="text-xs text-gray-600 text-left hidden md:block mt-4">
              {content.copyright}
            </p>
          </div>

          <div className="w-full flex justify-evenly">
            <nav className="flex flex-col items-start text-gray-700 text-base space-x-2 mb-3 pr-4 md:text-left text-center">
              <p className="text-gray-700 text-xl font-bold mb-2">
                {content.pages.pages_title}
              </p>
              {content.pages.pages_link.map((page) => (
                <a
                  key={`${page.url}-${page.title}`}
                  href={page.url}
                  className="hover:text-gray-900 inline-block"
                >
                  {page.title}
                </a>
              ))}
            </nav>

            <nav className="flex flex-col items-start text-gray-700 text-base space-x-2 mb-3 pr-4 md:text-left text-center">
              <p className="text-gray-700 text-xl font-bold mb-2">
                {content.quick_links.quick_links_title}
              </p>
              {content.quick_links.quick_links_link.map((link) => (
                <a
                  key={`${link.url}-${link.title}`}
                  href={link.url}
                  className="hover:text-gray-900 inline-block"
                >
                  {link.title}
                </a>
              ))}
            </nav>
          </div>
        </div>

        <hr className="mx-auto my-6 border-gray-300 md:hidden" />

        <p className="text-xs text-gray-600 text-center md:hidden mt-4">
          {content.copyright}
        </p>
      </div>
    </footer>
  );
}
