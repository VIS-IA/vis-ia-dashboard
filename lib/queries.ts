import { createClient } from "@/lib/supabase/server";
import type { DashboardData } from "@/lib/types";

/**
 * Loads the signed-in user's business + their most recent report,
 * and shapes it into the exact structure VisIaPanelInicio expects.
 * Returns null if the user has no client record or no report yet.
 */
export async function getDashboardData(): Promise<DashboardData | null> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // RLS ensures this only ever returns the caller's own row(s).
  const { data: client, error: clientError } = await supabase
    .from("clients")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (clientError || !client) return null;

  const { data: report, error: reportError } = await supabase
    .from("reports")
    .select("*")
    .eq("client_id", client.id)
    .order("analysis_date", { ascending: false })
    .limit(1)
    .single();

  if (reportError || !report) return null;

  const [{ data: metrics }, { data: losses }, { data: opportunities }, { data: actions }] =
    await Promise.all([
      supabase
        .from("metrics")
        .select("*")
        .eq("report_id", report.id)
        .order("sort_order", { ascending: true }),
      supabase
        .from("losses")
        .select("*")
        .eq("report_id", report.id)
        .order("sort_order", { ascending: true }),
      supabase
        .from("opportunities")
        .select("*")
        .eq("report_id", report.id)
        .order("sort_order", { ascending: true }),
      supabase
        .from("actions")
        .select("*")
        .eq("report_id", report.id)
        .order("sort_order", { ascending: true }),
    ]);

  const formattedDate = (value: string | null) =>
    value
      ? new Date(value).toLocaleDateString("es-ES", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      : "";

  const data: DashboardData = {
    business: {
      name: client.business_name,
      location: client.location,
      visId: client.client_code,
      logoInitial: client.business_name?.charAt(0)?.toUpperCase() ?? "?",
    },
    user: {
      name: client.contact_name ?? "Cliente",
      role: "Cliente",
    },
    lastAnalysis: formattedDate(report.analysis_date),
    nextAnalysis: formattedDate(report.next_analysis_date),
    visScore: {
      current: report.vis_score_current,
      previous: report.vis_score_previous,
      delta: report.vis_score_delta,
      status: report.vis_score_status,
      statusNote: report.vis_score_status_note ?? "",
    },
    detected: {
      perdidas: report.perdidas_count ?? losses?.length ?? 0,
      areas: report.areas_count ?? 0,
      oportunidades: report.oportunidades_count ?? opportunities?.length ?? 0,
    },
    accionRecomendada: {
      titulo: report.accion_recomendada_titulo ?? "",
      motivo: report.accion_recomendada_motivo ?? "",
    },
    metrics: (metrics ?? []).map((m) => ({
      icon_key: m.icon_key,
      label: m.label,
      value: m.value,
      suffix: m.suffix,
      stars: m.stars,
      previous: m.previous,
      delta: m.delta,
      accent: m.accent,
    })),
    perdidas: (losses ?? []).map((p) => ({
      icon_key: p.icon_key,
      titulo: p.titulo,
      descripcion: p.descripcion,
      impacto: p.impacto,
    })),
    oportunidades: (opportunities ?? []).map((o) => ({
      icon_key: o.icon_key,
      titulo: o.titulo,
      descripcion: o.descripcion,
      potencial: o.potencial,
    })),
    acciones: (actions ?? []).map((a) => ({
      texto: a.texto,
      prioridad: a.prioridad,
    })),
  };

  return data;
}

export interface ReportSummary {
  id: string;
  analysisDate: string;
  visScoreCurrent: number;
  visScoreStatus: string;
}

/**
 * Loads every report ever published for the signed-in user's business,
 * most recent first — used by the "Reportes" page and "Ver todos los
 * reportes" button.
 */
export async function getReportHistory(): Promise<ReportSummary[]> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data: client } = await supabase
    .from("clients")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!client) return [];

  const { data: reports } = await supabase
    .from("reports")
    .select("id, analysis_date, vis_score_current, vis_score_status")
    .eq("client_id", client.id)
    .order("analysis_date", { ascending: false });

  return (reports ?? []).map((r) => ({
    id: r.id,
    analysisDate: new Date(r.analysis_date).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }),
    visScoreCurrent: r.vis_score_current,
    visScoreStatus: r.vis_score_status,
  }));
}
