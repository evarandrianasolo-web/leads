-- =============================================================
-- À exécuter dans l'éditeur SQL de Supabase (SQL Editor).
-- Ajoute la colonne updated_at à la table `leads`.
-- =============================================================

alter table public.leads
  add column if not exists updated_at timestamptz not null default now();

-- Pour les lignes existantes, on aligne updated_at sur created_at
-- afin de ne pas afficher "modifié le" à tort tant qu'aucun PATCH n'a eu lieu.
update public.leads set updated_at = created_at;
