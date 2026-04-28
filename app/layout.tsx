import type { Metadata, Viewport } from "next";
import { Open_Sans } from "next/font/google";
import {
  getCachedPageDictionary,
  getDictionaryKeyForRequestPathname,
} from "@/lib/dictionaries/server";
import { getDefaultMetadataBase } from "@/lib/marketing-hreflang";
import { openGraphLocaleForSiteLocale } from "@/lib/og-locale";
import { getRequestLocale, getRequestPathname } from "@/lib/request-locale";
import Footer from "./components/footer";
import Header from "./components/header";
import "./globals.css";

const openSans = Open_Sans({
  subsets: ["latin"],
  variable: "--font-open-sans",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#ffffff",
};

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  return {
    metadataBase: getDefaultMetadataBase(),
    title: {
      default: "SaveInstaVideo",
      template: "%s",
    },
    description:
      "Download and save your favorite Instagram videos easily. Fast, free, and simple to use.",
    icons: {
      icon: "/img/favicon.png",
      shortcut: "/img/favicon.png",
      apple: "/img/favicon.png",
    },
    robots: {
      index: true,
      follow: true,
    },
    authors: [{ name: "saveinstavideo" }],
    publisher: "saveinstavideo.io",
    openGraph: {
      locale: openGraphLocaleForSiteLocale(locale),
      images: [{ url: "/img/favicon.png" }],
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = await getRequestPathname();
  const locale = await getRequestLocale();
  const pageKey = getDictionaryKeyForRequestPathname(pathname);
  const dict = getCachedPageDictionary(pageKey, locale);
  const logoHref = locale === "en" ? "/" : `/${locale}/`;

  return (
    <html
      lang={locale}
      className={`h-full antialiased ${openSans.variable}`}
    >
      <body className="min-h-full flex flex-col">
        <Header logoHref={logoHref} />
        {children}
        <Footer logoHref={logoHref} content={dict.footer} />
      </body>
    </html>
  );
}
