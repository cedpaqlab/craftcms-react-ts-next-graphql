import jwt from "jsonwebtoken";
import { config } from "@/lib/config";

const SECRET = config.auth.jwtSecret;

export type AuthPayload = { sub: string; email: string; role?: string; craftUserId?: string };
export type AuthClaims = AuthPayload & jwt.JwtPayload;

export function signAuthToken(payload: AuthPayload): string {
  return jwt.sign(payload, SECRET, { expiresIn: "7d" });
}

export function verifyAuthToken(token: string): AuthClaims | null {
  try {
    const decoded = jwt.verify(token, SECRET) as AuthClaims;
    return decoded;
  } catch {
    return null;
  }
}
