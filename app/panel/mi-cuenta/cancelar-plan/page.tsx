import { createClient } from "@/lib/supabase/server";
import PanelLayout from "@/components/PanelLayout";
import CancelPlanConfirm from "@/components/CancelPlanConfirm";
import { PLAN_LABELS, type PlanTier } from "@/lib/plan";
import Link from "next/link";

export const dynamic = "force-dynamic";

/**
 * Página de cancelación, deliberadamente separada de /panel/mi-cuenta y
 * SIN entrada en el menú lateral (ver components/PanelLayout.tsx). Solo
 * se llega aquí por el enlace de texto discreto en Mi Cuenta — así un
 * clic apurado al cambiar de plan nunca cae por error en cancelar.
 */
export default async function CancelarPlanPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let client: {
    plan: PlanTier;
    stripe_subscription_id: string | null;
    cancel_at_period_end: boolean;
    current_period_end: string | null;
  } | null = null;

  if (user) {
    const { data } = await supabase
      .from("clients")
      .select("plan, stripe_subscription_id, cancel_at_period_end, current_period_end")
      .eq("user_id", user.id)
      .single();
    client = data;
  }

  const periodEndLabel = client?.current_period_end
    ? new Date(client.current_period_end).toLocaleDateString("es-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  return (
    <PanelLayout title="Cancelar mi plan">
      <div className="bg-white rounded-xl border border-slate-200 p-6 max-w-lg space-y-4">
        {!client?.stripe_subscription_id ? (
          <p className="text-sm text-slate-700">
            No tienes una suscripción activa que cancelar. Tu plan actual es{" "}
            {PLAN_LABELS[client?.plan ?? "diagnostic"]}.
          </p>
        ) : (
          <CancelPlanConfirm
            alreadyScheduled={client.cancel_at_period_end}
            periodEndLabel={periodEndLabel}
          />
        )}

        <div className="pt-2 border-t border-slate-100">
          <Link
            href="/panel/mi-cuenta"
            className="text-xs text-slate-400 hover:text-slate-600 underline"
          >
            Volver a Mi Cuenta
          </Link>
        </div>
      </div>
    </PanelLayout>
  );
}
