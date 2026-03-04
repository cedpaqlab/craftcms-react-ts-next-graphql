import {
  listCommentsForArticleUseCase,
  submitCommentUseCase,
  listPendingForModerationUseCase,
  setCommentStatusUseCase,
} from "@/domain/comment/comment.useCases";
import type { CommentStatus, CreateCommentInput } from "@/domain/comment/comment.types";

/* Appelé par: pages/composants blog (route).
   Appelle: listCommentsForArticleUseCase (use case). */
export async function listCommentsForArticle(articleId: string) {
  return listCommentsForArticleUseCase(articleId);
}

/* Appelé par: submitCommentAction (route, actions.ts).
   Appelle: submitCommentUseCase (use case). */
export async function submitComment(input: CreateCommentInput) {
  return submitCommentUseCase(input);
}

/* Appelé par: page dashboard/moderation (route).
   Appelle: listPendingForModerationUseCase (use case). */
export async function listPendingForModeration(limit: number = 100) {
  return listPendingForModerationUseCase(limit);
}

/* Appelé par: setCommentStatusAction (route, dashboard).
   Appelle: setCommentStatusUseCase (use case). */
export async function setCommentStatus(id: string, status: CommentStatus) {
  return setCommentStatusUseCase(id, status);
}
