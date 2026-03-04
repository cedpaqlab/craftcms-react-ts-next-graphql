import { redirect } from "next/navigation";
import { getAuthToken } from "@/lib/helpers";
import { LoginForm } from "./LoginForm";

type Props = { searchParams: Promise<{ from?: string }> };

export default async function LoginPage({ searchParams }: Props) {
  if (getAuthToken()) {
    redirect("/dashboard");
  }
  const { from = "/dashboard" } = await searchParams;
  return (
    <section className="login-page" aria-labelledby="login-title">
      <h1 id="login-title" className="login-page__title">
        Connexion
      </h1>
      <LoginForm redirectTo={from} />
    </section>
  );
}
