import { craftGraphqlFetch } from "@/lib/graphqlClient";
import { normalizeEntries, type CraftEntriesPayload } from "@/lib/graphql/entries";
import { config } from "@/lib/config";
import type { Article } from "@/domain/article/article.types";

type CraftEntry = {
  id: string;
  title: string;
  slug: string;
  postDate: string | null;
  excerpt?: string;
  body?: string;
};

const { sections, articlesEntryType } = config.craft;

const ARTICLES_LIST_QUERY = `
  query ArticlesList($limit: Int!, $offset: Int!) {
    entries(section: "${sections.articles}", limit: $limit, offset: $offset, orderBy: "postDate DESC") {
      id
      title
      slug
      postDate
    }
  }
`;

const ARTICLE_BY_SLUG_QUERY = `
  query ArticleBySlug($slug: [String]) {
    entries(section: "${sections.articles}", slug: $slug, limit: 1) {
      id
      title
      slug
      postDate
      ... on ${articlesEntryType} {
        excerpt
        body
      }
    }
  }
`;

/* Appelé par: fetchArticles, fetchArticleBySlug (repository).
   Appelle: —.
   Plus d'info: mappe entrée Craft vers type domaine Article. */
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

/* Appelé par: listArticlesUseCase (use case).
   Appelle: craftGraphqlFetch (lib), normalizeEntries (lib), toArticle (local). */
export async function fetchArticles(
  page: number,
  perPage: number
): Promise<{ items: Article[]; hasMore: boolean }> {
  const offset = (page - 1) * perPage;
  const limit = perPage + 1;

  const data = await craftGraphqlFetch<CraftEntriesPayload<CraftEntry>>({
    query: ARTICLES_LIST_QUERY,
    variables: { limit, offset },
  });

  const entries = normalizeEntries<CraftEntry>(data);
  const items = entries.slice(0, perPage).map(toArticle);
  const hasMore = entries.length > perPage;

  return { items, hasMore };
}

/* Appelé par: getArticleUseCase (use case).
   Appelle: craftGraphqlFetch (lib), normalizeEntries (lib), toArticle (local). */
export async function fetchArticleBySlug(slug: string): Promise<Article | null> {
  const data = await craftGraphqlFetch<CraftEntriesPayload<CraftEntry>>({
    query: ARTICLE_BY_SLUG_QUERY,
    variables: { slug: [slug] },
  });

  const entries = normalizeEntries<CraftEntry>(data);
  const entry = entries[0];
  return entry ? toArticle(entry) : null;
}
