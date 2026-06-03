import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";

// Route Handler exécuté côté serveur uniquement (la clé service_role n'est jamais exposée).
// On force l'exécution dynamique : pas de mise en cache de l'insertion.
export const dynamic = "force-dynamic";

// GET /api/leads
// Renvoie les leads du plus récent au plus ancien (lecture serveur via service_role).
// Paramètre optionnel : ?limit=50 (1–500, défaut 100) pour limiter le nombre de lignes.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  // Parsing/bornage du paramètre limit.
  let limit = 100;
  const limitParam = searchParams.get("limit");
  if (limitParam !== null) {
    const parsed = Number(limitParam);
    if (!Number.isInteger(parsed) || parsed < 1 || parsed > 500) {
      return NextResponse.json(
        { error: "limit doit être un entier entre 1 et 500." },
        { status: 400 }
      );
    }
    limit = parsed;
  }

  const { data, error } = await supabaseAdmin
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    return NextResponse.json(
      { error: "Échec de la lecture en base.", details: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json(data, { status: 200 });
}

// POST /api/leads
// Corps attendu : { nom, societe, email, budget, score, statut? }
export async function POST(request: Request) {
  // 1) Parsing du JSON (corps illisible -> 400)
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Corps de requête JSON invalide." },
      { status: 400 }
    );
  }

  const { nom, societe, email, budget, score, statut } =
    (body ?? {}) as Record<string, unknown>;

  // 2) Validation des champs requis
  const erreurs: string[] = [];

  if (typeof nom !== "string" || nom.trim() === "")
    erreurs.push("nom (texte) est requis.");
  if (typeof societe !== "string" || societe.trim() === "")
    erreurs.push("societe (texte) est requis.");
  if (typeof email !== "string" || !email.includes("@"))
    erreurs.push("email valide est requis.");
  if (typeof budget !== "number" || Number.isNaN(budget))
    erreurs.push("budget (nombre) est requis.");
  if (
    typeof score !== "number" ||
    !Number.isInteger(score) ||
    score < 0 ||
    score > 100
  )
    erreurs.push("score (entier 0–100) est requis.");
  // statut est optionnel : s'il est fourni, ce doit être une chaîne non vide.
  if (statut !== undefined && (typeof statut !== "string" || statut.trim() === ""))
    erreurs.push("statut, s'il est fourni, doit être un texte non vide.");

  if (erreurs.length > 0) {
    return NextResponse.json(
      { error: "Validation échouée.", details: erreurs },
      { status: 400 }
    );
  }

  // 3) Insertion côté serveur. On laisse Supabase appliquer le défaut de statut.
  const ligne = {
    nom: (nom as string).trim(),
    societe: (societe as string).trim(),
    email: (email as string).trim(),
    budget: budget as number,
    score: score as number,
    ...(statut !== undefined ? { statut: (statut as string).trim() } : {}),
  };

  const { data, error } = await supabaseAdmin
    .from("leads")
    .insert(ligne)
    .select()
    .single();

  if (error) {
    return NextResponse.json(
      { error: "Échec de l'insertion en base.", details: error.message },
      { status: 500 }
    );
  }

  // 4) On renvoie la ligne créée
  return NextResponse.json(data, { status: 201 });
}
