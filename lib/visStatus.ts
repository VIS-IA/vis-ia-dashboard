/**
 * Presentación del estado del VIS Score (reports.vis_score_status) para
 * el cliente final. El valor guardado en la base de datos es un código
 * interno (viene del motor de cálculo / vis_score_runs) — nunca se le
 * muestra crudo al cliente (evita cosas como "REVISAR_TENDENCIA" con
 * guion bajo en una insignia).
 *
 * IMPORTANTE: esta tabla es solo de PRESENTACIÓN. No decide umbrales de
 * tendencia (eso sigue pendiente de metodología, ver vis_sync_run_to_report
 * en Supabase) — solo traduce el código ya calculado a un texto y color
 * legibles. Un código nuevo que no esté aquí cae en el "default" en vez
 * de romper la página.
 */
export const VIS_STATUS_LABELS: Record<string, string> = {
  MEJORANDO: "Mejorando",
  ESTABLE: "Estable",
  DECLINANDO: "Necesita atención",
  LINEA_BASE: "Primera medición",
  REVISAR_TENDENCIA: "Tendencia en revisión",
  PENDIENTE: "Pendiente",
};

export const VIS_STATUS_BADGE_CLASSES: Record<string, string> = {
  MEJORANDO: "bg-emerald-500",
  ESTABLE: "bg-slate-500",
  DECLINANDO: "bg-red-500",
  LINEA_BASE: "bg-blue-500",
  REVISAR_TENDENCIA: "bg-blue-500",
  PENDIENTE: "bg-amber-500",
};

const DEFAULT_LABEL_STYLE = { label: "En revisión", badgeClass: "bg-slate-500" };

export function getVisStatusPresentation(status: string | null | undefined): {
  label: string;
  badgeClass: string;
} {
  if (!status) return DEFAULT_LABEL_STYLE;
  return {
    label: VIS_STATUS_LABELS[status] ?? DEFAULT_LABEL_STYLE.label,
    badgeClass: VIS_STATUS_BADGE_CLASSES[status] ?? DEFAULT_LABEL_STYLE.badgeClass,
  };
}
