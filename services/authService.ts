import { signAuthToken, verifyAuthToken, type AuthClaims } from "@/lib/auth/jwt";

export type AuthUser = { id: string; email: string };

const DEMO_EMAIL = "demo@demo.com";
const DEMO_PASSWORD = "demo";

export async function authenticateUser(
  email: string,
  password: string
): Promise<AuthUser | null> {
  if (email === DEMO_EMAIL && password === DEMO_PASSWORD) {
    return { id: "demo", email: DEMO_EMAIL };
  }
  return null;
}

export function validateToken(token: string): AuthClaims | null {
  return verifyAuthToken(token);
}

export function createTokenForUser(user: AuthUser): string {
  return signAuthToken({ sub: user.id, email: user.email });
}
