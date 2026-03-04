import { craftGraphqlFetch } from "@/lib/graphqlClient";
import type { Article } from "@/domain/article/article.types";

type CraftEntry = {
  id: string;
  title: string;
  slug: string;
  postDate: string | null;
  excerpt?: string;
  body?: string;
};

type CraftEntriesPayload = { entries?: CraftEntry[] };

const ARTICLES_LIST_QUERY = `
  query ArticlesList($limit: Int!, $offset: Int!) {
    entries(section: "articles", limit: $limit, offset: $offset, orderBy: "postDate DESC") {
      id
      title
      slug
      postDate
    }
  }
`;

const CRAFT_ARTICLES_ENTRY_TYPE =
  process.env.CRAFT_ARTICLES_ENTRY_TYPE ?? "article_Entry";

const ARTICLE_BY_SLUG_QUERY = `
  query ArticleBySlug($slug: [String]) {
    entries(section: "articles", slug: $slug, limit: 1) {
      id
      title
      slug
      postDate
      ... on ${CRAFT_ARTICLES_ENTRY_TYPE} {
        excerpt
        body
      }
    }
  }
`;

function toArticle(e: CraftEntry): Article {
  return {
    id: e.id,
    slug: e.slug,
    title: e.title,
    excerpt: e.excerpt ?? "",
    body: e.body,
    publishedAt: e.postDate ?? null,
  };
}

function normalizeEntries(data: CraftEntriesPayload | unknown): CraftEntry[] {
  if (Array.isArray(data)) return [];
  if (data && typeof data === "object" && "entries" in data) {
    const entries = (data as CraftEntriesPayload).entries;
    return Array.isArray(entries) ? entries : [];
  }
  return [];
}

export async function fetchArticles(
  page: number,
  perPage: number
): Promise<{ items: Article[]; hasMore: boolean }> {
  const offset = (page - 1) * perPage;
  const limit = perPage + 1;

  const data = await craftGraphqlFetch<CraftEntriesPayload>({
    query: ARTICLES_LIST_QUERY,
    variables: { limit, offset },
  });

  const entries = normalizeEntries(data);
  const items = entries.slice(0, perPage).map(toArticle);
  const hasMore = entries.length > perPage;

  return { items, hasMore };
}

export async function fetchArticleBySlug(slug: string): Promise<Article | null> {
  const data = await craftGraphqlFetch<CraftEntriesPayload>({
    query: ARTICLE_BY_SLUG_QUERY,
    variables: { slug: [slug] },
  });

  const entries = normalizeEntries(data);
  const entry = entries[0];
  return entry ? toArticle(entry) : null;
}
