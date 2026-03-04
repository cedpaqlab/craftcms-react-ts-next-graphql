import {
  listArticlesUseCase,
  getArticleUseCase,
} from "@/domain/article/article.useCases";

/* Appelé par: page blog, ArticleList (route).
   Appelle: listArticlesUseCase (use case). */
export async function listArticlesForPublicPage(page: number = 1) {
  return listArticlesUseCase(page);
}

/* Appelé par: page blog/[slug] (route).
   Appelle: getArticleUseCase (use case). */
export async function getArticleForPublicPage(slug: string) {
  return getArticleUseCase(slug);
}
