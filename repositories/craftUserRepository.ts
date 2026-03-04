import { craftGraphqlFetch } from "@/lib/graphqlClient";

const USERS_QUERY = `
  query CraftUsers($limit: Int!) {
    users(limit: $limit) {
      id
      email
    }
  }
`;

type CraftUser = { id: string; email?: string };
type Payload =
  | { users?: CraftUser[] }
  | { users?: { nodes?: CraftUser[]; edges?: Array<{ node?: CraftUser }> } };

/* Appelé par: fetchCraftUserIdByEmail (repository).
   Appelle: —.
   Plus d'info: normalise liste users (directe ou nodes/edges selon schéma Craft). */
function toUserList(users: Payload["users"]): CraftUser[] {
  if (!users) return [];
  if (Array.isArray(users)) return users;
  if (Array.isArray(users.nodes)) return users.nodes;
  if (Array.isArray(users.edges))
    return users.edges.map((e) => e.node).filter((n): n is CraftUser => n != null);
  return [];
}

/* Appelé par: POST /api/auth/login (route).
   Appelle: craftGraphqlFetch (lib), toUserList (local).
   Plus d'info: filtre côté app par email; pour gros volumes préférer une query Craft dédiée (ex. userByEmail). */
export async function fetchCraftUserIdByEmail(email: string): Promise<string> {
  const normalized = email.trim().toLowerCase();
  if (!normalized) throw new Error("Email requis pour résoudre l’utilisateur Craft.");

  const data = await craftGraphqlFetch<Payload>({
    query: USERS_QUERY,
    variables: { limit: 500 },
  });

  const users = toUserList(data?.users);
  const found = users.find((u) => (u.email ?? "").toLowerCase() === normalized);
  if (!found?.id)
    throw new Error(`Aucun utilisateur Craft pour l’email "${email}". Créer le compte ou vérifier le schéma GraphQL (lecture users).`);
  return found.id;
}
