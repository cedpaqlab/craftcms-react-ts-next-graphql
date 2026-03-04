const isProd = process.env.NODE_ENV === "production";
const isDev = process.env.NODE_ENV === "development";

function env(key: string, fallback: string): string {
  const value = process.env[key] ?? fallback;
  if (isProd && (key === "JWT_SECRET" || key === "REVALIDATE_SECRET") && value === fallback) {
    throw new Error(`${key} requis en production (pas de valeur par défaut).`);
  }
  return value;
}

function optEnv(key: string, fallback: string): string {
  return process.env[key] ?? fallback;
}

export const config = {
  env: { isDev, isProd },
  craft: {
    graphqlEndpoint: env("CRAFT_GRAPHQL_ENDPOINT", "http://localhost:8080/index.php?action=graphql/api"),
    graphqlToken: env("CRAFT_GRAPHQL_TOKEN", ""),
    sections: { articles: "articles", comments: "comments" } as const,
    articlesEntryType: optEnv("CRAFT_ARTICLES_ENTRY_TYPE", "article_Entry"),
    commentsEntryType: optEnv("CRAFT_COMMENTS_ENTRY_TYPE", "comment_Entry"),
    saveCommentMutation: optEnv("CRAFT_SAVE_COMMENT_MUTATION", "save_comments_comment_Entry"),
  },
  auth: {
    jwtSecret: env("JWT_SECRET", "dev-secret"),
  },
  revalidate: {
    secret: env("REVALIDATE_SECRET", "dev-revalidate-secret"),
  },
} as const;
