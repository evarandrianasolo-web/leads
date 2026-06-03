// ⚠️ Client Supabase RÉSERVÉ AU SERVEUR.
// Il utilise la clé service_role qui contourne la RLS.
// Ce fichier ne doit JAMAIS être importé dans un composant client ("use client").
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error(
    "Variables d'environnement manquantes : NEXT_PUBLIC_SUPABASE_URL et/ou SUPABASE_SERVICE_ROLE_KEY."
  );
}

// Instancié une seule fois, côté serveur. Pas de session à persister pour un service.
export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// Type minimal d'un lead, partagé entre l'API et l'affichage.
export type Lead = {
  id: string;
  nom: string;
  societe: string;
  email: string;
  budget: number;
  score: number;
  statut: string;
  created_at: string;
  updated_at: string | null;
};
