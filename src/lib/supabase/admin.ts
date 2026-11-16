import "server-only";
import { createClient } from "@supabase/supabase-js";

/**
 * Service-client: omzeilt Row Level Security. Alleen server-side gebruiken,
 * voor acties die beide deelnemers raken (restaurant kiezen, reserveren).
 */
export function createAdminClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false },
  });
}
