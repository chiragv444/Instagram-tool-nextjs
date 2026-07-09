import blogsData from "@/data/blogs.json";

export type Blog = {
  blog_id: string;
  slug: string;
  title: string;
  description: string;
  date: string;
  image: string;
  content: string;
};

const blogs = blogsData as Blog[];

export function getAllBlogs(): Blog[] {
  return [...blogs];
}

export function getAllBlogSlugs(): string[] {
  return blogs.map((blog) => blog.slug);
}

export function getBlogBySlug(slug: string): Blog | undefined {
  return blogs.find((blog) => blog.slug === slug);
}

export function getPopularBlogs(limit = 4): Blog[] {
  return blogs.slice(0, limit);
}
