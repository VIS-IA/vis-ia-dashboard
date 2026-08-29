import { createClient } from "@/lib/supabase/server";
import type {
  DashboardData,
  ReputationDetail,
  ExperienceDetail,
  Competitor,
} from "@/lib/types";

/**
 * Loads the signed-in user's business + their most recent report,
 * and shapes it into the exact structure VisIaPanelInicio expects.
 * Returns null if the user has no client record or no report yet.
 */
export async function getDashboardData(): Promise<DashboardData | null> {
  try {
    return await loadDashboardData();
  } catch {
    // A timed-out or failed request to Supabase should never crash the
    // page — show the "no hay análisis disponible" state instead.
    return null;
  }
}

async function loadDashboardData(): Promise<DashboardData | null> {
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

  // El "próximo análisis" siempre es exactamente un mes después de la
  // fecha real del análisis — no depende de un campo que haya que
  // llenar a mano en la matriz, así nunca queda desactualizado.
  const nextAnalysisDate = (() => {
    const base = new Date(report.analysis_date);
    const next = new Date(base);
    next.setMonth(next.getMonth() + 1);
    // Si el mes siguiente es más corto (ej. 31 de enero -> 31 de
    // febrero no existe), JS lo empuja a marzo. Esto lo corrige para
    // que caiga en el último día del mes siguiente en vez de saltar.
    if (next.getDate() !== base.getDate()) {
      next.setDate(0);
    }
    return next;
  })();

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
    nextAnalysis: formattedDate(nextAnalysisDate.toISOString()),
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
      detalle: a.detalle ?? null,
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
  try {
    return await loadReportHistory();
  } catch {
    return [];
  }
}

async function loadReportHistory(): Promise<ReportSummary[]> {
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

/** Shared helper: returns the current user's latest report id, or null. */
async function getLatestReportId(): Promise<string | null> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: client } = await supabase
    .from("clients")
    .select("id")
    .eq("user_id", user.id)
    .single();
  if (!client) return null;

  const { data: report } = await supabase
    .from("reports")
    .select("id")
    .eq("client_id", client.id)
    .order("analysis_date", { ascending: false })
    .limit(1)
    .single();

  return report?.id ?? null;
}

/**
 * Reputation detail for the "Reputación" page. Returns null if no
 * reputation_details row has been loaded for the latest report yet.
 */
export async function getReputationDetail(): Promise<ReputationDetail | null> {
  try {
    const reportId = await getLatestReportId();
    if (!reportId) return null;

    const supabase = createClient();
    const { data } = await supabase
      .from("reputation_details")
      .select("*")
      .eq("report_id", reportId)
      .single();

    if (!data) return null;

    return {
      avgRating: data.avg_rating,
      avgRatingPrevious: data.avg_rating_previous,
      totalReviews: data.total_reviews,
      totalReviewsPrevious: data.total_reviews_previous,
      positiveCount: data.positive_count,
      neutralCount: data.neutral_count,
      negativeCount: data.negative_count,
      responseRatePercent: data.response_rate_percent,
      unrespondedNegative: data.unresponded_negative,
    };
  } catch {
    return null;
  }
}

/**
 * Customer experience detail for the "Experiencia del Cliente" page.
 * Returns null if no experience_details row exists yet.
 */
export async function getExperienceDetail(): Promise<ExperienceDetail | null> {
  try {
    const reportId = await getLatestReportId();
    if (!reportId) return null;

    const supabase = createClient();
    const { data } = await supabase
      .from("experience_details")
      .select("*")
      .eq("report_id", reportId)
      .single();

    if (!data) return null;

    return {
      avgResponseTimeLabel: data.avg_response_time_label,
      avgResponseTimePreviousLabel: data.avg_response_time_previous_label,
      satisfactionScore: data.satisfaction_score,
      satisfactionPrevious: data.satisfaction_previous,
      totalInteractions: data.total_interactions,
      totalInteractionsPrevious: data.total_interactions_previous,
    };
  } catch {
    return null;
  }
}

/**
 * Competitor comparison rows for the "Competencia" page. Returns an
 * empty array if no competitors have been loaded yet.
 */
export async function getCompetitors(): Promise<Competitor[]> {
  try {
    const reportId = await getLatestReportId();
    if (!reportId) return [];

    const supabase = createClient();
    const { data } = await supabase
      .from("competitors")
      .select("*")
      .eq("report_id", reportId)
      .order("sort_order", { ascending: true });

    return (data ?? []).map((c) => ({
      name: c.name,
      rating: c.rating,
      reviewCount: c.review_count,
      notes: c.notes,
      isYou: c.is_you,
    }));
  } catch {
    return [];
  }
}
