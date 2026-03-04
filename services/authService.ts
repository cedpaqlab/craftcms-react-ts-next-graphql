import { signAuthToken, verifyAuthToken, type AuthClaims } from "@/lib/auth/jwt";

export type AuthUser = { id: string; email: string; role: string };

const DEMO_USERS: Array<{ email: string; password: string; id: string; role: string }> = [
  { email: "demo@demo.com", password: "demo", id: "demo", role: "user" },
  { email: "moderator@demo.com", password: "demo", id: "mod", role: "moderator" },
  { email: "admin@demo.com", password: "demo", id: "admin", role: "admin" },
];

/* Appelé par: POST /api/auth/login (route).
   Appelle: — (lecture DEMO_USERS en mémoire). */
export async function authenticateUser(
  email: string,
  password: string
): Promise<AuthUser | null> {
  const u = DEMO_USERS.find(
    (x) => x.email.toLowerCase() === email.toLowerCase() && x.password === password
  );
  return u ? { id: u.id, email: u.email, role: u.role } : null;
}

/* Appelé par: submitCommentAction (route), composants (lecture claims).
   Appelle: verifyAuthToken (lib). */
export function validateToken(token: string): AuthClaims | null {
  return verifyAuthToken(token);
}

/* Appelé par: POST /api/auth/login (route).
   Appelle: signAuthToken (lib). */
export function createTokenForUser(user: AuthUser, craftUserId: string): string {
  return signAuthToken({
    sub: user.id,
    email: user.email,
    role: user.role,
    craftUserId,
  });
}

/* Appelé par: page dashboard/moderation, composants (route).
   Appelle: — */
export function canModerate(claims: AuthClaims): boolean {
  return claims.role === "moderator" || claims.role === "admin";
}
