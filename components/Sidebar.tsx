"use client";

// Menu latéral de navigation. Client uniquement pour surligner le lien actif.
import Link from "next/link";
import { usePathname } from "next/navigation";

const LIENS = [
  { href: "/pilotage", label: "Pilotage", icon: "📊" },
  { href: "/leads", label: "Leads", icon: "👥" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-6 py-5">
        <span className="text-lg font-bold text-slate-900">CRM Leads</span>
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {LIENS.map((lien) => {
          const actif = pathname === lien.href;
          return (
            <Link
              key={lien.href}
              href={lien.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                actif
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <span className="text-base">{lien.icon}</span>
              {lien.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
