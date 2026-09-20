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

// El asistente VIS es, de fondo, un beneficio del plan Intelligence.
// Diagnostic y Pro lo reciben gratis solo su primer mes (una prueba),
// contado desde la primera vez que ese negocio lo usó — nunca desde
// que se re-suscribe. Intelligence lo tiene siempre.
export const VIS_TRIAL_DAYS = 30;

/**
 * true si este cliente puede usar el asistente VIS ahora mismo.
 * - Intelligence: siempre true.
 * - Diagnostic/Pro sin haber empezado su mes de prueba (trialStartedAt
 *   null): true — se cuenta que este primer uso lo empieza.
 * - Diagnostic/Pro dentro de su mes de prueba: true.
 * - Diagnostic/Pro con el mes de prueba ya vencido: false.
 */
export function hasVisAssistantAccess(plan: PlanTier, trialStartedAt: string | null): boolean {
  if (planAtLeast(plan, "intelligence")) return true;
  if (!trialStartedAt) return true;

  const startedMs = new Date(trialStartedAt).getTime();
  if (Number.isNaN(startedMs)) return true;

  const elapsedDays = (Date.now() - startedMs) / (1000 * 60 * 60 * 24);
  return elapsedDays <= VIS_TRIAL_DAYS;
}

/** Fecha (ISO) en la que vence el mes de prueba de VIS, o null si no aplica. */
export function visTrialEndsAt(trialStartedAt: string | null): string | null {
  if (!trialStartedAt) return null;
  const startedMs = new Date(trialStartedAt).getTime();
  if (Number.isNaN(startedMs)) return null;
  return new Date(startedMs + VIS_TRIAL_DAYS * 24 * 60 * 60 * 1000).toISOString();
}
