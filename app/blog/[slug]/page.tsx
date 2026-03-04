import { notFound } from "next/navigation";
import Link from "next/link";
import { formatDateFr } from "@/lib/helpers";
import { sanitizeBody } from "@/lib/sanitize";
import { getArticleForPublicPage } from "@/services/articleService";
import { listCommentsForArticle } from "@/services/commentService";
import { CommentList } from "@/components/blog/CommentList";
import { CommentForm } from "@/components/blog/CommentForm";

const COMMENT_ERROR_FALLBACK = "Le commentaire n'a pas pu être enregistré. Réessaie.";

function decodeErrorMsg(encoded: string): string {
  try {
    return decodeURIComponent(encoded);
  } catch {
    return COMMENT_ERROR_FALLBACK;
  }
}

const REVALIDATE_SECONDS = 60;

export const revalidate = REVALIDATE_SECONDS;

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ comment?: string; reason?: string; msg?: string }>;
};

export default async function ArticlePage({ params, searchParams }: Props) {
  const { slug } = await params;
  const article = await getArticleForPublicPage(slug);

  if (!article) {
    notFound();
  }

  const comments = await listCommentsForArticle(article.id);
  const { comment: commentStatus, reason, msg } = await searchParams;
  const commentErrorText =
    reason === "missing"
      ? "Tous les champs sont requis."
      : msg
        ? decodeErrorMsg(msg)
        : COMMENT_ERROR_FALLBACK;

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

      <section className="article-detail__comments" aria-labelledby="comments-title">
        <h2 id="comments-title" className="article-detail__comments-title">
          Commentaires
        </h2>
        {commentStatus === "ok" && (
          <p className="comment-form__flash comment-form__flash--ok" role="status">
            Commentaire enregistré. Il sera visible après modération.
          </p>
        )}
        {commentStatus === "error" && (
          <p className="comment-form__flash comment-form__flash--error" role="alert">
            {commentErrorText}
          </p>
        )}
        <CommentList comments={comments} />
        <CommentForm articleId={article.id} articleSlug={slug} />
      </section>

      <footer className="article-detail__footer">
        <Link href="/blog" className="article-detail__back">
          Retour au blog
        </Link>
      </footer>
    </article>
  );
}
