import Link from "next/link";
import { listArticlesForPublicPage } from "@/services/articleService";
import { ArticleList } from "@/components/blog/ArticleList";

const REVALIDATE_SECONDS = 60;

export const revalidate = REVALIDATE_SECONDS;

export default async function BlogPage() {
  const { items, hasMore } = await listArticlesForPublicPage(1);

  return (
    <section className="blog-page">
      <h1>Blog</h1>
      {items.length > 0 ? (
        <>
          <ArticleList items={items} />
          <nav className="blog-pagination" aria-label="Pagination du blog">
            {hasMore && (
              <Link href="/blog?page=2">Page suivante</Link>
            )}
          </nav>
        </>
      ) : (
        <p className="blog-empty">Aucun article pour le moment.</p>
      )}
    </section>
  );
}
