export type PlanTier = "diagnostic" | "pro" | "intelligence";

const PLAN_ORDER: Record<PlanTier, number> = {
  diagnostic: 0,
  pro: 1,
  intelligence: 2,
};

/**
 * true si `plan` incluye, al menos, las capacidades de `min`.
 * Ej: planAtLeast("pro", "diagnostic") -> true
 *     planAtLeast("diagnostic", "pro") -> false
 */
export function planAtLeast(plan: PlanTier, min: PlanTier): boolean {
  return PLAN_ORDER[plan] >= PLAN_ORDER[min];
}

export const PLAN_LABELS: Record<PlanTier, string> = {
  diagnostic: "Diagnostic",
  pro: "PRO",
  intelligence: "Intelligence",
};
