"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

/* Appelé par: page dashboard (route, bouton revalider blog).
   Appelle: revalidatePath (Next), redirect (Next). */
export async function revalidateBlogAction() {
  revalidatePath("/blog");
  redirect("/dashboard?revalidated=blog");
}

/* Appelé par: page dashboard (route, formulaire revalider article).
   Appelle: revalidatePath (Next), redirect (Next). */
export async function revalidateArticleAction(formData: FormData) {
  const slug = String(formData.get("slug") ?? "").trim();
  revalidatePath("/blog");
  if (slug) {
    revalidatePath(`/blog/${slug}`);
  }
  redirect(`/dashboard?revalidated=${encodeURIComponent(slug || "blog")}`);
}

