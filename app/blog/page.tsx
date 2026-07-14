import type { Metadata } from "next";
// import Link from "next/link";
import { getAllBlogs } from "@/lib/blogs";
import BlogList from "./blog-list";
import Image from "next/image";

export const metadata: Metadata = {
  title: "SaveInstaVideo - Instagram Video, Photo, Story and Reels",
  description:
    "A free and fast tool to download Instagram videos online. Without any login or signup.",
  alternates: {
    canonical: "/blog/",
  },
};

const POSTS_PER_PAGE = 10;

export default function BlogPage() {
  const blogs = getAllBlogs();

  return (
    <main className="bg-white">
      <section className="relative overflow-hidden bg-gradient-to-r from-[#694bff52] via-[#b232e923] to-[#ff166834]">
        {/* absolute img */}
        <Image
          src="/img/blog-bg.png"
          alt="Instagram Downloader Blog"
          height={200}
          width={200}
          className="object-cover absolute top-0 right-50 w-full md:w-auto"
        />
        <div className="container max-w-6xl mx-auto px-4 py-10 md:py-14">
          {/* <p className="text-sm font-semibold uppercase tracking-wide text-[#cb2444]">
            SaveInstaVideo Blog
          </p> */}
          <h1 className="mt-3 text-3xl font-extrabold text-gray-950 md:text-5xl">
            Our Blog
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-gray-700 md:text-lg">
            Tips, tricks and guides to help you easily download and save your favorite Instagram videos.
          </p>
        </div>
      </section>
      <section className="container max-w-6xl mx-auto px-4 py-10">
        <BlogList blogs={blogs} postsPerPage={POSTS_PER_PAGE} />
      </section>
    </main>
  );
}
