import jwt from "jsonwebtoken";
import { config } from "@/lib/config";

const SECRET = config.auth.jwtSecret;

export type AuthPayload = { sub: string; email: string; role?: string; craftUserId?: string };
export type AuthClaims = AuthPayload & jwt.JwtPayload;

/* Appelé par: createTokenForUser (service).
   Appelle: config (lib), jwt.sign (lib jsonwebtoken). */
export function signAuthToken(payload: AuthPayload): string {
  return jwt.sign(payload, SECRET, { expiresIn: "7d" });
}

/* Appelé par: validateToken (service).
   Appelle: config (lib), jwt.verify (lib jsonwebtoken). */
export function verifyAuthToken(token: string): AuthClaims | null {
  try {
    const decoded = jwt.verify(token, SECRET) as AuthClaims;
    return decoded;
  } catch {
    return null;
  }
}
