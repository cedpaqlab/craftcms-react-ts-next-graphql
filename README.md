# Next.js + Craft CMS headless

Projet fullstack dans un seul repo : Craft CMS (Docker) + Next.js (App Router), GraphQL, auth JWT, ISR, BFF, sanitization HTML. Architecture domain / services / repositories.

---

## Stack

| Couche | Technologie |
|--------|-------------|
| CMS | Craft CMS (Docker, MySQL) |
| Front | Next.js 14 (App Router), React, TypeScript |
| Data | GraphQL (Craft), client dédié, fragments |
| Auth | JWT (jose en Edge + jsonwebtoken), cookie httpOnly, middleware |
| Styles | CSS natif (grid), sans framework |
| Outils | Docker, Node.js 18+, npm ou pnpm |

---

## Accès (identifiants démo)

| Accès | URL | Identifiant | Mot de passe |
|-------|-----|-------------|--------------|
| **Craft CMS (admin)** | `http://localhost:8080/admin` | admin | Demo123! |
| **Next.js (login)** | `http://localhost:3000/login` | demo@demo.com | demo |

Ports (8080, 3000) modifiables selon Docker et le lancement Next.js.

---

## Prérequis

- Docker et Docker Compose
- Node.js 18+ (LTS recommandé)
- npm ou pnpm

---

## Lancement du projet complet

**1. Démarrer Craft CMS et MySQL (Docker)**

```bash
docker compose up -d
```

Craft s'installe auto au premier run (admin / Demo123!). Dans l'admin : GraphQL, schéma, token API, section Articles. Récupérer l’URL GraphQL et le token API dans l’admin Craft, puis les renseigner dans `.env.local`.

**2. Variables d’environnement Next.js**

Créer `.env.local` avec `CRAFT_GRAPHQL_ENDPOINT` (ex. `http://localhost:8080/index.php?action=graphql/api`), `CRAFT_GRAPHQL_TOKEN`, `JWT_SECRET`, `REVALIDATE_SECRET`.

**3. Installer et lancer Next.js**

```bash
npm install
npm run dev
```

Le front est disponible sur `http://localhost:3000` ; il consomme l’API GraphQL de Craft (port exposé par Docker, ex. 8080).

---

## Installation (Next.js uniquement)

```bash
npm install
# ou
pnpm install
```

---

## Variables d'environnement

Créer `.env.local` à la racine (voir `.env.example` pour le modèle). Variables attendues :

| Variable | Description | Exemple (dev) |
|----------|-------------|----------------|
| `CRAFT_GRAPHQL_ENDPOINT` | URL GraphQL Craft | `http://localhost:8080/index.php?action=graphql/api` |
| `CRAFT_GRAPHQL_TOKEN` | Token Bearer Craft | (token dans l'admin Craft) |
| `JWT_SECRET` | Secret JWT | chaîne aléatoire ; **obligatoire en prod** (pas de défaut) |
| `REVALIDATE_SECRET` | Secret webhook revalidation | chaîne aléatoire ; **obligatoire en prod** |

Ne pas commiter `.env.local`. Référence : `.env.example`.

---

## Scripts

| Commande | Rôle |
|----------|------|
| `npm run dev` | Serveur de développement (hot reload) |
| `npm run build` | Build de production |
| `npm run start` | Lancement du build en mode production |
| `npm run lint` | Vérification ESLint |

---

## Structure du projet

```
docker/                 # Craft CMS (Dockerfile, entrypoint)
docker-compose.yml     # Craft + MySQL
app/
  api/                 # auth (login, logout), cms/graphql (BFF), revalidate
  blog/                # Liste + [slug] (ISR)
  dashboard/           # Zone protégée, tuiles ops (session, CMS, revalidation)
  login/
  projet/
components/            # ArticleCard, ArticleList, LoginForm, etc.
domain/                # Types + use cases (article, user)
lib/                   # config, graphqlClient, auth (jwt, cookies), helpers, sanitize
middleware.ts          # Protection /dashboard, vérif JWT (Edge)
repositories/          # GraphQL, mapping vers domain
services/              # Façade (article, auth)
```

Flux : **Page** -> **Service** -> **Use case** -> **Repository** -> **GraphQL** -> Craft.

---

## Concepts clés

- **Pages publiques** : `/`, `/blog`, `/blog/[slug]` (ISR). Pas de cookie requis.
- **Auth** : login `POST /api/auth/login` ; JWT en cookie httpOnly ; logout `POST /api/auth/logout`. Compte démo : `demo@demo.com` / `demo`. Middleware vérifie le JWT en Edge (jose) ; dashboard en SSR.
- **Dashboard** : tuiles Session, CMS (ping + derniers articles), Ops (revalidation ISR via server actions).
- **BFF** : `POST /api/cms/graphql` proxy vers Craft avec Cache-Control. Pas d’auth sur le proxy.
- **Sanitization** : le body HTML des articles (Craft) est passé par DOMPurify (liste de tags autorisés) avant affichage. Voir `lib/sanitize.ts`.
- **Revalidation** : `GET/POST /api/revalidate?secret=<REVALIDATE_SECRET>` pour webhook Craft.

---

## Webhook Craft CMS (revalidation ISR)

Pour que les mises à jour de contenu dans Craft invalident le cache Next.js :

1. Dans Craft : Configuration > Webhooks.
2. Nouveau webhook déclenché sur "Entry saved" (et optionnellement "Entry deleted") pour la section concernée (ex. articles).
3. URL : `https://<domaine-de-ton-app>/api/revalidate?secret=<REVALIDATE_SECRET>`.
4. Méthode : GET ou POST.

À chaque enregistrement d’entrée, Next.js revalidera les pages concernées (ex. `/blog`, `/blog/[slug]`).

---

## Points clés

1. **Architecture** : domain / services / repositories, flux Page -> Service -> Use case -> Repository.
2. **Data** : une requête GraphQL (repository) jusqu'à l'affichage (page).
3. **Auth** : login -> cookie -> /dashboard ; logout ; middleware + SSR.
4. **Qualité** : pas de fallback masquant les erreurs ; config prod (secrets obligatoires) ; sanitization HTML (DOMPurify).
5. **Perfs** : ISR blog, webhook revalidation, BFF cache.
