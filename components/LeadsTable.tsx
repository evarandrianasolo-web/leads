"use client";

// Table interactive : ajout / modification / suppression via les Route Handlers
// (fetch HTTP), jamais Supabase en direct. Après chaque mutation, router.refresh()
// ré-exécute la page serveur -> tableau ET graphiques rafraîchis.
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Lead } from "@/lib/supabase-server";
import { STATUTS, statutLabel, estChaud } from "@/lib/leads";
import { formatBudget, formatDate } from "@/lib/format";

// Un lead est "modifié" si updated_at dépasse created_at de plus d'une seconde.
function aEteModifie(lead: Lead): boolean {
  if (!lead.updated_at) return false;
  return (
    new Date(lead.updated_at).getTime() - new Date(lead.created_at).getTime() >
    1000
  );
}

type FormState = {
  nom: string;
  societe: string;
  email: string;
  budget: string;
  score: string;
  statut: string;
};

const FORM_VIDE: FormState = {
  nom: "",
  societe: "",
  email: "",
  budget: "",
  score: "",
  statut: STATUTS[0].value,
};

export function LeadsTable({ leads }: { leads: Lead[] }) {
  const router = useRouter();

  // null = modal fermée. Sinon on édite (id présent) ou on ajoute (id null).
  const [editionId, setEditionId] = useState<string | null | undefined>(undefined);
  const [form, setForm] = useState<FormState>(FORM_VIDE);
  const [enCours, setEnCours] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  const modalOuverte = editionId !== undefined;

  function ouvrirAjout() {
    setEditionId(null);
    setForm(FORM_VIDE);
    setErreur(null);
  }

  function ouvrirEdition(lead: Lead) {
    setEditionId(lead.id);
    setForm({
      nom: lead.nom,
      societe: lead.societe,
      email: lead.email,
      budget: String(lead.budget),
      score: String(lead.score),
      statut: lead.statut,
    });
    setErreur(null);
  }

  function fermer() {
    setEditionId(undefined);
    setErreur(null);
  }

  async function soumettre(e: React.FormEvent) {
    e.preventDefault();
    setEnCours(true);
    setErreur(null);

    const payload = {
      nom: form.nom,
      societe: form.societe,
      email: form.email,
      budget: Number(form.budget),
      score: Number(form.score),
      statut: form.statut,
    };

    // Ajout -> POST /api/leads ; édition -> PATCH /api/leads/[id]
    const url = editionId ? `/api/leads/${editionId}` : "/api/leads";
    const method = editionId ? "PATCH" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const details = Array.isArray(data.details)
          ? ` ${data.details.join(" ")}`
          : "";
        throw new Error((data.error ?? "Erreur") + details);
      }
      fermer();
      router.refresh(); // rafraîchit liste + graphiques
    } catch (err) {
      setErreur(err instanceof Error ? err.message : "Erreur inconnue.");
    } finally {
      setEnCours(false);
    }
  }

  async function supprimer(lead: Lead) {
    if (!window.confirm(`Supprimer le lead « ${lead.nom} » ?`)) return;
    try {
      const res = await fetch(`/api/leads/${lead.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Suppression impossible.");
      router.refresh();
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Erreur.");
    }
  }

  return (
    <section>
      <div className="mb-3 flex items-center justify-end">
        <button
          onClick={ouvrirAjout}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
        >
          + Ajouter un lead
        </button>
      </div>

      {leads.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-500">
          Aucun lead pour le moment.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <th className="px-4 py-3">Nom</th>
                <th className="px-4 py-3">Société</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3 text-right">Budget</th>
                <th className="px-4 py-3 text-right">Score</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3">Température</th>
                <th className="px-4 py-3">Dates</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-900">{lead.nom}</td>
                  <td className="px-4 py-3 text-slate-600">{lead.societe}</td>
                  <td className="px-4 py-3 text-slate-600">{lead.email}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-slate-700">
                    {formatBudget(lead.budget)}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums font-semibold text-slate-900">
                    {lead.score}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                      {statutLabel(lead.statut)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {estChaud(lead.score) ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-semibold text-orange-700">
                        🔥 Chaud
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-sky-100 px-2.5 py-0.5 text-xs font-semibold text-sky-700">
                        ❄️ Froid
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500">
                    <div>Créé le {formatDate(lead.created_at)}</div>
                    {aEteModifie(lead) && lead.updated_at && (
                      <div className="text-slate-400">
                        modifié le {formatDate(lead.updated_at)}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => ouvrirEdition(lead)}
                        className="rounded-md border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-100"
                      >
                        Modifier
                      </button>
                      <button
                        onClick={() => supprimer(lead)}
                        className="rounded-md border border-red-200 px-2.5 py-1 text-xs font-medium text-red-600 transition hover:bg-red-50"
                      >
                        Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal d'ajout / modification */}
      {modalOuverte && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="mb-4 text-lg font-semibold text-slate-900">
              {editionId ? "Modifier le lead" : "Ajouter un lead"}
            </h3>

            <form onSubmit={soumettre} className="space-y-3">
              <Champ
                label="Nom"
                value={form.nom}
                onChange={(v) => setForm({ ...form, nom: v })}
                required
              />
              <Champ
                label="Société"
                value={form.societe}
                onChange={(v) => setForm({ ...form, societe: v })}
                required
              />
              <Champ
                label="Email"
                type="email"
                value={form.email}
                onChange={(v) => setForm({ ...form, email: v })}
                required
              />
              <div className="grid grid-cols-2 gap-3">
                <Champ
                  label="Budget (€)"
                  type="number"
                  value={form.budget}
                  onChange={(v) => setForm({ ...form, budget: v })}
                  required
                />
                <Champ
                  label="Score (0–100)"
                  type="number"
                  value={form.score}
                  onChange={(v) => setForm({ ...form, score: v })}
                  min={0}
                  max={100}
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Statut
                </label>
                <select
                  value={form.statut}
                  onChange={(e) => setForm({ ...form, statut: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  {STATUTS.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              {erreur && (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                  {erreur}
                </p>
              )}

              <div className="mt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={fermer}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={enCours}
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-60"
                >
                  {enCours ? "Enregistrement…" : "Enregistrer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}

// Petit champ de formulaire réutilisable.
function Champ({
  label,
  value,
  onChange,
  type = "text",
  required,
  min,
  max,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  min?: number;
  max?: number;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-slate-700">
        {label}
      </label>
      <input
        type={type}
        value={value}
        required={required}
        min={min}
        max={max}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
      />
    </div>
  );
}
