// Constantes métier partagées (serveur + client).

// Statuts canoniques : `value` est stocké en base (compatible Make + défaut 'nouveau'),
// `label` est l'étiquette affichée dans l'UI.
export const STATUTS = [
  { value: "nouveau", label: "Nouveau" },
  { value: "en discussion", label: "En Discussion" },
  { value: "qualifie", label: "Qualifié" },
  { value: "perdu", label: "Perdu" },
] as const;

export const STATUT_VALUES = STATUTS.map((s) => s.value) as string[];

// Étiquette affichable d'un statut (repli sur la valeur brute si inconnue).
export function statutLabel(value: string): string {
  return STATUTS.find((s) => s.value === value)?.label ?? value;
}

// Seuil au-delà duquel un lead est "chaud".
export const SEUIL_CHAUD = 80;
export const estChaud = (score: number): boolean => score >= SEUIL_CHAUD;
