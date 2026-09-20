import { createClient } from "@/lib/supabase/server";
import { planAtLeast, type PlanTier } from "@/lib/plan";

export interface AssistantMessage {
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

// Tope de seguridad, no una barrera comercial — ver nota en el endpoint.
const MONTHLY_MESSAGE_LIMIT = 150;

export interface AssistantReportItem {
  titulo: string;
  descripcion: string;
  nivel: string; // impacto | potencial, según la tabla de origen
}

export interface AssistantReputation {
  avgRating: number | null;
  totalReviews: number | null;
  positiveCount: number | null;
  neutralCount: number | null;
  negativeCount: number | null;
  responseRatePercent: number | null;
  unrespondedNegative: number | null;
}

export interface AssistantOtherReputation {
  platform: string;
  rating: number | null;
  scale: number | null;
  reviewCount: number | null;
}

export interface AssistantCompetitor {
  name: string;
  rating: number | null;
  reviewCount: number | null;
  notes: string | null;
  isYou: boolean;
}

/**
 * Todo lo que el asistente necesita saber del negocio para responder:
 * quién es, su último reporte COMPLETO (no solo el resumen), y (solo
 * Pro+) los hechos que el propio cliente ha confirmado sobre su
 * negocio en conversaciones anteriores.
 * Nunca incluye datos de otro cliente — todo viene de una sola fila,
 * filtrada por user_id vía RLS.
 */
export async function getAssistantContext(): Promise<{
  clientId: string;
  plan: PlanTier;
  businessName: string;
  businessType: string;
  location: string;
  lastAnalysis: string | null;
  visScore: number | null;
  resumenEjecutivo: string | null;
  losses: AssistantReportItem[];
  opportunities: AssistantReportItem[];
  actions: { texto: string; prioridad: string }[];
  reputation: AssistantReputation | null;
  otherReputations: AssistantOtherReputation[];
  competitors: AssistantCompetitor[];
  experienceSummary: {
    sentimentScore: number | null;
    positiveMentions: number | null;
    negativeMentions: number | null;
    topTheme: string | null;
  } | null;
  facts: { category: string; fact: string }[];
  visTrialStartedAt: string | null;
} | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: client } = await supabase
    .from("clients")
    .select("id, business_name, business_type, location, plan, vis_trial_started_at")
    .eq("user_id", user.id)
    .single();
  if (!client) return null;

  const { data: report } = await supabase
    .from("reports")
    .select("id, analysis_date, vis_score_current, resumen_ejecutivo")
    .eq("client_id", client.id)
    .order("analysis_date", { ascending: false })
    .limit(1)
    .maybeSingle();

  const plan = (client.plan as PlanTier) ?? "diagnostic";

  // El reporte completo del cliente — el asistente nunca debe pedirle
  // al cliente que se lo comparta, porque VIS IA ya lo tiene todo aquí.
  let losses: AssistantReportItem[] = [];
  let opportunities: AssistantReportItem[] = [];
  let actions: { texto: string; prioridad: string }[] = [];

  let reputation: AssistantReputation | null = null;
  let otherReputations: AssistantOtherReputation[] = [];
  let competitors: AssistantCompetitor[] = [];
  let experienceSummary: {
    sentimentScore: number | null;
    positiveMentions: number | null;
    negativeMentions: number | null;
    topTheme: string | null;
  } | null = null;

  if (report?.id) {
    const [
      lossesRes,
      opportunitiesRes,
      actionsRes,
      reputationRes,
      otherReputationsRes,
      competitorsRes,
      experienceRes,
    ] = await Promise.all([
      supabase
        .from("losses")
        .select("titulo, descripcion, impacto")
        .eq("report_id", report.id)
        .order("sort_order", { ascending: true }),
      supabase
        .from("opportunities")
        .select("titulo, descripcion, potencial")
        .eq("report_id", report.id)
        .order("sort_order", { ascending: true }),
      supabase
        .from("actions")
        .select("texto, prioridad")
        .eq("report_id", report.id)
        .order("sort_order", { ascending: true }),
      supabase
        .from("reputation_details")
        .select(
          "avg_rating, total_reviews, positive_count, neutral_count, negative_count, response_rate_percent, unresponded_negative"
        )
        .eq("report_id", report.id)
        .maybeSingle(),
      supabase
        .from("other_reputations")
        .select("platform, rating, scale, review_count")
        .eq("report_id", report.id)
        .order("sort_order", { ascending: true }),
      supabase
        .from("competitors")
        .select("name, rating, review_count, notes, is_you")
        .eq("report_id", report.id)
        .order("sort_order", { ascending: true }),
      supabase
        .from("experience_negocio")
        .select("sentiment_score, positive_mentions, negative_mentions, top_theme")
        .eq("report_id", report.id)
        .maybeSingle(),
    ]);

    losses = (lossesRes.data ?? []).map((l) => ({
      titulo: l.titulo,
      descripcion: l.descripcion,
      nivel: l.impacto,
    }));
    opportunities = (opportunitiesRes.data ?? []).map((o) => ({
      titulo: o.titulo,
      descripcion: o.descripcion,
      nivel: o.potencial,
    }));
    actions = actionsRes.data ?? [];

    if (reputationRes.data) {
      const r = reputationRes.data;
      reputation = {
        avgRating: r.avg_rating,
        totalReviews: r.total_reviews,
        positiveCount: r.positive_count,
        neutralCount: r.neutral_count,
        negativeCount: r.negative_count,
        responseRatePercent: r.response_rate_percent,
        unrespondedNegative: r.unresponded_negative,
      };
    }

    otherReputations = (otherReputationsRes.data ?? []).map((o) => ({
      platform: o.platform,
      rating: o.rating,
      scale: o.scale,
      reviewCount: o.review_count,
    }));

    competitors = (competitorsRes.data ?? []).map((c) => ({
      name: c.name,
      rating: c.rating,
      reviewCount: c.review_count,
      notes: c.notes,
      isYou: c.is_you,
    }));

    if (experienceRes.data) {
      const e = experienceRes.data;
      experienceSummary = {
        sentimentScore: e.sentiment_score,
        positiveMentions: e.positive_mentions,
        negativeMentions: e.negative_mentions,
        topTheme: e.top_theme,
      };
    }
  }

  // El aprendizaje continuo (guardar y reutilizar hechos del negocio)
  // es una diferencia de Pro+ — Diagnostic solo consulta su diagnóstico.
  let facts: { category: string; fact: string }[] = [];
  if (planAtLeast(plan, "pro")) {
    const { data: factRows } = await supabase
      .from("client_facts")
      .select("category, fact")
      .eq("client_id", client.id)
      .eq("verified", true)
      .order("created_at", { ascending: false })
      .limit(30);
    facts = factRows ?? [];
  }

  return {
    clientId: client.id,
    plan,
    businessName: client.business_name,
    businessType: client.business_type,
    location: client.location,
    lastAnalysis: report?.analysis_date ?? null,
    visScore: report?.vis_score_current ?? null,
    resumenEjecutivo: report?.resumen_ejecutivo ?? null,
    losses,
    opportunities,
    actions,
    reputation,
    otherReputations,
    competitors,
    experienceSummary,
    facts,
    visTrialStartedAt: client.vis_trial_started_at ?? null,
  };
}

/**
 * Si este negocio todavía no ha empezado su mes de prueba de VIS
 * (Diagnostic/Pro), lo marca como iniciado ahora mismo y devuelve esa
 * fecha. Si ya lo tenía iniciado, devuelve la fecha existente sin
 * tocarla. Se guarda una sola vez por negocio — re-suscribirse nunca
 * reinicia esta fecha.
 */
export async function ensureVisTrialStarted(
  clientId: string,
  currentValue: string | null
): Promise<string> {
  if (currentValue) return currentValue;

  const startedAt = new Date().toISOString();
  const supabase = createClient();
  await supabase
    .from("clients")
    .update({ vis_trial_started_at: startedAt })
    .eq("id", clientId)
    .is("vis_trial_started_at", null);

  return startedAt;
}

export async function getAssistantHistory(clientId: string, limit = 20): Promise<AssistantMessage[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("assistant_messages")
    .select("role, content, created_at")
    .eq("client_id", clientId)
    .order("created_at", { ascending: false })
    .limit(limit);

  return (data ?? [])
    .map((m) => ({ role: m.role as "user" | "assistant", content: m.content, createdAt: m.created_at }))
    .reverse();
}

export async function saveAssistantMessage(
  clientId: string,
  role: "user" | "assistant",
  content: string
): Promise<void> {
  const supabase = createClient();
  await supabase.from("assistant_messages").insert({ client_id: clientId, role, content });
}

/**
 * Cuántos mensajes de usuario ha enviado este cliente en lo que va del
 * mes calendario actual — es una red de seguridad técnica (evitar un
 * bug o abuso que dispare miles de llamadas a la API), no un límite
 * comercial: un uso normal nunca debería acercarse a esto.
 */
export async function countMessagesThisMonth(clientId: string): Promise<number> {
  const supabase = createClient();
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const { count } = await supabase
    .from("assistant_messages")
    .select("id", { count: "exact", head: true })
    .eq("client_id", clientId)
    .eq("role", "user")
    .gte("created_at", monthStart);

  return count ?? 0;
}

export const ASSISTANT_MONTHLY_LIMIT = MONTHLY_MESSAGE_LIMIT;

/**
 * Guarda un dato que el propio cliente confirmó sobre su negocio, para
 * que el asistente lo recuerde en futuras conversaciones. Solo se llama
 * cuando el cliente mismo escribe el dato y confirma guardarlo — nunca
 * es la IA decidiendo por su cuenta qué es un hecho verificado.
 */
export async function addClientFact(clientId: string, category: string, fact: string): Promise<void> {
  const supabase = createClient();
  await supabase.from("client_facts").insert({
    client_id: clientId,
    category,
    fact,
    source: "cliente",
    verified: true,
  });
}

