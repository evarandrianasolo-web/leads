// Lecture des leads côté serveur (service_role). Partagée par les pages.
import { supabaseAdmin, type Lead } from "./supabase-server";

export async function getLeads(): Promise<{
  leads: Lead[];
  error: string | null;
}> {
  const { data, error } = await supabaseAdmin
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false });

  return { leads: (data ?? []) as Lead[], error: error?.message ?? null };
}
