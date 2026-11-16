import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import "./globals.css";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Power Lunch — zakelijk netwerken, één lunch tegelijk",
  description:
    "Geef aan waarover je wilt sparren en wanneer je kunt lunchen. Power Lunch koppelt je aan de juiste professional in jouw stad en regelt de tafel.",
};

async function NavLinks() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return (
    <div className="nav-links">
      {user ? (
        <>
          <Link className="pill ghost" href="/matches">Matches</Link>
          <Link className="pill ghost" href="/lunches">Mijn lunches</Link>
          <Link className="pill ghost" href="/onboarding">Profiel</Link>
          <form action="/auth/signout" method="post">
            <button className="pill solid">Uitloggen</button>
          </form>
        </>
      ) : (
        <Link className="pill solid" href="/login">Inloggen</Link>
      )}
    </div>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=Inter:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <div className="wrap">
          <nav>
            <Link href="/" className="logo">
              <div className="logo-mark">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M7 3v8a3 3 0 0 0 3 3v7M7 3v5M4 3v5a3 3 0 0 0 3 3M10 3v5M17 3c-2 0-3 3-3 6s1 4 3 4v8"
                    stroke="#F6F1E7"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              Power Lunch
            </Link>
            <Suspense fallback={<div className="nav-links" />}>
              <NavLinks />
            </Suspense>
          </nav>
          {children}
        </div>
      </body>
    </html>
  );
}
