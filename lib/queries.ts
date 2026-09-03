import { createClient } from "@/lib/supabase/server";
import type { PlanTier } from "@/lib/plan";
import type {
  DashboardData,
  DashboardMetric,
  ReputationDetail,
  ExperienceDetail,
  Competitor,
  OtherReputation,
  OnboardingQuestion,
  OnboardingAnswerValue,
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

/**
 * Shared helper: returns the current user's client id, latest report,
 * and the report right before it (for computing month-over-month
 * changes automatically). previousReportId is null on a client's very
 * first report.
 */
async function getReportContext(): Promise<{
  clientId: string;
  businessType: "negocio" | "restaurante" | "hotel";
  latestReportId: string;
  previousReportId: string | null;
} | null> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: client } = await supabase
    .from("clients")
    .select("id, business_type")
    .eq("user_id", user.id)
    .single();
  if (!client) return null;

  const { data: reports } = await supabase
    .from("reports")
    .select("id")
    .eq("client_id", client.id)
    .order("analysis_date", { ascending: false })
    .limit(2);

  if (!reports || reports.length === 0) return null;

  return {
    clientId: client.id,
    businessType:
      (client.business_type as "negocio" | "restaurante" | "hotel") ?? "negocio",
    latestReportId: reports[0].id,
    previousReportId: reports[1]?.id ?? null,
  };
}

async function loadDashboardData(): Promise<DashboardData | null> {
  const supabase = createClient();

  const context = await getReportContext();
  if (!context) return null;

  const { data: client } = await supabase
    .from("clients")
    .select("*")
    .eq("id", context.clientId)
    .single();
  if (!client) return null;

  const { data: report } = await supabase
    .from("reports")
    .select("*")
    .eq("id", context.latestReportId)
    .single();
  if (!report) return null;

  const [{ data: losses }, { data: opportunities }, { data: actions }, metrics] =
    await Promise.all([
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
      loadMetrics(context.latestReportId, context.previousReportId),
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
    resumenEjecutivo: report.resumen_ejecutivo ?? null,
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
    metrics,
    perdidas: (losses ?? []).map((p) => ({
      icon_key: p.icon_key,
      titulo: p.titulo,
      descripcion: p.descripcion,
      impacto: p.impacto,
      evidencia: p.evidencia ?? null,
      causaProbable: p.causa_probable ?? null,
      nivelCerteza: p.nivel_certeza ?? null,
    })),
    oportunidades: (opportunities ?? []).map((o) => ({
      icon_key: o.icon_key,
      titulo: o.titulo,
      descripcion: o.descripcion,
      potencial: o.potencial,
      evidencia: o.evidencia ?? null,
      causaProbable: o.causa_probable ?? null,
      nivelCerteza: o.nivel_certeza ?? null,
    })),
    acciones: (actions ?? []).map((a) => ({
      texto: a.texto,
      prioridad: a.prioridad,
      detalle: a.detalle ?? null,
      problema: a.problema ?? null,
      evidencia: a.evidencia ?? null,
      causaProbable: a.causa_probable ?? null,
      nivelCerteza: a.nivel_certeza ?? null,
      metrica: a.metrica ?? null,
      fechaRevision: a.fecha_revision
        ? new Date(a.fecha_revision).toLocaleDateString("es-ES", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })
        : null,
    })),
  };

  return data;
}

/**
 * MÉTRICAS — LA FÓRMULA AUTOMÁTICA
 * ----------------------------------
 * Cada mes, en la matriz solo se escribe UN número por métrica
 * (metric_values.value_numeric). Todo lo demás — el ícono, la
 * etiqueta, el "Anterior: X", y el cambio ("+8", "+26%") — se
 * calcula aquí solo, comparando contra el valor de esa misma métrica
 * en el reporte anterior del mismo cliente.
 */
async function loadMetrics(
  latestReportId: string,
  previousReportId: string | null
): Promise<DashboardMetric[]> {
  const supabase = createClient();

  const [{ data: currentRows }, previousRowsResult] = await Promise.all([
    supabase
      .from("metric_values")
      .select("*, metric_definitions(*)")
      .eq("report_id", latestReportId)
      .order("metric_definitions(sort_order)", { ascending: true }),
    previousReportId
      ? supabase
          .from("metric_values")
          .select("metric_key, value_numeric")
          .eq("report_id", previousReportId)
      : Promise.resolve({ data: [] as { metric_key: string; value_numeric: number }[] }),
  ]);

  const previousByKey = new Map<string, number>();
  for (const row of previousRowsResult.data ?? []) {
    previousByKey.set(row.metric_key, row.value_numeric);
  }

  const formatNumber = (n: number) => Math.round(n).toLocaleString("en-US");

  return (currentRows ?? []).map((row: any) => {
    const def = row.metric_definitions;
    const current: number = row.value_numeric;
    const previous = previousByKey.get(row.metric_key) ?? null;

    const value = def.is_rating
      ? current.toFixed(1)
      : def.unit === "/100"
      ? Math.round(current).toString()
      : formatNumber(current);

    let previousLabel = "Primer reporte";
    let deltaLabel = "";

    if (previous !== null) {
      previousLabel = def.is_rating
        ? `Anterior: ${previous.toFixed(1)}`
        : def.unit === "/100"
        ? `Anterior: ${Math.round(previous)}/100`
        : `Anterior: ${formatNumber(previous)}`;

      if (def.delta_style === "percent" && previous !== 0) {
        const pct = Math.round(((current - previous) / previous) * 100);
        deltaLabel = `${pct > 0 ? "+" : ""}${pct}%`;
      } else {
        const diff = def.is_rating
          ? Math.round((current - previous) * 10) / 10
          : Math.round(current - previous);
        deltaLabel = `${diff > 0 ? "+" : ""}${diff}`;
      }
    }

    return {
      icon_key: def.icon_key,
      label: def.label,
      value,
      suffix: def.unit === "/100" ? "/100" : null,
      stars: def.is_rating ? current : null,
      previous: previousLabel,
      delta: deltaLabel,
      accent: def.accent,
    };
  });
}

export interface ReportSummary {
  id: string;
  analysisDate: string;
  visScoreCurrent: number | null;
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

/**
 * Reputation detail for the "Reputación" page. Returns null if no
 * reputation_details row has been loaded for the latest report yet.
 */
export async function getReputationDetail(): Promise<ReputationDetail | null> {
  try {
    const context = await getReportContext();
    if (!context) return null;

    const supabase = createClient();
    const { data } = await supabase
      .from("reputation_details")
      .select("*")
      .eq("report_id", context.latestReportId)
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
 * Reads from a different table depending on the client's business
 * type — negocios normales (basado en menciones de servicio dentro
 * de reseñas) vs hoteles (subcalificaciones reales de Booking /
 * Expedia / TripAdvisor). "Previous" values come from the client's
 * previous report automatically, not typed by hand.
 */
export async function getExperienceDetail(): Promise<ExperienceDetail | null> {
  try {
    const context = await getReportContext();
    if (!context) return null;

    const supabase = createClient();

    if (context.businessType === "hotel") {
      const [{ data: current }, prev] = await Promise.all([
        supabase
          .from("experience_hotel")
          .select("*")
          .eq("report_id", context.latestReportId)
          .single(),
        context.previousReportId
          ? supabase
              .from("experience_hotel")
              .select("*")
              .eq("report_id", context.previousReportId)
              .single()
          : Promise.resolve({ data: null }),
      ]);

      if (!current) return null;

      return {
        type: "hotel",
        cleanliness: current.cleanliness,
        cleanlinessPrevious: prev.data?.cleanliness ?? null,
        staff: current.staff,
        staffPrevious: prev.data?.staff ?? null,
        comfort: current.comfort,
        comfortPrevious: prev.data?.comfort ?? null,
        location: current.location,
        locationPrevious: prev.data?.location ?? null,
        valueForMoney: current.value_for_money,
        valueForMoneyPrevious: prev.data?.value_for_money ?? null,
      };
    }

    const [{ data: current }, prev] = await Promise.all([
      supabase
        .from("experience_negocio")
        .select("*")
        .eq("report_id", context.latestReportId)
        .single(),
      context.previousReportId
        ? supabase
            .from("experience_negocio")
            .select("*")
            .eq("report_id", context.previousReportId)
            .single()
        : Promise.resolve({ data: null }),
    ]);

    if (!current) return null;

    return {
      type: "negocio",
      sentimentScore: current.sentiment_score,
      sentimentScorePrevious: prev.data?.sentiment_score ?? null,
      positiveMentions: current.positive_mentions,
      negativeMentions: current.negative_mentions,
      topTheme: current.top_theme,
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
    const context = await getReportContext();
    if (!context) return [];

    const supabase = createClient();
    const { data } = await supabase
      .from("competitors")
      .select("*")
      .eq("report_id", context.latestReportId)
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

/**
 * "Otras reputaciones" — plataformas además de Google (Booking,
 * TripAdvisor, Yelp, etc.), según el tipo de negocio. Google sigue
 * siendo la reputación principal (tabla reputation_details); esto es
 * un módulo complementario.
 */
export async function getOtherReputations(): Promise<OtherReputation[]> {
  try {
    const context = await getReportContext();
    if (!context) return [];

    const supabase = createClient();
    const { data } = await supabase
      .from("other_reputations")
      .select("*")
      .eq("report_id", context.latestReportId)
      .order("sort_order", { ascending: true });

    return (data ?? []).map((r) => ({
      platform: r.platform,
      rating: r.rating,
      scale: r.scale,
      ratingOn5: r.scale === 10 ? r.rating / 2 : r.rating,
      reviewCount: r.review_count,
    }));
  } catch {
    return [];
  }
}

/**
 * LAS 15 PREGUNTAS
 * -----------------
 * Catálogo fijo (igual para todos los planes) + estado de si el
 * cliente ya las respondió, y sus respuestas si ya lo hizo. Se
 * responden una sola vez, no por reporte.
 */
export async function getOnboardingQuestions(): Promise<OnboardingQuestion[]> {
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from("onboarding_questions")
      .select("*")
      .order("order_num", { ascending: true });

    return (data ?? []).map((q) => ({
      questionKey: q.question_key,
      orderNum: q.order_num,
      questionText: q.question_text,
      purpose: q.purpose,
      responseType: q.response_type,
      options: q.options,
      hasTextField: q.has_text_field,
      textFieldLabel: q.text_field_label,
      required: q.required,
    }));
  } catch {
    return [];
  }
}

export interface OnboardingStatus {
  completed: boolean;
  answers: Record<string, OnboardingAnswerValue>;
}

export async function getOnboardingStatus(): Promise<OnboardingStatus> {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { completed: false, answers: {} };

    const { data: client } = await supabase
      .from("clients")
      .select("id, onboarding_completed")
      .eq("user_id", user.id)
      .single();
    if (!client) return { completed: false, answers: {} };

    if (!client.onboarding_completed) {
      return { completed: false, answers: {} };
    }

    const { data: rows } = await supabase
      .from("client_onboarding_answers")
      .select("question_key, answer")
      .eq("client_id", client.id);

    const answers: Record<string, OnboardingAnswerValue> = {};
    for (const row of rows ?? []) {
      answers[row.question_key] = row.answer;
    }

    return { completed: true, answers };
  } catch {
    return { completed: false, answers: {} };
  }
}

/**
 * Whether the signed-in client has already seen the first-time
 * welcome tour (separate from the 15 preguntas — this is just a UI
 * walkthrough).
 */
export async function getTourCompleted(): Promise<boolean> {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return true; // no molestar si algo falla al verificar

    const { data: client } = await supabase
      .from("clients")
      .select("tour_completed")
      .eq("user_id", user.id)
      .single();

    return client?.tour_completed ?? true;
  } catch {
    return true;
  }
}

/**
 * El plan del cliente actual (diagnostic/pro/intelligence) — decide
 * qué secciones del panel puede ver. Si algo falla o no hay sesión,
 * se asume el plan más restrictivo (diagnostic) por seguridad.
 */
export async function getClientPlan(): Promise<PlanTier> {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return "diagnostic";

    const { data: client } = await supabase
      .from("clients")
      .select("plan")
      .eq("user_id", user.id)
      .single();

    return (client?.plan as PlanTier) ?? "diagnostic";
  } catch {
    return "diagnostic";
  }
}
