import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { STATUT_VALUES } from "@/lib/leads";

// Route Handlers serveur uniquement (service_role jamais exposée au client).
export const dynamic = "force-dynamic";

// PATCH /api/leads/[id] — mise à jour partielle d'un lead.
// Corps : sous-ensemble de { nom, societe, email, budget, score, statut }.
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

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

  const updates: Record<string, unknown> = {};
  const erreurs: string[] = [];

  // On valide uniquement les champs réellement fournis (mise à jour partielle).
  if (nom !== undefined) {
    if (typeof nom !== "string" || nom.trim() === "")
      erreurs.push("nom doit être un texte non vide.");
    else updates.nom = nom.trim();
  }
  if (societe !== undefined) {
    if (typeof societe !== "string" || societe.trim() === "")
      erreurs.push("societe doit être un texte non vide.");
    else updates.societe = societe.trim();
  }
  if (email !== undefined) {
    if (typeof email !== "string" || !email.includes("@"))
      erreurs.push("email doit être valide.");
    else updates.email = email.trim();
  }
  if (budget !== undefined) {
    if (typeof budget !== "number" || Number.isNaN(budget))
      erreurs.push("budget doit être un nombre.");
    else updates.budget = budget;
  }
  if (score !== undefined) {
    if (
      typeof score !== "number" ||
      !Number.isInteger(score) ||
      score < 0 ||
      score > 100
    )
      erreurs.push("score doit être un entier 0–100.");
    else updates.score = score;
  }
  if (statut !== undefined) {
    if (typeof statut !== "string" || !STATUT_VALUES.includes(statut))
      erreurs.push(`statut doit être l'un de : ${STATUT_VALUES.join(", ")}.`);
    else updates.statut = statut;
  }

  if (erreurs.length > 0) {
    return NextResponse.json(
      { error: "Validation échouée.", details: erreurs },
      { status: 400 }
    );
  }
  if (Object.keys(updates).length === 0) {
    return NextResponse.json(
      { error: "Aucun champ à mettre à jour." },
      { status: 400 }
    );
  }

  // On horodate la modification (le défaut now() ne s'applique qu'à l'insertion).
  updates.updated_at = new Date().toISOString();

  const { data, error } = await supabaseAdmin
    .from("leads")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    // PGRST116 = aucune ligne trouvée par .single()
    if (error.code === "PGRST116") {
      return NextResponse.json({ error: "Lead introuvable." }, { status: 404 });
    }
    return NextResponse.json(
      { error: "Échec de la mise à jour.", details: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json(data, { status: 200 });
}

// DELETE /api/leads/[id] — suppression d'un lead.
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const { error } = await supabaseAdmin.from("leads").delete().eq("id", id);

  if (error) {
    return NextResponse.json(
      { error: "Échec de la suppression.", details: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true }, { status: 200 });
}
