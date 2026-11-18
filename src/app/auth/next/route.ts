import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/** Na het inloggen: nieuwe gebruikers naar aanmelden, bestaande naar matches. */
export async function GET(request: Request) {
  const { origin } = new URL(request.url);
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(`${origin}/login?fout=${encodeURIComponent("Sessie niet gevonden, probeer opnieuw")}`);
  const { data: profile } = await supabase.from("profiles").select("onboarded").eq("id", user.id).single();
  return NextResponse.redirect(`${origin}${profile?.onboarded ? "/matches" : "/onboarding"}`);
}
