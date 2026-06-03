import { getLeads } from "@/lib/queries";
import { LeadsTable } from "@/components/LeadsTable";

// Page rendue côté serveur à chaque requête (données toujours fraîches).
export const dynamic = "force-dynamic";

export default async function LeadsPage() {
  const { leads, error } = await getLeads();

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <header className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Leads</h1>
        <p className="mt-1 text-sm text-slate-500">
          {leads.length} lead{leads.length > 1 ? "s" : ""} · du plus récent au
          plus ancien
        </p>
      </header>

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Erreur de chargement : {error}
        </div>
      )}

      <LeadsTable leads={leads} />
    </main>
  );
}
