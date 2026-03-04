import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  authenticateUser,
  createTokenForUser,
} from "@/services/authService";
import { setAuthCookie } from "@/lib/auth/cookies";

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

  const token = createTokenForUser(user);
  const response = NextResponse.json({ user: { id: user.id, email: user.email } });
  setAuthCookie(response, token);
  return response;
}
