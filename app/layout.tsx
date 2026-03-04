import type { Metadata } from "next";
import Link from "next/link";
import { hasAuthSession } from "@/lib/helpers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Next.js + Craft CMS headless",
  description: "Projet démo fullstack",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isConnected = hasAuthSession();

  return (
    <html lang="fr">
      <body className="layout">
        <header className="site-header" role="banner">
          <div className="site-header__inner">
            <h1 className="site-header__title">
              <Link href="/">Headless Demo</Link>
            </h1>
            <nav className="site-nav" aria-label="Navigation principale">
              <Link href="/">Accueil</Link>
              <Link href="/blog">Blog</Link>
              <Link href="/projet">Projet</Link>
              {isConnected ? (
                <Link href="/dashboard">Dashboard</Link>
              ) : (
                <Link href="/login">Connexion</Link>
              )}
            </nav>
          </div>
        </header>
        <main className="main" role="main">
          {children}
        </main>
        <footer className="site-footer" role="contentinfo">
          <p>
            Démo Next.js + Craft CMS headless. <Link href="/blog">Voir le blog</Link>.
          </p>
        </footer>
      </body>
    </html>
  );
}
