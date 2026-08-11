import type { Metadata } from "next";
// import Link from "next/link";
import { getAllBlogs, getBlogsByQuery, type Blog } from "@/lib/blogs";
import BlogList from "./blog-list";
import Image from "next/image";

const BLOG_PAGE_TITLE = "SaveInstaVideo - Instagram Video, Photo, Story and Reels";
const BLOG_PAGE_DESCRIPTION =
  "A free and fast tool to download Instagram videos online. Without any login or signup.";

const BLOG_SEARCH_TITLE = "Instagram Downloader Guides & Tips | SaveInstaVideo Blog";
const BLOG_SEARCH_DESCRIPTION =
  "Search the SaveInstaVideo.io blog for Instagram downloader guides, Reels download tutorials, Story-saving tips, FAQs, and the latest updates.";

const POSTS_PER_PAGE = 12;

type BlogPageContentProps = {
  blogs?: Blog[];
  searchQuery?: string;
  initialPage?: number;
};

type BlogPageProps = {
  searchParams?: Promise<{
    q?: string | string[];
    page?: string | string[];
  }>;
};

export async function generateMetadata({ searchParams }: BlogPageProps): Promise<Metadata> {
  const params = await searchParams;
  const searchQuery = getSearchQuery(params?.q);

  return {
    title: searchQuery ? BLOG_SEARCH_TITLE : BLOG_PAGE_TITLE,
    description: searchQuery ? BLOG_SEARCH_DESCRIPTION : BLOG_PAGE_DESCRIPTION,
    alternates: {
      canonical: "/blog/",
    },
  };
}

export function BlogPageContent({
  blogs = getAllBlogs(),
  searchQuery = "",
  initialPage = 1,
}: BlogPageContentProps = {}) {
  const trimmedSearchQuery = searchQuery.trim();

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
            alt="Instagram Downloader"
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
      <section className="container max-w-6xl mx-auto mt-10">
        <form
            id="get_blog"
            action="/blog"
            name="formurl"
            autoComplete="off"
            method="get"
            noValidate
            className="flex justify-center"
          >
            <div className="flex flex-col md:flex-row w-full gap-3 max-w-3xl items-stretch">
              <div className="flex flex-1 bg-white rounded-xl shadow overflow-hidden relative">
                {/* <span className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-500 hidden md:block">
                  <svg
                    width={20}
                    height={20}
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden
                  >
                    <path
                      d="M10.75 3.75L12.75 1.75C13.75 0.75 15.75 0.75 16.75 1.75L17.75 2.75C18.75 3.75 18.75 5.75 17.75 6.75L12.75 11.75C11.75 12.75 9.75 12.75 8.75 11.75M8.75 15.75L6.75 17.75C5.75 18.75 3.75 18.75 2.75 17.75L1.75 16.75C0.75 15.75 0.75 13.75 1.75 12.75L6.75 7.75C7.75 6.75 9.75 6.75 10.75 7.75"
                      stroke="black"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span> */}

                <input
                  id="q"
                  name="q"
                  type="text"
                  placeholder="Search any blog here"
                  aria-label="Search blogs"
                  autoCapitalize="none"
                  defaultValue={trimmedSearchQuery}
                  className="flex-1 h-14 md:px-5 px-3 text-base text-gray-800 placeholder:text-gray-500 focus:outline-none"
                />
              </div>

              <button
                id="search"
                type="submit"
                className="h-14 px-8 bg-[#2d8cff] text-white text-sm md:text-base font-semibold rounded-xl shadow flex items-center justify-center hover:opacity-90 cursor-pointer"
              >
                Search
              </button>
            </div>
          </form>
      </section>
      <section className="container max-w-6xl mx-auto px-4 py-10">
        {trimmedSearchQuery && (
          <p className="mb-5 text-sm font-semibold text-gray-700">
            {blogs.length} blog{blogs.length === 1 ? "" : "s"} found for &quot;
            {trimmedSearchQuery}&quot;
          </p>
        )}
        <BlogList
          blogs={blogs}
          postsPerPage={POSTS_PER_PAGE}
          initialPage={initialPage}
        />
      </section>
    </main>
  );
}

function getSearchQuery(q: string | string[] | undefined): string {
  return Array.isArray(q) ? q[0] ?? "" : q ?? "";
}

function getPageNumber(page: string | string[] | undefined, pageCount: number): number {
  const value = Array.isArray(page) ? page[0] : page;
  const parsedPage = Number(value);

  if (!Number.isInteger(parsedPage) || parsedPage < 1) return 1;
  return Math.min(parsedPage, pageCount);
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const params = await searchParams;
  const searchQuery = getSearchQuery(params?.q);
  const blogs = searchQuery ? getBlogsByQuery(searchQuery) : getAllBlogs();
  const pageCount = Math.max(1, Math.ceil(blogs.length / POSTS_PER_PAGE));
  const initialPage = getPageNumber(params?.page, pageCount);

  return (
    <BlogPageContent
      blogs={blogs}
      searchQuery={searchQuery}
      initialPage={initialPage}
    />
  );
}
