import DOMPurify from "isomorphic-dompurify";

const ALLOWED_TAGS = ["p", "h2", "h3", "ul", "ol", "li", "a", "blockquote", "code", "pre", "strong", "em", "b", "i", "br"];
const ALLOWED_ATTR = ["href", "target", "rel"];

/* Appelé par: page blog/[slug], CommentList (route/composant).
   Appelle: DOMPurify.sanitize (lib). */
export function sanitizeBody(html: string): string {
  return DOMPurify.sanitize(html, { ALLOWED_TAGS, ALLOWED_ATTR });
}
