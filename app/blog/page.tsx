import type { Metadata } from "next";
// import Link from "next/link";
import { getAllBlogs } from "@/lib/blogs";
import { buildBlogAlternates } from "@/lib/marketing-hreflang";
import BlogList from "./blog-list";
import Image from "next/image";

export const metadata: Metadata = {
  title: "SaveInstaVideo - Instagram Video, Photo, Story and Reels",
  description:
    "A free and fast tool to download Instagram videos online. Without any login or signup.",
  alternates: buildBlogAlternates("/blog/"),
};

const POSTS_PER_PAGE = 1;

export function BlogPageContent() {
  const blogs = getAllBlogs();

  return (
    <main className="bg-white">
      <section className="relative overflow-hidden bg-gradient-to-r from-[#694bff52] via-[#b232e923] to-[#ff166834]">
        <div className="container max-w-6xl mx-auto px-4 py-10 md:py-[60px] text-center">
          {/* <p className="text-sm font-semibold uppercase tracking-wide text-[#cb2444]">
            SaveInstaVideo Blog
          </p> */}
          <h1 className="mt-3 text-3xl font-extrabold text-gray-950 md:text-5xl">
            Our Blog
          </h1>
          <p className="mt-4 text-base leading-7 text-gray-700 md:text-lg text-center">
            Tips, tricks and guides to help you easily download and save your
            favorite Instagram videos.
          </p>
          {/* absolute img */}
          <Image
            src="/img/blog-bg.png"
            alt="Instagram Downloader Blog"
            height={200}
            width={200}
            className="object-cover h-42.5 w-42.5 absolute top-6 right-10 xl:right-30 2xl:right-70 md:w-auto opacity-20 xl:opacity-60"
          />
          {/* Background */}
          <div className="absolute inset-0 pointer-events-none opacity-30 xl:opacity-60">
            {/* <div className="absolute top-8 left-16 h-10 w-10 rounded-full bg-purple-500/30" />
            <div className="absolute top-10 right-20 h-6 w-6 rounded-full bg-fuchsia-500/25" />
            <div className="absolute bottom-20 left-1/4 h-3 w-3 rounded-full bg-violet-600/20" />
            <div className="absolute bottom-10 right-1/4 h-8 w-8 rounded-full bg-indigo-500/20" /> */}
            <div className="absolute top-8 left-10 sm:left-16 h-10 w-10 rounded-full bg-gradient-to-br from-white via-purple-300 to-purple-600 shadow-[inset_-4px_-4px_8px_rgba(126,34,206,0.35),inset_4px_4px_8px_rgba(255,255,255,0.7),0_6px_16px_rgba(139,92,246,0.35)]" />
            <div className="absolute top-10 right-20 h-6 w-6 rounded-full bg-gradient-to-br from-white via-fuchsia-300 to-fuchsia-600 shadow-[inset_-3px_-3px_6px_rgba(192,38,211,0.35),inset_3px_3px_6px_rgba(255,255,255,0.7),0_4px_10px_rgba(192,38,211,0.35)]" />
            <div className="absolute bottom-24 left-1/4 h-3 w-3 rounded-full bg-gradient-to-br from-white via-violet-300 to-violet-600 shadow-[inset_-2px_-2px_4px_rgba(109,40,217,0.35),inset_2px_2px_4px_rgba(255,255,255,0.7),0_2px_6px_rgba(109,40,217,0.35)]" />
            <div className="absolute hidden md:block bottom-6 right-1/4 h-8 w-8 rounded-full bg-gradient-to-br from-white via-fuchsia-300 to-fuchsia-400 shadow-[inset_-3px_-3px_6px_rgba(79,70,229,0.35),inset_3px_3px_6px_rgba(255,255,255,0.7),0_5px_14px_rgba(99,102,241,0.35)]" />
          </div>
        </div>
      </section>
      <section className="container max-w-6xl mx-auto px-4 py-10">
        <BlogList blogs={blogs} postsPerPage={POSTS_PER_PAGE} />
      </section>
    </main>
  );
}

export default function BlogPage() {
  return <BlogPageContent />;
}
