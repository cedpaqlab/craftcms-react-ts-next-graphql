import Link from "next/link";

export const metadata = {
  title: "Projet et qualité | Headless Demo",
  description: "Stack, architecture et objectifs qualité atteints.",
};

export default function ProjetPage() {
  return (
    <article className="projet" aria-labelledby="projet-title">
      <h1 id="projet-title" className="projet__title">
        Projet et objectifs qualité
      </h1>
      <p className="projet__intro">
        Mis en place : stack, structure, décisions techniques.
      </p>

      <section className="projet__section" aria-labelledby="stack-title">
        <h2 id="stack-title">Stack</h2>
        <ul className="projet__list">
          <li><strong>Next.js 14</strong> – App Router, Server Components, ISR, API routes, middleware (Edge).</li>
          <li><strong>Craft CMS</strong> – Headless, contenu exposé en GraphQL (section Articles, schéma + token).</li>
          <li><strong>GraphQL</strong> – Client dédié (<code>lib/graphqlClient.ts</code>), requêtes typées, fragments par type d’entrée.</li>
          <li><strong>TypeScript</strong> – Typage strict, types domaine (Article, User), pas de <code>any</code>.</li>
          <li><strong>Auth</strong> – JWT (jsonwebtoken + jose en Edge), cookie httpOnly, vérification middleware + SSR dashboard.</li>
          <li><strong>CSS</strong> – Natif, grid, variables globales, pas de framework.</li>
        </ul>
      </section>

      <section className="projet__section" aria-labelledby="archi-title">
        <h2 id="archi-title">Architecture</h2>
        <p>
          Séparation en couches pour maintenabilité et testabilité :
        </p>
        <dl className="projet__dl">
          <dt>domain/</dt>
          <dd>Types métier (<code>article.types.ts</code>, <code>user.types.ts</code>) et use cases (<code>article.useCases.ts</code>). Pas d’I/O, logique pure.</dd>
          <dt>repositories/</dt>
          <dd>Accès données. Appels GraphQL, normalisation des réponses Craft, mapping vers les types domaine. Une source de vérité pour les requêtes.</dd>
          <dt>services/</dt>
          <dd>Façade pour l’app. <code>articleService</code> délègue aux use cases ; <code>authService</code> gère auth et JWT. Pas de logique GraphQL dans les pages.</dd>
          <dt>lib/</dt>
          <dd>Config, client GraphQL, auth (jwt, cookies), helpers centralisés, sanitization.</dd>
          <dt>components/</dt>
          <dd>Composants réutilisables (ArticleCard, ArticleList, LoginForm, etc.).</dd>
        </dl>
        <p>
          Flux de données : <strong>Page → Service → Use case → Repository → GraphQL</strong>. Les pages ne connaissent pas Craft ni le détail des requêtes.
        </p>
      </section>

      <section className="projet__section" aria-labelledby="entrevue-title">
        <h2 id="entrevue-title">À noter</h2>
        <ul className="projet__list">
          <li>Architecture en couches (domain / services / repositories) et flux de données sans fuite de responsabilités.</li>
          <li>Auth : JWT en cookie httpOnly, vérification en Edge (middleware) et en SSR (dashboard), suppression du cookie si token invalide.</li>
          <li>Sanitization systématique du HTML issu du CMS avant affichage (DOMPurify, liste de tags autorisés) en plus des contrôles côté Craft.</li>
          <li>Config : validation en production pour les secrets, une seule source de vérité (middleware et app utilisent <code>config</code>).</li>
          <li>ISR pour le blog, revalidation via webhook Craft ; BFF pour centraliser les appels GraphQL et les en-têtes cache.</li>
        </ul>
      </section>

      <p className="projet__back">
        <Link href="/">Retour à l&apos;accueil</Link>
      </p>
    </article>
  );
}
