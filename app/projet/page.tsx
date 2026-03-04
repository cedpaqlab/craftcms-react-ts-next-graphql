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
        Ce que nous avons mis en place : stack, structure, décisions techniques et points à valoriser en entrevue.
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

      <section className="projet__section" aria-labelledby="qualite-title">
        <h2 id="qualite-title">Objectifs qualité atteints</h2>
        <ul className="projet__list">
          <li><strong>Pas de fallback masquant les erreurs</strong> – Aucun try/catch qui transforme une erreur GraphQL ou auth en 404 ou liste vide. Les erreurs remontent et restent visibles.</li>
          <li><strong>Config production</strong> – En prod, <code>JWT_SECRET</code> et <code>REVALIDATE_SECRET</code> doivent être définis ; utiliser les valeurs par défaut déclenche une erreur au démarrage.</li>
          <li><strong>Auth cohérente</strong> – JWT vérifié en Edge (middleware, lib jose) et en SSR (dashboard). Cookie supprimé si token invalide. Une seule source pour le secret (<code>lib/config</code>).</li>
          <li><strong>Sanitization du HTML</strong> – Le body des articles (Craft) est affiché via <code>dangerouslySetInnerHTML</code>. Nous passons par <code>sanitizeBody()</code> (isomorphic-dompurify) avec liste de tags et attributs autorisés. Defense in depth : même si Craft filtre à la saisie, l’output côté Next est nettoyé (évite XSS).</li>
          <li><strong>Helpers centralisés</strong> – Auth (<code>hasAuthSession</code>, <code>getAuthToken</code>) et formatage dates (fr-FR) dans <code>lib/helpers.ts</code>. Pas de duplication, un seul endroit à faire évoluer.</li>
          <li><strong>BFF et revalidation</strong> – Proxy GraphQL (<code>/api/cms/graphql</code>) avec en-têtes cache ; endpoint de revalidation ISR (<code>/api/revalidate</code>) pour webhook Craft. Dashboard avec tuiles ops (session, CMS, revalidation).</li>
        </ul>
      </section>

      <section className="projet__section" aria-labelledby="entrevue-title">
        <h2 id="entrevue-title">À dire en entrevue</h2>
        <ul className="projet__list">
          <li>Architecture en couches (domain / services / repositories) et flux de données sans fuite de responsabilités.</li>
          <li>Choix de ne jamais masquer les erreurs (pas de fallback silencieux) pour faciliter le debug et la fiabilité.</li>
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
