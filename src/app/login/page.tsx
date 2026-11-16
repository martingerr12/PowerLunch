"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function signIn() {
    setBusy(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "linkedin_oidc",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) {
      setError("Inloggen via LinkedIn lukte niet. Probeer het opnieuw.");
      setBusy(false);
    }
  }

  return (
    <div className="onb view-wrap">
      <div className="q active">
        <h2 className="serif">Welkom bij Power Lunch</h2>
        <p className="sub">
          Log in met LinkedIn. We nemen alleen je naam, profielfoto en e-mailadres over; de rest vul
          je zelf in.
        </p>
        <button className="li-btn" onClick={signIn} disabled={busy}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z" />
          </svg>
          {busy ? "Doorsturen naar LinkedIn…" : "Inloggen met LinkedIn"}
        </button>
        {error && <p className="err">{error}</p>}
      </div>
    </div>
  );
}
