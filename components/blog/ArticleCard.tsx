import Link from "next/link";
import { formatDateFr } from "@/lib/helpers";
import type { Article } from "@/domain/article/article.types";

type Props = { article: Article };

export function ArticleCard({ article }: Props) {
  return (
    <article className="article-card">
      <h4>
        <Link href={`/blog/${article.slug}`}>{article.title}</Link>
      </h4>
      {article.excerpt && <p>{article.excerpt}</p>}
      {article.publishedAt && (
        <time dateTime={article.publishedAt}>
          {formatDateFr(article.publishedAt)}
        </time>
      )}
    </article>
  );
}
