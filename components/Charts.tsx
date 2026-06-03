"use client";

// Composants graphiques (Recharts). Reçoivent des données DÉJÀ agrégées
// côté serveur (page.tsx) — aucun accès Supabase ici.
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { formatBudget } from "@/lib/format";

// Données par statut : { label, count, budget }
type StatutDatum = { label: string; count: number; budget: number };
type HotColdDatum = { name: string; value: number };
type TimeDatum = { label: string; count: number };

// Palette alignée sur le thème (orange = chaud, sky = froid, etc.).
const COULEUR_CHAUD = "#f97316";
const COULEUR_FROID = "#0ea5e9";
const COULEUR_STATUT = "#6366f1";
const COULEUR_BUDGET = "#10b981";
const COULEUR_TEMPS = "#8b5cf6";

// Carte conteneur réutilisable pour homogénéiser le style (arrondi, ombre légère).
function ChartCard({
  titre,
  children,
}: {
  titre: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="mb-3 text-sm font-semibold text-slate-700">{titre}</h3>
      <div className="h-60">
        <ResponsiveContainer width="100%" height="100%">
          {children as React.ReactElement}
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function Charts({
  parStatut,
  hotCold,
  parJour,
}: {
  parStatut: StatutDatum[];
  hotCold: HotColdDatum[];
  parJour: TimeDatum[];
}) {
  return (
    <div className="mb-8 grid grid-cols-1 gap-4 lg:grid-cols-2">
      {/* Répartition des leads par statut (barres) */}
      <ChartCard titre="Leads par statut">
        <BarChart data={parStatut}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="label" tick={{ fontSize: 12, fill: "#64748b" }} />
          <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "#64748b" }} />
          <Tooltip />
          <Bar dataKey="count" name="Leads" fill={COULEUR_STATUT} radius={[6, 6, 0, 0]} />
        </BarChart>
      </ChartCard>

      {/* Répartition Chaud / Froid (donut) */}
      <ChartCard titre="Chaud / Froid">
        <PieChart>
          <Pie
            data={hotCold}
            dataKey="value"
            nameKey="name"
            innerRadius={55}
            outerRadius={85}
            paddingAngle={2}
            label
          >
            {hotCold.map((entry) => (
              <Cell
                key={entry.name}
                fill={entry.name === "Chaud" ? COULEUR_CHAUD : COULEUR_FROID}
              />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ChartCard>

      {/* Budget total par statut = valeur du pipeline (barres) */}
      <ChartCard titre="Valeur du pipeline par statut">
        <BarChart data={parStatut}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="label" tick={{ fontSize: 12, fill: "#64748b" }} />
          <YAxis
            tick={{ fontSize: 12, fill: "#64748b" }}
            tickFormatter={(v) => `${Math.round(v / 1000)}k`}
          />
          <Tooltip formatter={(v) => formatBudget(Number(v))} />
          <Bar dataKey="budget" name="Budget" fill={COULEUR_BUDGET} radius={[6, 6, 0, 0]} />
        </BarChart>
      </ChartCard>

      {/* Leads créés dans le temps (aire) */}
      <ChartCard titre="Leads créés dans le temps">
        <AreaChart data={parJour}>
          <defs>
            <linearGradient id="gradTemps" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={COULEUR_TEMPS} stopOpacity={0.4} />
              <stop offset="95%" stopColor={COULEUR_TEMPS} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="label" tick={{ fontSize: 12, fill: "#64748b" }} />
          <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "#64748b" }} />
          <Tooltip />
          <Area
            type="monotone"
            dataKey="count"
            name="Leads"
            stroke={COULEUR_TEMPS}
            fill="url(#gradTemps)"
            strokeWidth={2}
          />
        </AreaChart>
      </ChartCard>
    </div>
  );
}
