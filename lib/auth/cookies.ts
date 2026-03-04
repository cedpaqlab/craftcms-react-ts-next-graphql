import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const AUTH_COOKIE = "auth";

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 7,
};

/* Appelé par: POST /api/auth/login (route).
   Appelle: NextResponse.cookies (Next). */
export function setAuthCookie(response: NextResponse, token: string): void {
  response.cookies.set(AUTH_COOKIE, token, cookieOptions);
}

/* Appelé par: POST /api/auth/logout (route).
   Appelle: NextResponse.cookies (Next). */
export function clearAuthCookie(response: NextResponse): void {
  response.cookies.set(AUTH_COOKIE, "", { ...cookieOptions, maxAge: 0 });
}

/* Appelé par: middleware ou routes (route).
   Appelle: — */
export function getAuthTokenFromRequest(request: NextRequest): string | undefined {
  return request.cookies.get(AUTH_COOKIE)?.value;
}
