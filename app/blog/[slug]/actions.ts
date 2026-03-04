"use server";

import { redirect } from "next/navigation";
import { submitComment } from "@/services/commentService";
import { parseCommentFormData } from "@/lib/forms";
import { config } from "@/lib/config";
import { getAuthToken } from "@/lib/helpers";
import { validateToken } from "@/services/authService";

/* Appelé par: page blog/[slug] (route, formulaire commentaire).
   Appelle: parseCommentFormData (lib), getAuthToken (lib), validateToken (service), submitComment (service), config (lib), redirect (Next). */
export async function submitCommentAction(formData: FormData) {
  const { input: parsed, articleSlug } = parseCommentFormData(formData);
  const baseSlug = articleSlug || "blog";

  if (!parsed.articleId || !parsed.authorName || !parsed.authorEmail || !parsed.body) {
    redirect(`/blog/${baseSlug}?comment=error&reason=missing`);
  }

  const token = getAuthToken();
  const claims = token ? validateToken(token) : null;
  const input = {
    ...parsed,
    ...(claims?.craftUserId && { craftAuthorId: claims.craftUserId }),
  };

  let targetUrl: string;
  try {
    await submitComment(input);
    targetUrl = `/blog/${baseSlug}?comment=ok`;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (config.env.isDev) console.error("[submitCommentAction]", err);
    const base = `/blog/${baseSlug}?comment=error`;
    targetUrl = message
      ? `${base}&msg=${encodeURIComponent(message.slice(0, 300))}`
      : base;
  }
  redirect(targetUrl);
}
