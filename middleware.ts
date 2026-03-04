import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { config as appConfig } from "@/lib/config";

const AUTH_COOKIE = "auth";

function redirectToLogin(request: NextRequest) {
  const from = request.nextUrl.pathname;
  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("from", from);
  return NextResponse.redirect(loginUrl);
}

export async function middleware(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE)?.value;
  if (!token) {
    return redirectToLogin(request);
  }

  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(appConfig.auth.jwtSecret)
    );
    const role = (payload.role as string) ?? "user";
    if (request.nextUrl.pathname.startsWith("/dashboard/moderation")) {
      if (role !== "moderator" && role !== "admin") {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    }
    return NextResponse.next();
  } catch {
    const response = redirectToLogin(request);
    response.cookies.set(AUTH_COOKIE, "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });
    return response;
  }
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
