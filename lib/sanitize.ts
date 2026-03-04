import DOMPurify from "isomorphic-dompurify";

const ALLOWED_TAGS = ["p", "h2", "h3", "ul", "ol", "li", "a", "blockquote", "code", "pre", "strong", "em", "b", "i", "br"];
const ALLOWED_ATTR = ["href", "target", "rel"];

export function sanitizeBody(html: string): string {
  return DOMPurify.sanitize(html, { ALLOWED_TAGS, ALLOWED_ATTR });
}
