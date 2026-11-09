import { createClient } from "@/lib/supabase/server";

// A user is an admin only if a row exists in public.admins for their auth id.
// The query runs under RLS: non-admins can never read that table.
export async function getAdminContext() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase, user: null, admin: null };

  const { data: admin } = await supabase
    .from("admins")
    .select("id, full_name")
    .eq("id", user.id)
    .maybeSingle();

  return { supabase, user, admin };
}
