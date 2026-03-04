export type Article = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body?: string;
  publishedAt: string | null;
};
