import type { CreateCommentFormInput } from "@/domain/comment/comment.types";

/* Appelé par: parseCommentFormData (local).
   Appelle: — */
const trim = (v: FormDataEntryValue | null): string =>
  String(v ?? "").trim();

/* Appelé par: submitCommentAction (route, actions.ts).
   Appelle: trim (local). */
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
