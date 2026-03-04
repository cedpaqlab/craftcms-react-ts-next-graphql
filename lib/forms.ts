import type { CreateCommentFormInput } from "@/domain/comment/comment.types";

const trim = (v: FormDataEntryValue | null): string =>
  String(v ?? "").trim();

/**
 * Parse FormData du formulaire commentaire. craftAuthorId est injecté côté action (session).
 */
export function parseCommentFormData(formData: FormData): {
  input: CreateCommentFormInput;
  articleSlug: string;
} {
  return {
    input: {
      articleId: trim(formData.get("articleId")),
      authorName: trim(formData.get("authorName")),
      authorEmail: trim(formData.get("authorEmail")),
      body: trim(formData.get("body")),
    },
    articleSlug: trim(formData.get("articleSlug")),
  };
}
