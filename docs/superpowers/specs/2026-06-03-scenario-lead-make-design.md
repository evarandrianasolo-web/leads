# Design — Scénario Make « Enregistrer un lead » (ID 9333019)

Date : 2026-06-03

## Objectif

Depuis une phrase en langage naturel tapée dans le chat Claude
(ex : « J'ai un nouveau lead : Marie, email marie@x.com, budget 10 000,
notes : CEO chez X, intéressée par l'offre conseil »), enregistrer
automatiquement le lead dans le CRM, calculer un score de qualité, et
notifier par e-mail et sur Slack.

## Décisions

| Décision | Choix |
|----------|-------|
| Déclenchement | Claude envoie le **texte brut** au webhook Make |
| Parse + score | **OpenAI dans le scénario** (un seul appel) |
| CRM | `POST https://leads-three-blush.vercel.app/api/leads` |
| Mail | Notification récap à soi (`eva.randrianasolo@gmail.com`) |
| Slack | Canal `#general` (espace `monespacedetests.slack.com`) |
| Scoring | Budget + séniorité du contact + intention (entier 0–100) |

## Architecture (approche retenue : A — un seul appel IA)

```
Webhook (texte brut)
  → OpenAI (extrait nom/societe/email/budget + calcule score → JSON)
  → HTTP POST /api/leads
  → Gmail (notif récap)
  → Slack #general (notif)
```

Approches écartées :
- **B** — deux appels IA (parse puis score) : double coût/latence, aucun gain (YAGNI).
- **C** — Router pour mail + Slack en parallèle : superflu pour 2 notifs, chaînage séquentiel suffit.

## Modules (config réelle déployée)

1. **Webhook** `gateway:CustomWebHook` v1 — hook existant `4173291`. Reçoit `{ "text": "..." }`.
   URL : `https://hook.eu2.make.com/jp01c6y7euky3hl721a8snky4xriq7qp`.
2. **OpenAI** `openai-gpt-3:CreateCompletion` v1 — conn `13380890` (`__IMTCONN__` = ID numérique),
   `select: chat`, `model: gpt-4o-mini`, `response_format: json_object` + `parseJSONResponse: true`,
   `max_tokens: 800`, `temperature: 0.2`.
   Sortie JSON parsée → accessible via `{{2.result.X}}` : `nom`, `societe`, `email`,
   `budget` (nombre), `score` (entier 0–100), `resume` (1 phrase).
   Scoring = budget (haut = mieux) + séniorité (CEO/décideur = mieux)
   + intention exprimée dans les notes (intérêt clair = mieux).
3. **HTTP** `http:ActionSendData` v3 — `POST /api/leads`. ⚠️ Pièges Make v3 :
   `method: "post"` (minuscule), pas de `bodyType: "json"` → utiliser
   `bodyType: "raw"` + `contentType: "application/json"` + le JSON dans `data`
   (pas `body`). De plus 8 booléens sont **obligatoires** : `serializeUrl`,
   `shareCookies`, `rejectUnauthorized` (true), `followRedirect` (true),
   `followAllRedirects`, `useQuerystring`, `gzip` (true), `useMtls`.
   `data` = `{"nom":"{{2.result.nom}}","societe":"{{2.result.societe}}","email":"{{2.result.email}}","budget":{{2.result.budget}},"score":{{2.result.score}}}`.
   `statut` omis → la base applique sa valeur par défaut.
4. **Gmail** `google-email:ActionSendEmail` **v1** — param `account` = `13815124`
   (connexion type « google », scope mail.google.com ; la conn `13356405` type
   « google-email » n'est PAS compatible avec ce module). `to` = `["eva.randrianasolo@gmail.com"]`,
   `subject`, `html` (corps HTML récap).
5. **Slack** `slack:CreateMessage` **v4** — conn `14061834` (`__IMTCONN__` = ID numérique),
   `channelWType: manualy`, `channel: "C0AJ1G5A2MS"` (canal `tous-mon-espace-de-tests` ;
   il n'existe PAS de canal `#general` dans l'espace — utiliser l'ID encodé, plus robuste),
   `text` récap court.

## Statut

Déployé, activé et **testé end-to-end avec succès** le 2026-06-03 (lead Marie créé,
email envoyé, message Slack posté ; leads de test ensuite supprimés). Le scénario
est actif.

## Contraintes du endpoint `/api/leads` (POST)

Champs requis : `nom` (texte), `societe` (texte), `email` (avec `@`),
`budget` (nombre), `score` (entier 0–100). `statut` optionnel.
Pas d'authentification (aucun header `x-api-key` attendu).

## Points d'attention

- Le webhook doit être « re-déterminé » par Make au 1er envoi (structure des données).
- Pas de gestion d'erreur dédiée (volontaire).
- Vérifier le nom/version exact du module Slack à la construction.
