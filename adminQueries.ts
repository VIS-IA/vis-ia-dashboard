import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export interface AdminClientRow {
  id: string;
  clientCode: string;
  businessName: string;
  location: string;
  businessType: string;
  plan: string;
  estado: string;
  fechaInicio: string;
  onboardingCompleted: boolean;
  contactName: string | null;
  // Del último reporte publicado, si existe. Todo null significa que
  // VIS IA todavía no ha publicado ningún reporte para este cliente —
  // nunca se rellena con un valor inventado.
  latestReport: {
    analysisDate: string;
    visScoreCurrent: number | null;
    visScoreStatus: string | null;
  } | null;
}

/**
 * Verifica que haya un usuario autenticado Y que esté en admin_users.
 * Redirige a /admin/login si cualquiera de las dos condiciones falla —
 * nunca revela a un cliente normal que esta ruta existe con datos reales.
 * Usar al inicio de cada Server Component/Server Action bajo /admin.
 */
export async function requireAdmin() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (!isAdmin) {
    redirect("/admin/login?error=no_autorizado");
  }

  return { supabase, user };
}

/**
 * Todos los clientes con el resumen de su último reporte (si existe),
 * para la Vista General y la lista de Gestión de Clientes. Depende de
 * las policies "*_admin_all" (is_admin() bypass) aplicadas en Supabase —
 * un cliente normal jamás podría ejecutar esta misma consulta.
 */
export async function listClientsOverview(): Promise<AdminClientRow[]> {
  const supabase = createClient();

  const { data: clients, error } = await supabase
    .from("clients")
    .select(
      "id, client_code, business_name, location, business_type, plan, estado, fecha_inicio, onboarding_completed, contact_name"
    )
    .order("business_name");

  if (error || !clients) return [];

  const { data: reports } = await supabase
    .from("reports")
    .select("client_id, analysis_date, vis_score_current, vis_score_status")
    .order("analysis_date", { ascending: false });

  const latestByClient = new Map<
    string,
    { analysisDate: string; visScoreCurrent: number | null; visScoreStatus: string | null }
  >();
  for (const r of reports ?? []) {
    if (!latestByClient.has(r.client_id)) {
      latestByClient.set(r.client_id, {
        analysisDate: r.analysis_date,
        visScoreCurrent: r.vis_score_current,
        visScoreStatus: r.vis_score_status,
      });
    }
  }

  return clients.map((c) => ({
    id: c.id,
    clientCode: c.client_code,
    businessName: c.business_name,
    location: c.location,
    businessType: c.business_type,
    plan: c.plan,
    estado: c.estado,
    fechaInicio: c.fecha_inicio,
    onboardingCompleted: c.onboarding_completed,
    contactName: c.contact_name,
    latestReport: latestByClient.get(c.id) ?? null,
  }));
}

export async function getClientById(id: string): Promise<AdminClientRow | null> {
  const rows = await listClientsOverview();
  return rows.find((r) => r.id === id) ?? null;
}
