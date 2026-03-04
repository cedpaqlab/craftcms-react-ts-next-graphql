import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { config } from "@/lib/config";

/* Appelé par: client externe ou webhook (route API GET /api/revalidate).
   Appelle: config (lib), revalidatePath (Next). */
export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get("secret");
  if (secret !== config.revalidate.secret) {
    return NextResponse.json({ error: "Invalid secret" }, { status: 401 });
  }
  revalidatePath("/blog");
  const slug = request.nextUrl.searchParams.get("slug");
  if (slug) {
    revalidatePath(`/blog/${slug}`);
  }
  return NextResponse.json({ revalidated: true });
}

/* Appelé par: client externe ou webhook (route API POST /api/revalidate).
   Appelle: config (lib), revalidatePath (Next). */
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const secret = body.secret ?? request.nextUrl.searchParams.get("secret");
  if (secret !== config.revalidate.secret) {
    return NextResponse.json({ error: "Invalid secret" }, { status: 401 });
  }
  revalidatePath("/blog");
  const slug = body.slug;
  if (typeof slug === "string" && slug) {
    revalidatePath(`/blog/${slug}`);
  }
  return NextResponse.json({ revalidated: true });
}
