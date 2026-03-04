import {
  listCommentsForArticleUseCase,
  submitCommentUseCase,
  listPendingForModerationUseCase,
  setCommentStatusUseCase,
} from "@/domain/comment/comment.useCases";
import type { CommentStatus, CreateCommentInput } from "@/domain/comment/comment.types";

export async function listCommentsForArticle(articleId: string) {
  return listCommentsForArticleUseCase(articleId);
}

export async function submitComment(input: CreateCommentInput) {
  return submitCommentUseCase(input);
}

export async function listPendingForModeration(limit: number = 100) {
  return listPendingForModerationUseCase(limit);
}

export async function setCommentStatus(id: string, status: CommentStatus) {
  return setCommentStatusUseCase(id, status);
}
