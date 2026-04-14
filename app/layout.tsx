import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import {
  getCachedPageDictionary,
  getDictionaryKeyForRequestPathname,
} from "@/lib/dictionaries/server";
import { getDefaultMetadataBase } from "@/lib/marketing-hreflang";
import { getRequestLocale, getRequestPathname } from "@/lib/request-locale";
import Footer from "./components/footer";
import Header from "./components/header";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
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
};

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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Header logoHref={logoHref} />
        {children}
        <Footer logoHref={logoHref} content={dict.footer} />
      </body>
    </html>
  );
}
