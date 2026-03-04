export type CommentStatus = "pending" | "approved" | "rejected";

export type Comment = {
  id: string;
  articleId: string;
  articleSlug?: string;
  authorName: string;
  authorEmail: string;
  body: string;
  status: CommentStatus;
  createdAt: string | null;
};

export type CreateCommentInput = {
  articleId: string;
  authorName: string;
  authorEmail: string;
  body: string;
  /** Optionnel : si connecté (team/entreprise), ID Craft de la session. Sinon commentaire public sans auteur Craft. */
  craftAuthorId?: string;
};

/** Champs fournis par le formulaire (craftAuthorId injecté côté serveur si connecté). */
export type CreateCommentFormInput = Omit<CreateCommentInput, "craftAuthorId">;
