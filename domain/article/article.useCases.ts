import { fetchArticles, fetchArticleBySlug } from "@/repositories/articleRepository";
import type { Article } from "./article.types";

const DEFAULT_PER_PAGE = 10;

/* Appelé par: listArticlesForPublicPage (service).
   Appelle: fetchArticles (repository). */
export async function listArticlesUseCase(
  page: number = 1
): Promise<{ items: Article[]; hasMore: boolean }> {
  return fetchArticles(page, DEFAULT_PER_PAGE);
}

/* Appelé par: getArticleForPublicPage (service).
   Appelle: fetchArticleBySlug (repository). */
export async function getArticleUseCase(slug: string): Promise<Article | null> {
  return fetchArticleBySlug(slug);
}
