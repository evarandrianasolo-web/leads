// Helpers de formatage partagés (serveur + client).

// Montant en euros, sans décimales : 42 000 €
export function formatBudget(budget: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(budget);
}

// Date longue lisible : 12 mars 2026
export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
}

// Date courte pour les axes de graphiques : 12 mars
export function formatDateShort(iso: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "short",
  }).format(new Date(iso));
}
