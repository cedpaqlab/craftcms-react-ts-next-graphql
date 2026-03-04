import { NextResponse } from "next/server";
import { clearAuthCookie } from "@/lib/auth/cookies";

/* Appelé par: client (route API POST /api/auth/logout).
   Appelle: clearAuthCookie (lib). */
export async function POST() {
  const response = NextResponse.json({ ok: true });
  clearAuthCookie(response);
  return response;
}
