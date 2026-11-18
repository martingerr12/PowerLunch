"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

/** Ontvangt de sessie van Supabase (in de URL-hash) en zet die in cookies. */
export default function ConfirmPage() {
  const [msg, setMsg] = useState("Bezig met inloggen…");

  useEffect(() => {
    const hash = new URLSearchParams(window.location.hash.slice(1));
    const query = new URLSearchParams(window.location.search);
    const fail = (m: string) => window.location.replace(`/login?fout=${encodeURIComponent(m)}`);

    const err = hash.get("error_description") ?? query.get("error_description");
    if (err) return fail(err);

    const access_token = hash.get("access_token");
    const refresh_token = hash.get("refresh_token");
    if (!access_token || !refresh_token) {
      // Valt terug op de code-flow als Supabase toch een ?code= stuurt.
      const code = query.get("code");
      if (code) return window.location.replace(`/auth/callback?code=${encodeURIComponent(code)}`);
      return fail("Geen sessie ontvangen van LinkedIn");
    }

    createClient()
      .auth.setSession({ access_token, refresh_token })
      .then(({ error }) => {
        if (error) return fail(error.message);
        setMsg("Ingelogd, even geduld…");
        window.location.replace("/auth/next");
      });
  }, []);

  return <div className="notice" style={{ maxWidth: 640, margin: "40px auto" }}>{msg}</div>;
}
