import type { StaticImageData } from "next/image";
import blogsData from "@/data/blogs.json";

import blogImage01 from '@/app/assets/1st-blog-webp.webp';
import blogImage02 from '@/app/assets/2nd-blog-webp.webp';
import blogImage03 from '@/app/assets/3rd-blog-webp.webp';
import blogImage04 from '@/app/assets/4th-blog-webp.webp';
import blogImage05 from '@/app/assets/5th-blog-webp.webp';
import blogImage06 from '@/app/assets/6th-blog-webp.webp';
import blogImage07 from '@/app/assets/7th-blog-webp.webp';

export type Blog = {
  blog_id: string;
  slug: string;
  title: string;
  description: string;
  date: string;
  image: string;
  imagealt: string;
  content: string;
};

const blogs = blogsData as Blog[];

const blogImageAssets: Record<string, StaticImageData> = {
  "1st-blog-webp": blogImage01,
  "2nd-blog-webp": blogImage02,
  "3rd-blog-webp": blogImage03,
  "4th-blog-webp": blogImage04,
  "5th-blog-webp": blogImage05,
  "6th-blog-webp": blogImage06,
  "7th-blog-webp": blogImage07,
};

function toRouteSlug(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function getBlogRouteSlug(blog: Blog | undefined | null): string {
  if (!blog) return "";
  return toRouteSlug(blog.slug);
}

export function getAllBlogs(): Blog[] {
  return [...blogs];
}

export function getBlogsByTitleQuery(query: string): Blog[] {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return getAllBlogs();

  return blogs.filter((blog) =>
    blog.title.toLowerCase().includes(normalizedQuery)
  );
}

export function getAllBlogSlugs(): string[] {
  return blogs.map((blog) => getBlogRouteSlug(blog));
}

export function getBlogBySlug(slug: string): Blog | undefined {
  const normalizedSlug = toRouteSlug(slug);
  return blogs.find((blog) => {
    const routeSlug = getBlogRouteSlug(blog);
    return routeSlug === slug || toRouteSlug(routeSlug) === normalizedSlug;
  });
}

export function getPopularBlogs(limit = 4): Blog[] {
  return blogs.slice(0, limit);
}

export function getBlogImageSrc(blog: Blog | undefined | null): string | StaticImageData {
  if (!blog) return "/img/blog-bg.png";
  return blogImageAssets[blog.image] ?? "/img/blog-bg.png";
}
