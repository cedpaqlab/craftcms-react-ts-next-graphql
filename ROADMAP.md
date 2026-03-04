# Roadmap – Projet Next.js + Craft CMS headless (préparation entrevue)

Projet complet et fonctionnel dans un seul repo : Craft CMS (Docker) + Next.js (App Router, TypeScript, React, GraphQL, auth, CSS sans framework). Tout le flow de l’éditeur Craft jusqu’au front Next est opérationnel. Conçu pour être exécutable en ~1 h une fois l’environnement lancé.

---

## Sommaire

| Phase | Objectif | Durée cible |
|-------|----------|-------------|
| **0** | Docker : Craft CMS + MySQL, premier run, installation Craft, config GraphQL + token + section articles | 25 min |
| **1** | Boot Next.js : App Router, TypeScript, dépendances, structure dossiers | 15 min |
| **2** | Structure et config Next : env, next.config, CSS global sans framework | 10 min |
| **3** | Data layer : client GraphQL, repository articles, types, use cases, service | 15 min |
| **4** | Pages publiques : liste articles (ISR), détail [slug] (ISR + fallback), composants | 15 min |
| **5** | Auth : login/logout (API routes), JWT + cookies httpOnly, middleware, dashboard SSR | 20 min |
| **6** | BFF : proxy GraphQL, revalidation webhook Craft, headers cache CDN | 10 min |
| **7** | Polish : accessibilité, perfs, README et scénario démo entrevue | 10 min |

**Total visé : ~2 h** (buffer inclus). Objectif « 1 h une fois lancé » : phases 0–4 en priorité (Craft + Next + data + pages), 5–7 en option ou fin de session.

---

## Phase 0 – Docker : Craft CMS + MySQL (25 min)

**Objectif :** Avoir Craft CMS 4+ et MySQL qui tournent dans Docker, installés et configurés (GraphQL, token API, section Articles), accessibles depuis la machine hôte pour que Next.js puisse appeler l’API.

**Actions :**
1. À la racine du projet : `docker-compose.yml` avec deux services :
   - `db` : image MySQL 8, volume persistant pour les données, variables d’env (MYSQL_ROOT_PASSWORD, MYSQL_DATABASE, MYSQL_USER, MYSQL_PASSWORD).
   - `craft` : build depuis `docker/craft/Dockerfile`, dépend de `db`, port exposé (ex. 8080) pour accès depuis l’hôte à `http://localhost:8080`.
2. `docker/craft/Dockerfile` : image PHP 8.2 (Apache ou Nginx), extensions PHP nécessaires pour Craft (pdo_mysql, gd, etc.), Composer, puis `composer create-project craftcms/craft .` (ou copie d’un projet Craft pré-généré). Point d’entrée qui lance le serveur web.
3. Fichier d’env Craft : `.env.craft.example` (ou documenté dans README) avec `DB_DRIVER=mysql`, `DB_SERVER=db`, `DB_DATABASE`, `DB_USER`, `DB_PASSWORD`, `SECURITY_KEY`. Le `.env` Craft réel est monté ou généré au premier run (ne pas commiter).
4. Premier lancement : `docker compose up -d` ; attendre que MySQL soit prêt, puis exécuter l’installation Craft (CLI dans le conteneur : `./craft install` avec les mêmes identifiants DB, ou installer via l’interface web `http://localhost:8080/admin`).
5. Dans l’admin Craft : activer le module GraphQL, créer un schéma (ex. « frontend ») avec les champs nécessaires, créer un token d’API (Bearer) et noter sa valeur pour Next.js.
6. Créer une section « Articles » (Channel) avec les champs : titre, slug, extrait, corps (Rich Text ou Plain Text), date de publication. Créer au moins 2–3 articles de test.
7. Vérifier que `http://localhost:8080/graphql` répond (avec le token dans un client ou curl) et que les entrées de la section sont exposées.

**Livrable :** `docker compose up -d` lance Craft + MySQL ; GraphQL fonctionnel ; token et section Articles prêts. Next.js pourra utiliser `CRAFT_GRAPHQL_ENDPOINT=http://localhost:8080/graphql` et `CRAFT_GRAPHQL_TOKEN=<token>`.

---

## Phase 1 – Boot Next.js (15 min)

**Objectif :** Projet Next.js (App Router) + TypeScript prêt à coder, avec toutes les dépendances installées et la structure de dossiers en place.

**Actions :**
1. À la racine (à côté de `docker-compose.yml`) : initialiser Next.js avec App Router et TypeScript (`create-next-app` ou équivalent). Si le repo contient déjà des fichiers (ROADMAP, README, docker), initialiser dans le répertoire courant avec les options appropriées.
2. Installer les dépendances : `jsonwebtoken`, `@types/jsonwebtoken`, `cookie`, `@types/cookie`. Aucun framework CSS.
3. Créer les dossiers : `domain/`, `services/`, `repositories/`, `lib/`, `components/`, et le fichier `middleware.ts` à la racine. Le dossier `app/` est déjà présent avec `layout.tsx` et `page.tsx`.
4. Vérifier que `npm run dev` (ou `pnpm dev`) lance le serveur et affiche la page d’accueil.

**Livrable :** Next.js qui tourne, structure prête pour les phases suivantes, pas d’erreur de build.

---

## Phase 2 – Structure et config Next (10 min)

**Objectif :** Configuration propre (env, next.config), structure alignée avec le poste (domain / services / repositories / lib), CSS global minimal sans framework.

**Actions :**
1. Fichier `.env.local` et `.env.example` : `CRAFT_GRAPHQL_ENDPOINT` (ex. `http://localhost:8080/graphql` pour Craft en Docker), `CRAFT_GRAPHQL_TOKEN`, `JWT_SECRET`, `REVALIDATE_SECRET`.
2. `lib/config.ts` : export des variables d’environnement (valeurs par défaut pour dev si besoin).
3. `next.config.js` : config de base ; si Craft renvoie des URLs d’images externes, ajouter les domaines autorisés pour `images.remotePatterns`.
4. Dossiers : `domain/article/` (article.types.ts, article.useCases.ts), `domain/user/` (user.types.ts), `lib/auth/` (prévu pour jwt.ts, cookies.ts). Fichier `app/globals.css` : reset minimal + grille CSS (grid), pas de flex sauf si nécessaire.
5. Layout racine dans `app/layout.tsx` : import de `globals.css`, structure sémantique (header, main, footer).

**Livrable :** Config centralisée, structure prête pour le data layer et l’auth, base CSS maintenable.

---

## Phase 3 – Data layer GraphQL (15 min)

**Objectif :** Récupération des données Craft CMS via GraphQL : client générique, repository articles, types TypeScript, use cases et service.

**Actions :**
1. `lib/graphqlClient.ts` : fonction générique `craftGraphqlFetch<T>({ query, variables })` avec `fetch` vers `CRAFT_GRAPHQL_ENDPOINT`, header `Authorization: Bearer CRAFT_GRAPHQL_TOKEN`, gestion des erreurs et typage `T`.
2. `repositories/articleRepository.ts` : requêtes GraphQL avec fragments (id, title, slug, excerpt, postDate ; détail avec body). `fetchArticles(page, perPage)` retourne `{ items, hasMore }` ; `fetchArticleBySlug(slug)` retourne `Article | null`. Adapter les noms de champs au schéma Craft réel (ex. section handle, champs Matrix).
3. `domain/article/article.types.ts` : type `Article` (id, slug, title, excerpt, body?, publishedAt).
4. `domain/article/article.useCases.ts` : `listArticlesUseCase(page)`, `getArticleUseCase(slug)` qui appellent le repository.
5. `services/articleService.ts` : `listArticlesForPublicPage(page)`, `getArticleForPublicPage(slug)` pour les pages.

**Livrable :** Appels GraphQL fonctionnels vers Craft (Docker) ; pas de logique GraphQL dans les pages.

---

## Phase 4 – Pages publiques SSG/ISR (15 min)

**Objectif :** Pages réalistes : liste d’articles (ISR), détail article par slug (ISR + fallback), composants réutilisables.

**Actions :**
1. `app/blog/page.tsx` : liste d’articles via `articleService.listArticlesForPublicPage(1)` (Server Component). Pagination possible (query param `page` ou lien « Page suivante »).
2. `app/blog/[slug]/page.tsx` : détail via `articleService.getArticleForPublicPage(params.slug)` ; `notFound()` si absent. `generateStaticParams` pour les N premiers slugs (ISR), fallback pour les autres. `revalidate = 60`.
3. Composants : `components/blog/ArticleCard.tsx`, `components/blog/ArticleList.tsx` ; `components/layout/Layout.tsx` si utile.
4. Styles : grille CSS pour la liste et la page détail, pas de framework.

**Livrable :** `/blog` et `/blog/[slug]` fonctionnels avec les données Craft, prêts à discuter en entrevue.

---

## Phase 5 – Auth (JWT, cookies, middleware, dashboard) (20 min)

**Objectif :** Auth complète côté Next.js : login/logout, JWT en cookie httpOnly, protection des routes, dashboard en SSR.

**Actions :**
1. `lib/auth/jwt.ts` : `signAuthToken(payload)`, `verifyAuthToken(token)` (JWT_SECRET).
2. `lib/auth/cookies.ts` : `setAuthCookie(res, token)`, `clearAuthCookie(res)`, `getAuthTokenFromRequest(req)` (httpOnly, secure en prod, sameSite lax).
3. `services/authService.ts` : `authenticateUser(email, password)` (stub ou appel IdP), `validateToken(token)`.
4. `app/api/auth/login/route.ts` : POST `{ email, password }` → authService → JWT + setAuthCookie + JSON `{ user }`.
5. `app/api/auth/logout/route.ts` : clearAuthCookie + 200.
6. `middleware.ts` : pour `/dashboard`, lecture du cookie, vérification JWT ; si invalide, redirect `/login?from=...`. Helper dans `middleware/authMiddleware.ts` si besoin.
7. `app/login/page.tsx` : formulaire → POST `/api/auth/login` → redirect vers `from` ou `/dashboard`.
8. `app/dashboard/page.tsx` : SSR, lecture cookie + vérification JWT ; si absent/invalide, redirect `/login`. Afficher infos user (email).

**Livrable :** Login → cookie → accès à `/dashboard` ; logout → plus d’accès ; middleware + SSR cohérents.

---

## Phase 6 – BFF, cache, webhooks (10 min)

**Objectif :** Proxy GraphQL, revalidation ISR via webhook Craft, headers cache CDN.

**Actions :**
1. `app/api/cms/graphql/route.ts` : POST `{ query, variables }` → `craftGraphqlFetch` → `{ data }` avec header `Cache-Control: s-maxage=60, stale-while-revalidate=300`.
2. `app/api/revalidate/route.ts` : GET/POST avec `secret` (REVALIDATE_SECRET) ; si OK, `revalidatePath('/blog')` et éventuellement `/blog/[slug]` si `slug` fourni ; réponse `{ revalidated: true }`.
3. Documenter dans le README : URL du webhook Craft vers `https://<domaine>/api/revalidate?secret=...`.

**Livrable :** BFF et revalidation ISR opérationnels depuis Craft.

---

## Phase 7 – Polish et scénario démo (10 min)

**Objectif :** Accessibilité basique, perfs, README à jour et scénario de démo pour l’entrevue.

**Actions :**
1. Accessibilité : balises sémantiques (nav, main, article), contraste, labels formulaire login, focus visible.
2. Perfs : pas de données sensibles en client sur les pages publiques ; rappel ISR + revalidate.
3. README : stack, lancement du projet (Docker + Next), variables d’env, commandes. Section « Scénario démo » : structure domain / services / repositories, flux GraphQL → page, auth, SSG/ISR et webhook.

**Livrable :** Projet complet et prêt à montrer en entrevue.

---

## Ordre d’exécution

1. Phase 0 (Docker Craft + MySQL) → Phase 1 (Next.js) → Phase 2 → … → Phase 7.
2. Prérequis : Docker et Docker Compose installés sur la machine.
3. Une fois la Phase 0 terminée, Craft est disponible sur le port exposé ; Next.js utilise `CRAFT_GRAPHQL_ENDPOINT` et `CRAFT_GRAPHQL_TOKEN` dans `.env.local`.
4. Contrainte « 1 h une fois lancé » : viser les phases 0–4 (Craft + Next + data + pages) ; 5–7 en option.
5. L’agent installe les librairies et crée les fichiers ; toi tu valides et adaptes (ex. noms de champs Craft réels).
