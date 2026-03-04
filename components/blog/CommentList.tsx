import { formatDateFr } from "@/lib/helpers";
import { sanitizeBody } from "@/lib/sanitize";
import type { Comment } from "@/domain/comment/comment.types";

type Props = { comments: Comment[] };

export function CommentList({ comments }: Props) {
  if (comments.length === 0) {
    return (
      <p className="comment-list__empty" aria-live="polite">
        Aucun commentaire pour le moment.
      </p>
    );
  }
  return (
    <ol className="comment-list" aria-label="Commentaires">
      {comments.map((c) => (
        <li key={c.id} className="comment-card">
          <header className="comment-card__meta">
            <span className="comment-card__author">{c.authorName}</span>
            {c.createdAt && (
              <time dateTime={c.createdAt} className="comment-card__date">
                {formatDateFr(c.createdAt)}
              </time>
            )}
          </header>
          <div
            className="comment-card__body"
            dangerouslySetInnerHTML={{ __html: sanitizeBody(c.body) }}
          />
        </li>
      ))}
    </ol>
  );
}
