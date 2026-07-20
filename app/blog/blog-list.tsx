"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getBlogImageSrc, getBlogRouteSlug, type Blog } from "@/lib/blogs";

type BlogListProps = {
  blogs: Blog[];
  postsPerPage: number;
  rememberPage?: boolean;
};

export default function BlogList({
  blogs,
  postsPerPage,
  rememberPage = true,
}: BlogListProps) {
  const pageCount = Math.max(1, Math.ceil(blogs.length / postsPerPage));

  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (!rememberPage) {
      setCurrentPage(1);
      return;
    }

    const savedPage = Number(localStorage.getItem("blogCurrentPage"));

    if (savedPage >= 1 && savedPage <= pageCount) {
      setCurrentPage(savedPage);
    } else {
      setCurrentPage(1);
    }
  }, [pageCount, rememberPage]);

  function goToPage(page: number) {
    const newPage = Math.min(Math.max(page, 1), pageCount);
    setCurrentPage(newPage);
    if (rememberPage) {
      localStorage.setItem("blogCurrentPage", String(newPage));
    }
  }

  const startIndex = (currentPage - 1) * postsPerPage;
  const visibleBlogs = blogs.slice(startIndex, startIndex + postsPerPage);

  return (
    <div>
      {blogs.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-gray-50 px-5 py-8 text-center text-sm font-semibold text-gray-700">
          No blogs found.
        </div>
      ) : (
        <div className="flex flex-wrap gap-[2%]">
          {visibleBlogs.map((blog) => (
            <article
              key={blog.blog_id}
              className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-2xs transition hover:-translate-y-0.5 hover:shadow-sm w-full sm:w-[48%] lg:w-[32%] mb-4"
            >
              <Link
                href={`/blog/${getBlogRouteSlug(blog)}/`}
                className="relative block aspect-[460/208] overflow-hidden bg-gray-100"
              >
                <Image
                  src={getBlogImageSrc(blog)}
                  alt={blog.imagealt}
                  // alt="Instagram Downloader"
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 48vw, 33vw"
                  className="object-cover"
                  preload={blog === visibleBlogs[0]}
                />
              </Link>

              <div className="p-5">
                {/* <p className="text-sm font-medium text-[#cb2444]">
                  {blog.date}
                </p> */}

                <h2 className="mt-2 text-xl font-bold leading-snug text-gray-950">
                  <Link href={`/blog/${getBlogRouteSlug(blog)}/`}>
                    {blog.title}
                  </Link>
                </h2>

                <p className="mt-3 line-clamp-3 text-sm leading-6 text-gray-700">
                  {blog.description}
                </p>

                <Link
                  href={`/blog/${getBlogRouteSlug(blog)}/`}
                  className="mt-4 inline-flex text-sm font-bold text-gray-950 hover:text-[#cb2444]"
                >
                  Read more
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* <nav
        className="mt-8 flex items-center justify-center gap-2"
        aria-label="Blog pagination"
      >
        <button
          type="button"
          disabled={currentPage === 1}
          onClick={() => goToPage(currentPage - 1)}
          className="flex h-9 items-center justify-center rounded-md border border-gray-200 bg-white px-3 text-sm font-bold text-gray-800 hover:border-[#cb2444] hover:text-[#cb2444] disabled:bg-gray-50 disabled:text-gray-400 disabled:hover:border-gray-200"
        >
          Previous
        </button>

        {Array.from({ length: pageCount }, (_, index) => (
          <button
            key={index}
            type="button"
            onClick={() => goToPage(index + 1)}
            aria-current={currentPage === index + 1 ? "page" : undefined}
            className={`flex h-9 w-9 items-center justify-center rounded-md border text-sm font-bold ${
              currentPage === index + 1
                ? "border-gray-950 bg-gray-950 text-white"
                : "border-gray-200 bg-white text-gray-800 hover:border-[#cb2444] hover:text-[#cb2444]"
            }`}
          >
            {index + 1}
          </button>
        ))}

        <button
          type="button"
          disabled={currentPage === pageCount}
          onClick={() => goToPage(currentPage + 1)}
          className="flex h-9 items-center justify-center rounded-md border border-gray-200 bg-white px-3 text-sm font-bold text-gray-800 hover:border-[#cb2444] hover:text-[#cb2444] disabled:bg-gray-50 disabled:text-gray-400 disabled:hover:border-gray-200"
        >
          Next
        </button>
      </nav> */}
      <nav
        className={`mt-8 flex items-center justify-center gap-2 ${
          blogs.length === 0 ? "hidden" : ""
        }`}
        aria-label="Blog pagination"
      >
        {/* Hide Previous on first page */}
        {currentPage > 1 && (
          <button
            type="button"
            onClick={() => goToPage(currentPage - 1)}
            className="flex h-9 items-center justify-center rounded-full bg-white px-3 text-sm font-bold text-gray-800 hover:text-[#cb2444] cursor-pointer"
          >
            Previous
          </button>
        )}

        {Array.from({ length: pageCount }, (_, index) => (
          <button
            key={index}
            type="button"
            onClick={() => goToPage(index + 1)}
            aria-current={currentPage === index + 1 ? "page" : undefined}
            className={`flex h-9 w-9 items-center justify-center rounded-full border text-sm font-bold cursor-pointer ${
              currentPage === index + 1
                ? "border-[#6a4bff] bg-[#6a4bff] text-white"
                : "border-gray-200 bg-white text-gray-800 hover:border-[#cb2444] hover:text-[#cb2444]"
            }`}
          >
            {index + 1}
          </button>
        ))}

        {/* Hide Next on last page, except when there's only one page */}
        {(currentPage < pageCount || pageCount === 1) && (
          <button
            type="button"
            disabled={currentPage === pageCount}
            onClick={() => goToPage(currentPage + 1)}
            className="flex h-9 items-center justify-center rounded-full bg-white px-3 text-sm font-bold text-gray-800 hover:text-[#cb2444] disabled:bg-gray-50 disabled:text-gray-400 disabled:hover:border-gray-200 cursor-pointer"
          >
            Next
          </button>
        )}
      </nav>
      <div className="max-w-170 mt-8 mx-auto border border-[#dfdfdf] bg-[#f5f5f577] rounded-2xl p-8 text-center">
        <h3 className="text-[20px] font-bold mb-3">
          Need to download Instagram stories, reels and videos?
        </h3>
        <p className="text-[15px] leading-6 !mb-6">
          Save Instagram Reels, videos, photos, and Stories in seconds with the
          Instagram Downloader. No software or installation needed.
        </p>
        <a
          className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-[#6a4bff] via-[#b232e9] to-[#ff1667] text-white text-[15px] font-semibold h-12 px-8 shadow-[0_4px_14px_rgba(255,0,0,0.22)] hover:bg-[#4a474e] hover:shadow-none transition-all"
          href="/"
        >
          Go to Downloader →
        </a>
      </div>
    </div>
  );
}
