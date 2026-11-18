import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { OwnProfile } from "@/lib/types";
import OnboardingForm from "./OnboardingForm";

export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: profile }, { data: avail }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single<OwnProfile>(),
    supabase.from("availability").select("starts_at").eq("user_id", user.id).gte("starts_at", new Date().toISOString()),
  ]);

  // Vooraf invullen met wat LinkedIn meestuurt (naam, foto, e-mail).
  const meta = user.user_metadata ?? {};
  const linkedinName =
    meta.name || meta.full_name || [meta.given_name, meta.family_name].filter(Boolean).join(" ") || "";
  const prefill = {
    name: profile?.name || linkedinName,
    company: profile?.company || companyFromEmail(user.email),
    picture: profile?.linkedin_picture || meta.picture || meta.avatar_url || null,
  };

  return (
    <OnboardingForm
      prefill={prefill}
      profile={profile}
      slots={(avail ?? []).map((a) => new Date(a.starts_at).toISOString())}
    />
  );
}

const FREE_MAIL = /^(gmail|googlemail|hotmail|outlook|live|icloud|me|yahoo|ziggo|kpnmail|kpnplanet|planet|home|xs4all|upcmail|chello|hetnet|casema|quicknet|protonmail|proton|gmx)\./i;

/** "jan@acme-group.nl" → "Acme Group"; privé-adressen leveren niets op. */
function companyFromEmail(email?: string | null): string {
  const domain = email?.split("@")[1];
  if (!domain || FREE_MAIL.test(domain)) return "";
  const label = domain.split(".").slice(-2, -1)[0] ?? "";
  return label.split(/[-_]/).map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}
