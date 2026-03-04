const isProd = process.env.NODE_ENV === "production";

function env(key: string, fallback: string): string {
  const value = process.env[key] ?? fallback;
  if (isProd && (key === "JWT_SECRET" || key === "REVALIDATE_SECRET") && value === fallback) {
    throw new Error(`${key} requis en production (pas de valeur par défaut).`);
  }
  return value;
}

export const config = {
  craft: {
    graphqlEndpoint: env("CRAFT_GRAPHQL_ENDPOINT", "http://localhost:8080/index.php?action=graphql/api"),
    graphqlToken: env("CRAFT_GRAPHQL_TOKEN", ""),
  },
  auth: {
    jwtSecret: env("JWT_SECRET", "dev-secret"),
  },
  revalidate: {
    secret: env("REVALIDATE_SECRET", "dev-revalidate-secret"),
  },
} as const;
