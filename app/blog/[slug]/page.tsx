import { notFound } from "next/navigation";
import Link from "next/link";
import { formatDateFr } from "@/lib/helpers";
import { sanitizeBody } from "@/lib/sanitize";
import { getArticleForPublicPage } from "@/services/articleService";

const REVALIDATE_SECONDS = 60;

export const revalidate = REVALIDATE_SECONDS;

type Props = { params: Promise<{ slug: string }> };

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = await getArticleForPublicPage(slug);

  if (!article) {
    notFound();
  }

  return (
    <article className="article-detail">
      <nav className="article-detail__breadcrumb" aria-label="Fil d'Ariane">
        <Link href="/blog">Blog</Link>
        <span className="article-detail__breadcrumb-sep" aria-hidden> / </span>
        <span className="article-detail__breadcrumb-current">{article.title}</span>
      </nav>
      <header className="article-detail__header">
        <h1 className="article-detail__title">{article.title}</h1>
        {article.publishedAt && (
          <p className="article-detail__meta">
            <time dateTime={article.publishedAt}>
              {formatDateFr(article.publishedAt)}
            </time>
          </p>
        )}
      </header>
      {article.excerpt && (
        <p className="article-detail__excerpt">{article.excerpt}</p>
      )}
      {article.body && (
        <div
          className="article-body"
          dangerouslySetInnerHTML={{ __html: sanitizeBody(article.body) }}
        />
      )}
      <footer className="article-detail__footer">
        <Link href="/blog" className="article-detail__back">
          Retour au blog
        </Link>
      </footer>
    </article>
  );
}
