"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function revalidateBlogAction() {
  revalidatePath("/blog");
  redirect("/dashboard?revalidated=blog");
}

export async function revalidateArticleAction(formData: FormData) {
  const slug = String(formData.get("slug") ?? "").trim();
  revalidatePath("/blog");
  if (slug) {
    revalidatePath(`/blog/${slug}`);
  }
  redirect(`/dashboard?revalidated=${encodeURIComponent(slug || "blog")}`);
}

