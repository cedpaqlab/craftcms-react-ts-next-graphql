import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { craftGraphqlFetch } from "@/lib/graphqlClient";

export async function POST(request: NextRequest) {
  let body: { query?: string; variables?: Record<string, unknown> };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Body JSON invalide" },
      { status: 400 }
    );
  }

  const { query, variables } = body;
  if (!query || typeof query !== "string") {
    return NextResponse.json(
      { error: "query requise" },
      { status: 400 }
    );
  }

  try {
    const data = await craftGraphqlFetch<unknown>({
      query,
      variables: variables ?? {},
    });
    const response = NextResponse.json({ data });
    response.headers.set(
      "Cache-Control",
      "s-maxage=60, stale-while-revalidate=300"
    );
    return response;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur GraphQL";
    return NextResponse.json(
      { error: message },
      { status: 502 }
    );
  }
}
