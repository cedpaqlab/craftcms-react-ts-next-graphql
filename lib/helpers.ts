/**
 * Helpers centralisés (one-shot, réutilisables).
 * Auth : server only (next/headers). Dates : purs, partout.
 */

import { cookies } from "next/headers";

/** --- Auth (server: layout, pages) --- */

export function hasAuthSession(): boolean {
  return cookies().get("auth")?.value != null;
}

export function getAuthToken(): string | undefined {
  return cookies().get("auth")?.value;
}

/** --- Dates (fr-FR) --- */

export function formatDateFr(value: Date | string | null | undefined): string {
  if (value == null) return "—";
  const d = typeof value === "string" ? new Date(value) : value;
  return d.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatDateTimeFr(value: Date | string | number | null | undefined): string {
  if (value == null) return "—";
  const d = typeof value === "number" ? new Date(value * 1000) : typeof value === "string" ? new Date(value) : value;
  return d.toLocaleString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
