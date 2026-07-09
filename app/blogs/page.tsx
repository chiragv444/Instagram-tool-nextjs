import type { Metadata } from "next";
import Link from "next/link";
import { getAllBlogs, getPopularBlogs } from "@/lib/blogs";
import BlogList from "./blog-list";

export const metadata: Metadata = {
  title: "Blogs - SaveInstaVideo",
  description:
    "Read the latest SaveInstaVideo guides, tutorials, and downloader tips.",
  alternates: {
    canonical: "/blogs/",
  },
};

const POSTS_PER_PAGE = 1;

export default function BlogsPage() {
  const blogs = getAllBlogs();
  const popularBlogs = getPopularBlogs(4);

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
        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
          <BlogList blogs={blogs} postsPerPage={POSTS_PER_PAGE} />

          <aside className="lg:pl-2">
            <div className="sticky top-4 rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-extrabold text-gray-950">
                Popular Posts
              </h2>
              <div className="mt-4 divide-y divide-gray-100">
                {popularBlogs.map((blog) => (
                  <Link
                    key={blog.slug}
                    href={`/blogs/${blog.slug}/`}
                    className="block py-4 first:pt-0 last:pb-0"
                  >
                    <p className="text-xs font-semibold text-[#cb2444]">
                      {blog.date}
                    </p>
                    <h3 className="mt-1 text-sm font-bold leading-5 text-gray-950 hover:text-[#cb2444]">
                      {blog.title}
                    </h3>
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
