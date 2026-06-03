import { getLeads } from "@/lib/queries";
import { STATUTS, estChaud } from "@/lib/leads";
import { formatBudget, formatDateShort } from "@/lib/format";
import { Charts } from "@/components/Charts";

// Page rendue côté serveur à chaque requête (données toujours fraîches).
export const dynamic = "force-dynamic";

// Petite carte KPI (rendue côté serveur).
function Kpi({ label, valeur }: { label: string; valeur: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </div>
      <div className="mt-1 text-2xl font-bold text-slate-900">{valeur}</div>
    </div>
  );
}

export default async function PilotagePage() {
  const { leads, error } = await getLeads();

  // --- Agrégations côté serveur (passées telles quelles aux graphiques client) ---
  const total = leads.length;
  const chauds = leads.filter((l) => estChaud(l.score)).length;
  const budgetTotal = leads.reduce((s, l) => s + (l.budget ?? 0), 0);
  const scoreMoyen = total
    ? Math.round(leads.reduce((s, l) => s + l.score, 0) / total)
    : 0;

  // Comptage et budget cumulé par statut canonique.
  const parStatut = STATUTS.map((s) => {
    const duStatut = leads.filter((l) => l.statut === s.value);
    return {
      label: s.label,
      count: duStatut.length,
      budget: duStatut.reduce((a, l) => a + (l.budget ?? 0), 0),
    };
  });

  const hotCold = [
    { name: "Chaud", value: chauds },
    { name: "Froid", value: total - chauds },
  ];

  // Leads créés par jour (clé YYYY-MM-DD), triés chronologiquement.
  const compteurJour = new Map<string, number>();
  for (const l of leads) {
    const jour = l.created_at.slice(0, 10);
    compteurJour.set(jour, (compteurJour.get(jour) ?? 0) + 1);
  }
  const parJour = Array.from(compteurJour.keys())
    .sort()
    .map((jour) => ({ label: formatDateShort(jour), count: compteurJour.get(jour)! }));

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Pilotage</h1>
        <p className="mt-1 text-sm text-slate-500">Indicateurs et graphiques</p>
      </header>

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Erreur de chargement : {error}
        </div>
      )}

      {/* 4 cartes KPI */}
      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Kpi label="Total leads" valeur={String(total)} />
        <Kpi label="Leads chauds" valeur={String(chauds)} />
        <Kpi label="Pipeline" valeur={formatBudget(budgetTotal)} />
        <Kpi label="Score moyen" valeur={String(scoreMoyen)} />
      </div>

      {/* Graphiques (composants client, données agrégées côté serveur) */}
      <Charts parStatut={parStatut} hotCold={hotCold} parJour={parJour} />
    </main>
  );
}
