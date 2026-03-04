# Spec : Commentaires (Craft CMS + GraphQL)

Référence pour créer la section Craft et implémenter le repository Next.js.

---

## 1. Section Craft « Commentaires »

### 1.1 Création

- **Type de section** : Channel (plusieurs entrées).
- **Nom** : Commentaires.
- **Handle** : `comments` (obligatoire pour les queries `section: "comments"`).
- **Entry type** : un seul type, nom « Comment », handle **`comment`** (le type GraphQL sera `comment_Entry` ; si Craft génère `comments_comment_Entry`, l’adapter dans les requêtes).

### 1.2 Champs (custom fields)

| Nom (label)   | Handle        | Type Craft        | Usage |
|---------------|---------------|-------------------|--------|
| Article       | `article`     | Entries (relation) | Relation vers une entrée de la section **Articles**. Source : section « articles », 1 seule entrée. |
| Auteur        | `authorName`  | Plain Text        | Nom affiché. |
| Email auteur  | `authorEmail` | Email (ou Plain Text) | Email du commentaire. |
| Corps         | `commentBody` | Plain Text (multiline) | Texte du commentaire (sera sanitized côté Next). |
| Statut        | `commentStatus` | Dropdown        | Valeurs exactes : `pending` \| `approved` \| `rejected`. Défaut : `pending`. |

- **Champs natifs Craft** : `title` (obligatoire). `authorId` **nullable** en mutation : commentaires publics, pas de lien admin ; si visiteur connecté (team/entreprise plus tard), on envoie son `craftUserId` (JWT).
- **Schéma GraphQL** : autoriser la **lecture des users** (`id`, `email`) pour le login (craftUserId). Côté Craft, rendre l’auteur nullable sur le type d’entrée Comment si nécessaire.  
  - `CRAFT_COMMENTS_ENTRY_TYPE` (optionnel) : type GraphQL du commentaire. Défaut : `comment_Entry`. Si ton schéma expose un autre nom (ex. `comments_comment_Entry`), le définir ici.

### 1.3 Schéma GraphQL Craft

- Dans **Configuration > GraphQL > Schémas** : pour le schéma utilisé par le token API :
  - Autoriser **Lecture** des entrées de la section Commentaires.
  - Autoriser **Création** et **Modification** des entrées (mutations) pour cette section.
- Le nom exact de la mutation s’affiche dans **Admin > GraphiQL** après création de la section (format : `save_<sectionHandle>_<entryTypeHandle>_Entry`, ex. `save_comments_comment_Entry`).

---

## 2. API GraphQL (côté Next)

### 2.1 Conventions

- **Section** : `comments`.
- **Type d’entrée** : `comment_Entry` (à confirmer dans GraphiQL ; parfois `comments_comment_Entry`).
- **Relation** : le champ `article` renvoie une entrée (ou un tableau selon le schéma) ; on filtre par l’entrée liée (ex. par `slug` de l’article).

### 2.2 Queries

**Liste des commentaires d’un article (approuvés uniquement, pour affichage public)**

- Filtrer `entries(section: "comments", ...)` avec un critère sur la relation `article` (ex. `article.slug: ["mon-slug"]` ou équivalent selon le schéma Craft).
- Champs à demander : `id`, `title`, `authorName`, `authorEmail`, `commentBody`, `commentStatus`, `dateCreated`, et la relation `article` (au moins `id` ou `slug`) pour vérifier.
- Filtre côté Next si besoin : ne retourner que `commentStatus: "approved"`.

**Liste des commentaires en attente (modération)**

- Même section, filtre `commentStatus: "pending"` (si le schéma le permet) ou récupérer tous et filtrer en Next.
- Champs : `id`, `title`, `authorName`, `authorEmail`, `commentBody`, `commentStatus`, `dateCreated`, `article` (pour afficher « Commentaire sur : [titre article] »).

### 2.3 Mutations

**Créer un commentaire**

- Mutation : `save_comments_comment_Entry` (ou le nom exact affiché dans GraphiQL).
- Arguments utiles : `title`, `authorId` (optionnel, `null` = public ; si connecté = JWT `craftUserId`), `article`, `authorName`, `authorEmail`, `commentBody`, `commentStatus` (ex. `"pending"`). Pas de login requis.
- Réponse : au minimum `id` (et éventuellement `dateCreated`) pour confirmation.

**Mettre à jour le statut (modération)**

- Même mutation `save_..._Entry` avec l’`id` du commentaire et `commentStatus: "approved"` ou `commentStatus: "rejected"`.
- Réponse : `id`, `commentStatus`.

### 2.4 Types côté Next (domaine)

- `Comment` : `id`, `articleId` (ou `articleSlug`), `authorName`, `authorEmail`, `body`, `status`, `createdAt`.
- `CommentStatus` : `"pending"` | `"approved"` | `"rejected"`.

Le repository mappe les champs Craft (`commentBody` → `body`, `commentStatus` → `status`, `dateCreated` → `createdAt`, relation article → `articleId` / `articleSlug`) vers ces types.

---

## 3. Roadmap (ordre des tâches)

| # | Tâche | Qui | Statut |
|---|-------|-----|--------|
| 1 | Section Commentaires dans Craft (champs, GraphQL lecture + mutations) | Toi | Fait |
| 2 | Spec GraphQL + repository commentaires + auth rôles | Moi | Fait |
| 3 | **Use cases + service commentaires** : `listCommentsForArticle`, `submitComment`, `listPendingForModeration`, `setCommentStatus`. Service → UseCase → Repository (frontière domaine/infra). | Toi | À faire |
| 4 | **Page article + composants** : afficher commentaires sous l’article, formulaire ajout, sanitization du corps. Composants CommentList, CommentForm. Référence : `app/blog/[slug]/page.tsx`, `lib/sanitize.ts`, ArticleCard/LoginForm. | Toi | À faire |
| 5 | **Dashboard modération** : page `/dashboard/moderation`, liste commentaires en attente, boutons Approuver / Rejeter (server actions). Accès réservé moderator/admin. Référence : `app/dashboard/page.tsx`, `app/dashboard/actions.ts`. | Toi | À faire |

Tu es rendu à la **tâche 3** (use cases + service commentaires).
