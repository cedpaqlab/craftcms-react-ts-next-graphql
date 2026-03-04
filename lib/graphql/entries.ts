/**
 * Type standard des réponses Craft GraphQL pour les queries entries.
 * Centralisé pour éviter de redéfinir { entries?: T[] } dans chaque repository.
 */
export type CraftEntriesPayload<T> = { entries?: T[] };

/* Appelé par: commentRepository, articleRepository (repository).
   Appelle: —.
   Plus d'info: extrait entries d'une réponse Craft; une implémentation pour tous les repos (DRY). */
export function normalizeEntries<T>(data: unknown): T[] {
  if (data == null || typeof data !== "object") return [];
  if (Array.isArray(data)) return [];
  if (!("entries" in data)) return [];
  const entries = (data as CraftEntriesPayload<unknown>).entries;
  return (Array.isArray(entries) ? entries : []) as T[];
}
