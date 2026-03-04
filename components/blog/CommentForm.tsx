import { submitCommentAction } from "@/app/blog/[slug]/actions";

type Props = { articleId: string; articleSlug: string };

export function CommentForm({ articleId, articleSlug }: Props) {
  return (
    <form action={submitCommentAction} className="comment-form" noValidate>
      <input type="hidden" name="articleId" value={articleId} />
      <input type="hidden" name="articleSlug" value={articleSlug} />
      <div className="comment-form__field">
        <label htmlFor="comment-authorName">Nom</label>
        <input
          id="comment-authorName"
          name="authorName"
          type="text"
          required
          maxLength={255}
          autoComplete="name"
          className="comment-form__input"
        />
      </div>
      <div className="comment-form__field">
        <label htmlFor="comment-authorEmail">Email</label>
        <input
          id="comment-authorEmail"
          name="authorEmail"
          type="email"
          required
          autoComplete="email"
          className="comment-form__input"
        />
      </div>
      <div className="comment-form__field">
        <label htmlFor="comment-body">Commentaire</label>
        <textarea
          id="comment-body"
          name="body"
          required
          rows={4}
          className="comment-form__input comment-form__textarea"
        />
      </div>
      <button type="submit" className="comment-form__submit">
        Envoyer
      </button>
    </form>
  );
}
