"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getBlogImageSrc, getBlogRouteSlug, type Blog } from "@/lib/blogs";

type BlogListProps = {
  blogs: Blog[];
  postsPerPage: number;
};

export default function BlogList({ blogs, postsPerPage }: BlogListProps) {
  const pageCount = Math.max(1, Math.ceil(blogs.length / postsPerPage));

  const [currentPage, setCurrentPage] = useState(1);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load saved page from localStorage
  useEffect(() => {
    const savedPage = Number(localStorage.getItem("blogCurrentPage"));

    if (savedPage >= 1 && savedPage <= pageCount) {
      setCurrentPage(savedPage);
    }

    setIsLoaded(true);
  }, [pageCount]);

  // Save page whenever it changes
  useEffect(() => {
    if (!isLoaded) return;

    localStorage.setItem("blogCurrentPage", String(currentPage));
  }, [currentPage, isLoaded]);

  function goToPage(page: number) {
    const newPage = Math.min(Math.max(page, 1), pageCount);
    setCurrentPage(newPage);
  }

  // Prevent initial render until localStorage is loaded
  if (!isLoaded) return null;

  const startIndex = (currentPage - 1) * postsPerPage;
  const visibleBlogs = blogs.slice(startIndex, startIndex + postsPerPage);

  return (
    <div>
      <div className="flex flex-wrap gap-[2%]">
        {visibleBlogs.map((blog) => (
          <article
            key={blog.slug}
            className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-2xs transition hover:-translate-y-0.5 hover:shadow-sm w-full sm:w-[48%] lg:w-[32%] mb-4"
          >
            <Link href={`/blog/${getBlogRouteSlug(blog)}/`} className="block">
              <Image
                src={getBlogImageSrc(blog)}
                alt="Instagram Downloader"
                width={464}
                height={260}
                className="aspect-video w-full object-cover"
                priority={blog === visibleBlogs[0]}
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
        className="mt-8 flex items-center justify-center gap-2"
        aria-label="Blog pagination"
      >
        {/* Hide Previous on first page */}
        {currentPage > 1 && (
          <button
            type="button"
            onClick={() => goToPage(currentPage - 1)}
            className="flex h-9 items-center justify-center rounded-md border border-gray-200 bg-white px-3 text-sm font-bold text-gray-800 hover:border-[#cb2444] hover:text-[#cb2444]"
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
            className={`flex h-9 w-9 items-center justify-center rounded-md border text-sm font-bold ${
              currentPage === index + 1
                ? "border-gray-950 bg-gray-950 text-white"
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
            className="flex h-9 items-center justify-center rounded-md border border-gray-200 bg-white px-3 text-sm font-bold text-gray-800 hover:border-[#cb2444] hover:text-[#cb2444] disabled:bg-gray-50 disabled:text-gray-400 disabled:hover:border-gray-200"
          >
            Next
          </button>
        )}
      </nav>
    </div>
  );
}
