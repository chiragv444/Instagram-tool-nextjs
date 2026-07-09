import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getAllBlogSlugs,
  getBlogBySlug,
  getPopularBlogs,
} from "@/lib/blogs";

type Props = {
  params: Promise<{ slug: string }>;
};

const BLOG_IMAGE_SRC = "/img/card_index.webp";

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

  return {
    title: `${blog.title} - SaveInstaVideo`,
    description: blog.description,
    alternates: {
      canonical: `/blogs/${blog.slug}/`,
    },
    openGraph: {
      title: blog.title,
      description: blog.description,
      type: "article",
      images: [{ url: BLOG_IMAGE_SRC }],
    },
  };
}

export default async function BlogDetailPage({ params }: Props) {
  const { slug } = await params;
  const blog = getBlogBySlug(slug);

  if (!blog) notFound();

  const popularBlogs = getPopularBlogs(4).filter((item) => item.slug !== slug);

  return (
    <main className="bg-white">
      <article className="container max-w-6xl mx-auto px-4 py-8 md:py-12">
        <Link
          href="/blogs/"
          className="text-sm font-bold text-[#cb2444] hover:text-gray-950"
        >
          Back to blogs
        </Link>

        <div className="mt-6 grid gap-10 lg:grid-cols-[1fr_320px]">
          <div>
            <p className="text-sm font-semibold text-[#cb2444]">{blog.date}</p>
            <h1 className="mt-3 text-3xl font-extrabold leading-tight text-gray-950 md:text-5xl">
              {blog.title}
            </h1>
            <p className="mt-4 text-base leading-7 text-gray-700 md:text-lg">
              {blog.description}
            </p>

            <Image
              src={BLOG_IMAGE_SRC}
              alt=""
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

          <aside className="lg:pl-2">
            <div className="sticky top-4 rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-extrabold text-gray-950">
                Popular Posts
              </h2>
              <div className="mt-4 divide-y divide-gray-100">
                {popularBlogs.map((item) => (
                  <Link
                    key={item.slug}
                    href={`/blogs/${item.slug}/`}
                    className="block py-4 first:pt-0 last:pb-0"
                  >
                    <p className="text-xs font-semibold text-[#cb2444]">
                      {item.date}
                    </p>
                    <h3 className="mt-1 text-sm font-bold leading-5 text-gray-950 hover:text-[#cb2444]">
                      {item.title}
                    </h3>
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </article>
    </main>
  );
}
