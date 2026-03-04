# Next.js + Craft CMS headless

Projet complet et fonctionnel dans un seul repo : Craft CMS (Docker) + Next.js (App Router) consommant l’API GraphQL Craft, avec authentification JWT, pages publiques en ISR et zone protégée en SSR. Architecture maintenable (domain / services / repositories).

---

## Stack

| Couche | Technologie |
|--------|-------------|
| CMS | Craft CMS 4+ (Docker, MySQL) |
| Front | Next.js 14+ (App Router), React, TypeScript |
| Data | GraphQL (Craft) |
| Auth | JWT, cookies httpOnly, middleware Next.js |
| Styles | CSS natif (grille), sans framework |
| Outils | Docker, Node.js 18+ LTS, npm ou pnpm |

---

## Accès (identifiants)

| Accès | URL | Identifiant | Mot de passe |
|-------|-----|-------------|--------------|
| **Craft CMS (admin)** | `http://localhost:8080/admin` | admin | Demo123! |
| **Front Next.js (compte démo)** | `http://localhost:3000/login` | demo@demo.com | demo |

Les ports (8080, 3000) peuvent varier selon la config Docker et le lancement de Next.js.

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

Après la première installation Craft (voir ROADMAP Phase 0). Craft s'installe auto au premier run (admin / Demo123!). Puis dans l'admin : GraphQL, schéma, token API, section Articles. Récupérer l’URL GraphQL et le token API dans l’admin Craft, puis les renseigner dans `.env.local`.

**2. Variables d’environnement Next.js**

Créer `.env.local` avec `CRAFT_GRAPHQL_ENDPOINT` (ex. `http://localhost:8080/graphql`), `CRAFT_GRAPHQL_TOKEN`, `JWT_SECRET`, `REVALIDATE_SECRET`.

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
| `CRAFT_GRAPHQL_ENDPOINT` | URL de l'API GraphQL Craft (Docker : ex. `http://localhost:8080/graphql`) | `http://localhost:8080/graphql` |
| `CRAFT_GRAPHQL_TOKEN` | Token Bearer pour l'API Craft | (token généré dans Craft) |
| `JWT_SECRET` | Secret pour signer/vérifier les JWT | chaîne longue et aléatoire |
| `REVALIDATE_SECRET` | Secret pour l'endpoint de revalidation ISR (webhook) | chaîne longue et aléatoire |

Ne pas commiter `.env.local`. Utiliser `.env.example` comme référence sans valeurs sensibles.

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
docker/                 # Dockerfile(s) pour Craft CMS
docker-compose.yml     # Craft + MySQL
app/                   # Routes et pages Next.js (App Router)
  api/                 # API routes (auth, proxy GraphQL, revalidate)
  blog/                # Pages publiques blog (ISR)
  dashboard/           # Zone protégée (SSR)
  login/
components/            # Composants UI réutilisables
domain/                # Logique métier (types, use cases)
lib/                   # Utilitaires (config, client GraphQL, auth)
middleware/            # Logique auth pour middleware Next.js
repositories/          # Accès données (GraphQL, mapping)
services/              # Orchestration (appels repositories, auth)
```

Le flux de données côté lecture : **Page** -> **Service** -> **Use case / Repository** -> **Client GraphQL** -> Craft CMS.

---

## Concepts clés

- **Pages publiques (`/blog`, `/blog/[slug])** : rendu côté serveur avec ISR (`revalidate`). Pas de cookie auth requis.
- **Dashboard (`/dashboard`)** : protégé par middleware (cookie JWT) et vérification côté serveur ; rendu SSR.
- **Auth** : login via `POST /api/auth/login` ; JWT stocké en cookie httpOnly ; logout via `POST /api/auth/logout`. Compte démo : `demo@demo.com` / `demo`.
- **Revalidation** : endpoint `GET/POST /api/revalidate?secret=<REVALIDATE_SECRET>` pour invalider le cache ISR (à appeler depuis un webhook Craft).

---

## Webhook Craft CMS (revalidation ISR)

Pour que les mises à jour de contenu dans Craft invalident le cache Next.js :

1. Dans Craft : Configuration > Webhooks.
2. Nouveau webhook déclenché sur "Entry saved" (et optionnellement "Entry deleted") pour la section concernée (ex. articles).
3. URL : `https://<domaine-de-ton-app>/api/revalidate?secret=<REVALIDATE_SECRET>`.
4. Méthode : GET ou POST.

À chaque enregistrement d’entrée, Next.js revalidera les pages concernées (ex. `/blog`, `/blog/[slug]`).

---

## Scénario démo (entrevue)

1. **Architecture** : montrer la séparation domain / services / repositories et le flux GraphQL -> repository -> service -> page.
2. **Data** : ouvrir une requête GraphQL (fragments, pagination) et tracer son usage jusqu’à l’affichage.
3. **Auth** : démontrer login -> cookie -> accès à `/dashboard`, puis logout et redirection.
4. **Performance** : expliquer le choix ISR pour le blog, SSR pour le dashboard, et le rôle du webhook pour la revalidation.

---

Voir `ROADMAP.md` pour le plan par phases (Phase 0 Docker Craft + MySQL, puis Next.js, data, pages, auth, BFF, polish).
