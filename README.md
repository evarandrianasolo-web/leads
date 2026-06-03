# CRM Leads — démo

Mini CRM Next.js (App Router) + TypeScript + Tailwind + Supabase.
Une seule app déployable, sans authentification. Les leads sont alimentés
par un appel HTTP externe (ex. Make) et affichés dans un tableau de bord.

## Mise en route

1. **Base de données** : copier le contenu de [`supabase/schema.sql`](supabase/schema.sql)
   dans l'éditeur SQL Supabase et l'exécuter (crée la table `leads` + active la RLS).
2. **Variables d'env** : copier `.env.example` vers `.env.local` et renseigner
   `NEXT_PUBLIC_SUPABASE_URL` et `SUPABASE_SERVICE_ROLE_KEY`
   (Settings → API dans le dashboard Supabase).
3. **Installer & lancer** :
   ```bash
   npm install
   npm run dev
   ```
   Ouvrir http://localhost:3000

## Tester l'API

```bash
curl -X POST http://localhost:3000/api/leads \
  -H "Content-Type: application/json" \
  -d '{"nom":"Jean Dupont","societe":"Acme","email":"jean@acme.fr","budget":15000,"score":85,"statut":"nouveau"}'
```

## Architecture

- `app/page.tsx` — dashboard (Server Component, lecture via service_role).
- `app/api/leads/route.ts` — `POST /api/leads` : valide et insère un lead.
- `lib/supabase-server.ts` — client Supabase **serveur uniquement** (service_role).

⚠️ La clé `service_role` n'est jamais exposée au navigateur : elle est lue
uniquement dans du code serveur et n'est pas préfixée par `NEXT_PUBLIC_`.
