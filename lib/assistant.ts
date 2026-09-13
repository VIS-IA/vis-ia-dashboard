import { createClient } from "@/lib/supabase/server";
import { planAtLeast, type PlanTier } from "@/lib/plan";

export interface AssistantMessage {
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

// Tope de seguridad, no una barrera comercial — ver nota en el endpoint.
const MONTHLY_MESSAGE_LIMIT = 150;

/**
 * Todo lo que el asistente necesita saber del negocio para responder:
 * quién es, su último reporte, y (solo Pro+) los hechos que el propio
 * cliente ha confirmado sobre su negocio en conversaciones anteriores.
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
  facts: { category: string; fact: string }[];
} | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: client } = await supabase
    .from("clients")
    .select("id, business_name, business_type, location, plan")
    .eq("user_id", user.id)
    .single();
  if (!client) return null;

  const { data: report } = await supabase
    .from("reports")
    .select("analysis_date, vis_score_current, resumen_ejecutivo")
    .eq("client_id", client.id)
    .order("analysis_date", { ascending: false })
    .limit(1)
    .maybeSingle();

  const plan = (client.plan as PlanTier) ?? "diagnostic";

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
    facts,
  };
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
