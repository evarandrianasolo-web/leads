-- =============================================================
-- À exécuter dans l'éditeur SQL de Supabase (SQL Editor).
-- Crée la table `leads` et active la RLS.
-- La clé service_role contourne la RLS : l'écriture/lecture serveur fonctionne.
-- Aucune policy publique n'est créée -> les rôles anon/authenticated ne voient rien.
-- =============================================================

create table if not exists public.leads (
  id          uuid           primary key default gen_random_uuid(),
  nom         text           not null,
  societe     text           not null,
  email       text           not null,
  budget      numeric        not null,
  score       int            not null check (score >= 0 and score <= 100),
  statut      text           not null default 'nouveau',
  created_at  timestamptz    not null default now()
);

-- Active la Row Level Security. Sans policy, seuls les rôles privilégiés
-- (service_role) peuvent lire/écrire. Le navigateur (anon) n'a aucun accès.
alter table public.leads enable row level security;
