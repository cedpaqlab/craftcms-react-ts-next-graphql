import {
  listArticlesUseCase,
  getArticleUseCase,
} from "@/domain/article/article.useCases";

export async function listArticlesForPublicPage(page: number = 1) {
  return listArticlesUseCase(page);
}

export async function getArticleForPublicPage(slug: string) {
  return getArticleUseCase(slug);
}
