import type { Asset, Reference, Slug } from "@sanity/types";
import { loadQuery } from "./load-query";

// Linked from the sidebar as a PDF, so it stays out of every post listing
export const RESUME_SLUG = "resume";

export async function getPosts(): Promise<Post[]> {
  const { data: posts } = await loadQuery<Array<Post>>({
    query: `*[_type == "post" && defined(slug.current)] | order(_createdAt desc)`,
  });
  return posts;
}

export async function getPost(slug: string): Promise<Post> {
  const { data: post } = await loadQuery<Post>({
    query: `*[_type == "post" && defined(slug.current) && slug.current == $slug][0]{
      ...,
      "typstFiles": typstFiles[]{ "name": asset->originalFilename, "url": asset->url }
    }`,
    params: {
      slug,
    },
  });

  if (!post) {
    throw new Error(`Document not found: \`post\` with slug ${slug}`);
  }

  return post;
}

export async function getCategories(): Promise<Category[]> {
  const { data: categories } = await loadQuery<Category[]>({
    query: `*[_type == "category" && defined(slug.current)] | order(slug.current desc)`,
  });
  return categories;
}

export async function getReference<T>({
  type,
  ref,
}: {
  type: string;
  ref: string;
}): Promise<T> {
  const { data } = await loadQuery<T | null>({
    query: `*[_type == $type && _id == $ref][0]`,
    params: { type, ref },
  });

  if (!data) {
    throw new Error(`Document not found: ${type} with id ${ref}`);
  }

  return data;
}

export async function getPostsInCategory(id: string): Promise<Post[]> {
  const { data } = await loadQuery<Post[]>({
    query: `*[_type == "post" && defined(slug.current) && slug.current != $resume && references($id)] | order(date desc)`,
    params: { id, resume: RESUME_SLUG },
  });
  return data;
}

export async function getCategory(slug: string): Promise<Category | null> {
  const { data } = await loadQuery<Category | null>({
    query: `*[_type == "category" && slug.current == $slug][0]`,
    params: { slug },
  });
  return data;
}

// Sidebar list: only categories that have posts.
export async function getNavCategories(): Promise<Category[]> {
  const { data } = await loadQuery<Category[]>({
    query: `*[_type == "category" && defined(slug.current) && count(*[_type == "post" && slug.current != $resume && references(^._id)]) > 0] | order(title asc)`,
    params: { resume: RESUME_SLUG },
  });
  return data;
}

// Falls back to the newest posts until something is marked featured.
export async function getHighlights(): Promise<Post[]> {
  const { data } = await loadQuery<Post[]>({
    query: `*[_type == "post" && defined(slug.current) && featured == true] | order(date desc)`,
  });
  if (data.length) return data;
  const { data: newest } = await loadQuery<Post[]>({
    query: `*[_type == "post" && defined(slug.current) && slug.current != $resume] | order(date desc)[0...3]`,
    params: { resume: RESUME_SLUG },
  });
  return newest;
}

export type Category = {
  _id: string;
  title: string;
  slug: Slug;
  icon: Icon;
};

export interface Photo extends Asset {
  _type: "captionedImage";
  title?: string;
  description?: string;
  preview?: boolean;
}

export interface Icon {
  _type: "icon.manager";
  icon: string;
  metadata: {
    inlineSvg: string;
  };
}

export interface Video {
  _type: "bunnyVideo";
  videoId: string;
  title: string;
  description: string;
  width: number;
  height: number;
  preview?: boolean;
}

export type Gallery = Array<Photo | Video>;

export interface Post {
  _id: string;
  _type: "post";
  _createdAt: string;
  tags: Reference[];
  icon?: Icon;
  featured?: boolean;
  links?: string[];
  gallery?: Gallery;
  date: string;
  title?: string;
  slug: Slug;
  excerpt?: string;
  format?: "markdown" | "typst";
  body?: string;
  typst?: string;
  typstFiles?: { name: string; url: string }[];
  // Unset means true, so typst posts made before the field existed still get the button
  pdf?: boolean;
}
