import { config } from "./config";

type GraphQLOptions<V = Record<string, unknown>> = {
  query: string;
  variables?: V;
};

export async function craftGraphqlFetch<T, V = Record<string, unknown>>(
  options: GraphQLOptions<V>
): Promise<T> {
  const { query, variables } = options;
  const { graphqlEndpoint, graphqlToken } = config.craft;

  if (!graphqlToken?.trim()) {
    throw new Error("CRAFT_GRAPHQL_TOKEN manquant dans .env.local");
  }

  const res = await fetch(graphqlEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${graphqlToken}`,
    },
    body: JSON.stringify({ query, variables }),
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`GraphQL Craft: ${res.status}`);
  }

  const json = (await res.json()) as {
    data?: T;
    errors?: Array<{ message: string; extensions?: unknown }>;
  };

  if (json.errors?.length) {
    throw new Error(
      `GraphQL: ${json.errors.map((e) => e.message).join(", ")}`
    );
  }

  return json.data as T;
}
