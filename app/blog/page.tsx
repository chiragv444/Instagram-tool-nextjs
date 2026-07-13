import type { Metadata } from "next";
// import Link from "next/link";
import { getAllBlogs,  } from "@/lib/blogs";
import BlogList from "./blog-list";

export const metadata: Metadata = {
  title: "Blogs - SaveInstaVideo",
  description:
    "Read the latest SaveInstaVideo guides, tutorials, and downloader tips.",
  alternates: {
    canonical: "/blog/",
  },
};

const POSTS_PER_PAGE = 2;

export default function BlogPage() {
  const blogs = getAllBlogs();

  return (
    <main className="bg-white">
      <section className="border-y border-gray-100 bg-gray-50">
        <div className="container max-w-6xl mx-auto px-4 py-10 md:py-14">
          <p className="text-sm font-semibold uppercase tracking-wide text-[#cb2444]">
            SaveInstaVideo Blog
          </p>
          <h1 className="mt-3 text-3xl font-extrabold text-gray-950 md:text-5xl">
            Instagram downloader guides and tips
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-gray-700 md:text-lg">
            Practical articles for saving videos, reels, stories, and photos
            quickly from your browser.
          </p>
        </div>
      </section>

      <section className="container max-w-6xl mx-auto px-4 py-10">
          <BlogList blogs={blogs} postsPerPage={POSTS_PER_PAGE} />
      </section>
    </main>
  );
}
