import { craftGraphqlFetch } from "@/lib/graphqlClient";
import { normalizeEntries, type CraftEntriesPayload } from "@/lib/graphql/entries";
import { config } from "@/lib/config";
import type { Comment, CommentStatus, CreateCommentInput } from "@/domain/comment/comment.types";

const { sections, commentsEntryType, saveCommentMutation } = config.craft;

type CraftCommentEntry = {
  id: string;
  title?: string;
  dateCreated: string | null;
  authorName?: string;
  authorEmail?: string;
  commentBody?: string;
  commentStatus?: string;
  article?: Array<{ id: string; slug?: string }> | { id: string; slug?: string };
};

const COMMENT_RESPONSE_FIELDS = `
        id
        dateCreated
        ... on ${commentsEntryType} {
          authorName
          authorEmail
          commentBody
          commentStatus
          article { id slug }
        }
`;

const COMMENTS_BY_ARTICLE_QUERY = `
  query CommentsByArticle($relatedTo: [QueryArgument], $limit: Int!) {
    entries(section: "${sections.comments}", relatedTo: $relatedTo, limit: $limit, orderBy: "dateCreated DESC") {
      id
      title
      dateCreated
      ... on ${commentsEntryType} {
        authorName
        authorEmail
        commentBody
        commentStatus
        article {
          id
          slug
        }
      }
    }
  }
`;

const PENDING_COMMENTS_QUERY = `
  query PendingComments($limit: Int!) {
    entries(section: "${sections.comments}", limit: $limit, orderBy: "dateCreated DESC") {
      id
      title
      dateCreated
      ... on ${commentsEntryType} {
        authorName
        authorEmail
        commentBody
        commentStatus
        article {
          id
          slug
          title
        }
      }
    }
  }
`;

function parseStatus(s: string | undefined): CommentStatus {
  if (s === "approved" || s === "rejected" || s === "pending") return s;
  return "pending";
}

function toComment(e: CraftCommentEntry): Comment {
  const article = Array.isArray(e.article) ? e.article[0] : e.article;
  return {
    id: e.id,
    articleId: article?.id ?? "",
    articleSlug: article?.slug,
    authorName: e.authorName ?? "",
    authorEmail: e.authorEmail ?? "",
    body: e.commentBody ?? "",
    status: parseStatus(e.commentStatus),
    createdAt: e.dateCreated ?? null,
  };
}

export async function fetchCommentsByArticle(
  articleId: string,
  limit: number = 50
): Promise<Comment[]> {
  const data = await craftGraphqlFetch<CraftEntriesPayload<CraftCommentEntry>>({
    query: COMMENTS_BY_ARTICLE_QUERY,
    variables: { relatedTo: [articleId], limit },
  });
  const entries = normalizeEntries<CraftCommentEntry>(data);
  return entries
    .map(toComment)
    .filter((c) => c.status === "approved");
}

export async function fetchPendingComments(limit: number = 100): Promise<Comment[]> {
  const data = await craftGraphqlFetch<CraftEntriesPayload<CraftCommentEntry>>({
    query: PENDING_COMMENTS_QUERY,
    variables: { limit },
  });
  const entries = normalizeEntries<CraftCommentEntry>(data);
  return entries
    .filter((e) => parseStatus(e.commentStatus) === "pending")
    .map(toComment);
}

function getSavedEntry<T extends CraftCommentEntry>(
  res: unknown,
  mutationName: string
): T | null {
  if (res == null || typeof res !== "object") return null;
  const byKey = (res as Record<string, unknown>)[mutationName];
  if (byKey != null && typeof byKey === "object" && "id" in byKey)
    return byKey as T;
  const found = Object.values(res as object).find(
    (v): v is T =>
      v != null &&
      typeof v === "object" &&
      "id" in v &&
      ("dateCreated" in v || "commentBody" in v)
  );
  return found ?? null;
}

function throwCommentSaveError(res: unknown, mutationName: string): never {
  const { isDev } = config.env;
  const keys = typeof res === "object" && res !== null ? Object.keys(res).join(", ") || "(aucune)" : "(aucune)";
  const msg = isDev
    ? `Craft n'a pas renvoyé de commentaire. Mutation utilisée: "${mutationName}". Clés reçues: ${keys}. Si la clé diffère, définir CRAFT_SAVE_COMMENT_MUTATION.`
    : "Le commentaire n'a pas pu être enregistré.";
  if (isDev) console.error("[createComment] res =", JSON.stringify(res, null, 2));
  throw new Error(msg);
}

export async function createComment(input: CreateCommentInput): Promise<Comment> {
  const title = `Comment by ${input.authorName}`.slice(0, 255);
  const query = `
    mutation CreateComment(
      $title: String,
      $authorId: ID,
      $article: [Int],
      $authorName: String,
      $authorEmail: String,
      $commentBody: String,
      $commentStatus: String
    ) {
      ${saveCommentMutation}(
        title: $title,
        authorId: $authorId,
        article: $article,
        authorName: $authorName,
        authorEmail: $authorEmail,
        commentBody: $commentBody,
        commentStatus: $commentStatus
      ) {
${COMMENT_RESPONSE_FIELDS}
      }
    }
  `;
  type SavePayload = { [key: string]: CraftCommentEntry | null };
  const res = await craftGraphqlFetch<SavePayload>({
    query,
    variables: {
      title,
      authorId: input.craftAuthorId ?? null,
      article: [parseInt(input.articleId, 10)],
      authorName: input.authorName,
      authorEmail: input.authorEmail,
      commentBody: input.body,
      commentStatus: "pending",
    },
  });
  const saved = getSavedEntry<CraftCommentEntry>(res, saveCommentMutation);
  if (!saved) throwCommentSaveError(res, saveCommentMutation);
  return toComment(saved);
}

export async function updateCommentStatus(
  id: string,
  status: CommentStatus
): Promise<Comment | null> {
  const query = `
    mutation UpdateCommentStatus($id: ID, $commentStatus: String) {
      ${saveCommentMutation}(id: $id, commentStatus: $commentStatus) {
${COMMENT_RESPONSE_FIELDS}
      }
    }
  `;
  type SavePayload = { [key: string]: CraftCommentEntry | null };
  const res = await craftGraphqlFetch<SavePayload>({
    query,
    variables: { id, commentStatus: status },
  });
  const saved = getSavedEntry<CraftCommentEntry>(res, saveCommentMutation);
  return saved ? toComment(saved) : null;
}
