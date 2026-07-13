import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getAllBlogSlugs,
  getBlogBySlug,
  getBlogImageSrc,
  getBlogRouteSlug,
} from "@/lib/blogs";

type Props = {
  params: Promise<{ slug: string }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllBlogSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const blog = getBlogBySlug(slug);

  if (!blog) {
    return {
      title: "Blog Not Found - SaveInstaVideo",
    };
  }

  const routeSlug = getBlogRouteSlug(blog);
  const blogImage = getBlogImageSrc(blog);
  const blogImageUrl = typeof blogImage === "string" ? blogImage : blogImage.src;

  return {
    title: `${blog.title} - SaveInstaVideo`,
    description: blog.description,
    alternates: {
      canonical: `/blog/${routeSlug}/`,
    },
    openGraph: {
      title: blog.title,
      description: blog.description,
      type: "article",
      images: [{ url: blogImageUrl }],
    },
  };
}

export default async function BlogDetailPage({ params }: Props) {
  const { slug } = await params;
  const blog = getBlogBySlug(slug);

  if (!blog) notFound();

  const routeSlug = getBlogRouteSlug(blog);
  const blogImage = getBlogImageSrc(blog);

  return (
    <main className="bg-white">
      <article className="container max-w-6xl mx-auto px-4 py-8 md:py-12">

        <div className="mb-6 mt-2 text-[16px] font-bold bg-gray-50 rounded p-3">
          {/* breadcrumb here */}
          🏠︎{" "}
          <Link href="/" className="hover:text-red-600">
            Home
          </Link>{" "}
          /{" "}
          <Link href="/blog/" className="hover:text-red-600">
            Blog
          </Link>{" "}
          /{" "}
          <Link href={`/blog/${routeSlug}/`} className="hover:text-red-600">
            {blog?.title}
          </Link>
        </div>

          <div>
            <div className="flex justify-between">
              <p className="text-sm font-semibold text-[#cb2444]">{blog.date}</p>
              <Link
                href="/blog/"
                className="text-sm font-bold text-[#cb2444] hover:text-gray-950"
              >
                Back to blogs
              </Link>
            </div>
            <h1 className="mt-3 text-3xl font-extrabold leading-tight text-gray-950 md:text-5xl">
              {blog.title}
            </h1>
            <p className="mt-4 text-base leading-7 text-gray-700 md:text-lg">
              {blog.description}
            </p>

            <Image
              src={blogImage}
              alt="Instagram Downloader"
              width={960}
              height={540}
              className="mt-8 aspect-video w-full rounded-lg object-cover"
              priority
            />

            <div
              className="blog-content mt-8 text-gray-800"
              dangerouslySetInnerHTML={{ __html: blog.content }}
            />
          </div>

      </article>
    </main>
  );
}
