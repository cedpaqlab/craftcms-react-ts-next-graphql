import Link from "next/link";
import { listArticlesForPublicPage } from "@/services/articleService";
import { ArticleCard } from "@/components/blog/ArticleCard";

const STACK_ITEMS = [
  {
    title: "Craft CMS",
    description: "CMS headless, contenu géré dans l'admin, exposé en GraphQL.",
  },
  {
    title: "Next.js",
    description: "App Router, SSR / ISR, API routes, middleware.",
  },
  {
    title: "GraphQL",
    description: "Requêtes typées, fragments, pagination côté Craft.",
  },
  {
    title: "TypeScript",
    description: "Typage strict, domain / services / repositories.",
  },
];

export default async function HomePage() {
  const { items } = await listArticlesForPublicPage(1);
  const latestArticle = items[0];

  return (
    <>
      <section className="hero">
        <h2 className="hero__title">Next.js + Craft CMS headless</h2>
        <p className="hero__subtitle">
          Projet démo fullstack pour formation : contenu dans Craft, front moderne en Next.js, architecture scalable.
        </p>
        <Link href="/blog" className="hero__cta">
          Voir le blog
        </Link>
      </section>

      <section className="stack" aria-label="Stack technique">
        {STACK_ITEMS.map((item) => (
          <div key={item.title} className="stack__card">
            <h3>{item.title}</h3>
            <p>{item.description}</p>
          </div>
        ))}
      </section>

      <section className="home-latest-blog" aria-label="Dernier article de blog">
        <h2 className="home-latest-blog__title">Dernier article de blog</h2>
        {latestArticle ? (
          <ArticleCard article={latestArticle} />
        ) : (
          <p className="home-latest-blog__empty">Aucun article pour le moment.</p>
        )}
        <Link href="/blog" className="home-latest-blog__link">
          Tous les articles
        </Link>
      </section>

    </>
  );
}
