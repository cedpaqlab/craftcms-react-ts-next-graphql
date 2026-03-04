import Link from "next/link";
import { redirect } from "next/navigation";
import { getAuthToken, formatDateTimeFr } from "@/lib/helpers";
import { validateToken } from "@/services/authService";
import { fetchArticles } from "@/repositories/articleRepository";
import { craftGraphqlFetch } from "@/lib/graphqlClient";
import { LogoutButton } from "./LogoutButton";
import { revalidateArticleAction, revalidateBlogAction } from "./actions";

type Props = { searchParams: Promise<{ revalidated?: string }> };

export default async function DashboardPage({ searchParams }: Props) {
  const token = getAuthToken();
  if (!token) {
    redirect("/login?from=/dashboard");
  }
  const payload = validateToken(token);
  if (!payload) {
    redirect("/login?from=/dashboard");
  }

  const { revalidated } = await searchParams;

  const issuedAt = payload.iat ? new Date(payload.iat * 1000) : null;
  const expiresAt = payload.exp ? new Date(payload.exp * 1000) : null;
  const secondsLeft =
    payload.exp != null ? Math.max(0, payload.exp - Math.floor(Date.now() / 1000)) : null;

  const cmsPing = await (async () => {
    const startedAt = Date.now();
    try {
      const data = await craftGraphqlFetch<{ ping: string }>({ query: "{ ping }" });
      const elapsedMs = Date.now() - startedAt;
      return { ok: data.ping === "pong", elapsedMs, error: null as string | null };
    } catch (err) {
      const elapsedMs = Date.now() - startedAt;
      const message = err instanceof Error ? err.message : "Erreur inconnue";
      return { ok: false, elapsedMs, error: message };
    }
  })();

  const latestArticles = await (async () => {
    try {
      const { items } = await fetchArticles(1, 5);
      return { items, error: null as string | null };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur inconnue";
      return { items: [], error: message };
    }
  })();

  return (
    <section className="dashboard" aria-labelledby="dashboard-title">
      <header className="dashboard__header">
        <div className="dashboard__header-left">
          <h1 id="dashboard-title" className="dashboard__title">
            Dashboard
          </h1>
          {revalidated && (
            <p className="dashboard__flash" role="status">
              Revalidation effectuée : <strong>{revalidated}</strong>
            </p>
          )}
        </div>
        <div className="dashboard__header-right">
          <LogoutButton />
        </div>
      </header>

      <div className="dashboard__tiles" aria-label="Tuiles d'observabilité">
        <article className="dash-tile" aria-labelledby="tile-session-title">
          <header className="dash-tile__header">
            <h2 id="tile-session-title" className="dash-tile__title">
              Session & sécurité
            </h2>
          </header>
          <dl className="dash-kv">
            <div className="dash-kv__row">
              <dt>Email</dt>
              <dd>{payload.email}</dd>
            </div>
            <div className="dash-kv__row">
              <dt>Utilisateur</dt>
              <dd>{payload.sub}</dd>
            </div>
            <div className="dash-kv__row">
              <dt>Émis</dt>
              <dd>{formatDateTimeFr(issuedAt)}</dd>
            </div>
            <div className="dash-kv__row">
              <dt>Expire</dt>
              <dd>{formatDateTimeFr(expiresAt)}</dd>
            </div>
            <div className="dash-kv__row">
              <dt>Temps restant</dt>
              <dd>
                {secondsLeft != null ? `${Math.floor(secondsLeft / 60)} min` : "—"}
              </dd>
            </div>
          </dl>
        </article>

        <article className="dash-tile" aria-labelledby="tile-cms-title">
          <header className="dash-tile__header">
            <h2 id="tile-cms-title" className="dash-tile__title">
              CMS (Craft) & contenu
            </h2>
          </header>

          <dl className="dash-kv">
            <div className="dash-kv__row">
              <dt>Ping GraphQL</dt>
              <dd className={cmsPing.ok ? "dash-pill dash-pill--ok" : "dash-pill dash-pill--ko"}>
                {cmsPing.ok ? "OK" : "KO"}
              </dd>
            </div>
            <div className="dash-kv__row">
              <dt>Latence</dt>
              <dd>{cmsPing.elapsedMs} ms</dd>
            </div>
          </dl>

          {cmsPing.error && (
            <p className="dash-tile__error" role="alert">
              {cmsPing.error}
            </p>
          )}

          <div className="dash-tile__sub">
            <h3 className="dash-tile__subtitle">Derniers articles</h3>
            {latestArticles.error ? (
              <p className="dash-tile__error" role="alert">
                {latestArticles.error}
              </p>
            ) : latestArticles.items.length ? (
              <ol className="dash-list">
                {latestArticles.items.map((a) => (
                  <li key={a.id}>
                    <Link href={`/blog/${a.slug}`}>{a.title}</Link>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="dash-tile__muted">Aucun article.</p>
            )}
          </div>
        </article>

        <article className="dash-tile" aria-labelledby="tile-ops-title">
          <header className="dash-tile__header">
            <h2 id="tile-ops-title" className="dash-tile__title">
              Ops (cache ISR)
            </h2>
          </header>

          <div className="dash-actions">
            <form action={revalidateBlogAction}>
              <button className="dash-btn" type="submit">
                Revalider /blog
              </button>
            </form>

            <form action={revalidateArticleAction} className="dash-actions__row">
              <label className="dash-actions__label" htmlFor="reval-slug">
                Slug
              </label>
              <input
                id="reval-slug"
                name="slug"
                className="dash-input"
                placeholder="ex: mon-article"
              />
              <button className="dash-btn" type="submit">
                Revalider
              </button>
            </form>

            <p className="dash-tile__muted">
              Ces actions appellent <code>revalidatePath()</code> côté serveur.
            </p>
          </div>
        </article>
      </div>

      <p className="dashboard__back">
        <Link href="/">Retour à l&apos;accueil</Link>
      </p>
    </section>
  );
}
