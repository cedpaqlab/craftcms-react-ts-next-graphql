import { ArticleCard } from "./ArticleCard";
import type { Article } from "@/domain/article/article.types";

type Props = { items: Article[] };

export function ArticleList({ items }: Props) {
  return (
    <section className="article-list" aria-label="Liste des articles">
      {items.map((article) => (
        <ArticleCard key={article.id} article={article} />
      ))}
    </section>
  );
}
