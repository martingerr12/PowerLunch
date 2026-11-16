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

  return (
    <OnboardingForm
      profile={profile}
      slots={(avail ?? []).map((a) => new Date(a.starts_at).toISOString())}
    />
  );
}
