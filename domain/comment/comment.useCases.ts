import {
  fetchCommentsByArticle,
  fetchPendingComments,
  createComment,
  updateCommentStatus,
} from "@/repositories/commentRepository";
import type { Comment, CommentStatus, CreateCommentInput } from "./comment.types";

/* Appelé par: listCommentsForArticle (service).
   Appelle: fetchCommentsByArticle (repository). */
export async function listCommentsForArticleUseCase(
  articleId: string,
  limit: number = 50
): Promise<Comment[]> {
  return fetchCommentsByArticle(articleId, limit);
}

/* Appelé par: submitComment (service).
   Appelle: createComment (repository). */
export async function submitCommentUseCase(input: CreateCommentInput): Promise<Comment> {
  return createComment(input);
}

/* Appelé par: listPendingForModeration (service).
   Appelle: fetchPendingComments (repository). */
export async function listPendingForModerationUseCase(
  limit: number = 100
): Promise<Comment[]> {
  return fetchPendingComments(limit);
}

/* Appelé par: setCommentStatus (service).
   Appelle: updateCommentStatus (repository). */
export async function setCommentStatusUseCase(
  id: string,
  status: CommentStatus
): Promise<Comment | null> {
  return updateCommentStatus(id, status);
}
