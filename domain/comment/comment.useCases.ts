import {
  fetchCommentsByArticle,
  fetchPendingComments,
  createComment,
  updateCommentStatus,
} from "@/repositories/commentRepository";
import type { Comment, CommentStatus, CreateCommentInput } from "./comment.types";

export async function listCommentsForArticleUseCase(
  articleId: string,
  limit: number = 50
): Promise<Comment[]> {
  return fetchCommentsByArticle(articleId, limit);
}

export async function submitCommentUseCase(input: CreateCommentInput): Promise<Comment> {
  return createComment(input);
}

export async function listPendingForModerationUseCase(
  limit: number = 100
): Promise<Comment[]> {
  return fetchPendingComments(limit);
}

export async function setCommentStatusUseCase(
  id: string,
  status: CommentStatus
): Promise<Comment | null> {
  return updateCommentStatus(id, status);
}
