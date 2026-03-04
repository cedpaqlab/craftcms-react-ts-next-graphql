import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  authenticateUser,
  createTokenForUser,
} from "@/services/authService";
import { setAuthCookie } from "@/lib/auth/cookies";
import { config } from "@/lib/config";
import { fetchCraftUserIdByEmail } from "@/repositories/craftUserRepository";

/* Appelé par: client (route API POST /api/auth/login).
   Appelle: authenticateUser (service), fetchCraftUserIdByEmail (repository), createTokenForUser (service), setAuthCookie (lib). */
export async function POST(request: NextRequest) {
  let body: { email?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Body JSON invalide" },
      { status: 400 }
    );
  }

  const { email = "", password = "" } = body;
  const user = await authenticateUser(email, password);
  if (!user) {
    return NextResponse.json(
      { error: "Identifiants invalides" },
      { status: 401 }
    );
  }

  let craftUserId: string;
  try {
    craftUserId = await fetchCraftUserIdByEmail(user.email);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const error =
      config.env.isDev
        ? msg
        : "Utilisateur Craft introuvable pour cet email. Créer le compte dans Craft ou autoriser la lecture des users en GraphQL.";
    return NextResponse.json({ error }, { status: 403 });
  }

  const token = createTokenForUser(user, craftUserId);
  const response = NextResponse.json({ user: { id: user.id, email: user.email } });
  setAuthCookie(response, token);
  return response;
}
