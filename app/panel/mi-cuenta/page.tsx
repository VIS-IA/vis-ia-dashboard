import { createClient } from "@/lib/supabase/server";
import PanelLayout from "@/components/PanelLayout";
import SignOutButton from "@/components/SignOutButton";
import UpgradePlanButton from "@/components/UpgradePlanButton";
import ChangePlanButton from "@/components/ChangePlanButton";
import { PLAN_LABELS, planAtLeast, type PlanTier } from "@/lib/plan";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function MiCuentaPage({
  searchParams,
}: {
  searchParams: { checkout?: string };
}) {
  const supabase = createClient();

  let user = null;
  let client: {
    business_name: string;
    client_code: string;
    contact_name: string | null;
    plan: PlanTier;
    stripe_subscription_id: string | null;
    subscription_status: string | null;
    cancel_at_period_end: boolean;
    current_period_end: string | null;
    pending_plan: PlanTier | null;
  } | null = null;

  try {
    const {
      data: { user: fetchedUser },
    } = await supabase.auth.getUser();
    user = fetchedUser;

    if (user) {
      const { data } = await supabase
        .from("clients")
        .select(
          "business_name, client_code, contact_name, plan, stripe_subscription_id, subscription_status, cancel_at_period_end, current_period_end, pending_plan"
        )
        .eq("user_id", user.id)
        .single();
      client = data;
    }
  } catch {
    // Supabase didn't respond in time — show what we can (the sign-out
    // button still works) instead of crashing the page.
  }

  const currentPlan = client?.plan ?? "diagnostic";
  const hasSubscription = Boolean(client?.stripe_subscription_id);
  const periodEndLabel = client?.current_period_end
    ? new Date(client.current_period_end).toLocaleDateString("es-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  return (
    <PanelLayout title="Mi Cuenta">
      {searchParams.checkout === "success" && (
        <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 text-sm rounded-xl p-4 max-w-md mb-4">
          Pago recibido — tu plan se actualizará en unos segundos. Si no ves
          el cambio de inmediato, refresca la página.
        </div>
      )}
      {searchParams.checkout === "cancelled" && (
        <div className="bg-amber-50 border border-amber-100 text-amber-800 text-sm rounded-xl p-4 max-w-md mb-4">
          El pago se canceló — no se hizo ningún cargo. Puedes intentarlo de
          nuevo cuando quieras.
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 p-6 max-w-md space-y-4">
        <div>
          <p className="text-xs text-slate-400">Correo</p>
          <p className="text-sm font-medium text-slate-800">{user?.email}</p>
        </div>
        {client && (
          <>
            <div>
              <p className="text-xs text-slate-400">Negocio</p>
              <p className="text-sm font-medium text-slate-800">
                {client.business_name}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400">ID VIS IA</p>
              <p className="text-sm font-medium text-slate-800">
                {client.client_code}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Plan actual</p>
              <p className="text-sm font-medium text-slate-800">
                {PLAN_LABELS[currentPlan]}
              </p>
            </div>

            {client.subscription_status === "past_due" && (
              <div className="bg-red-50 border border-red-100 text-red-700 text-xs rounded-lg p-3">
                Tu último pago no se pudo procesar. Verifica tu método de
                pago para evitar que se suspenda tu plan.
              </div>
            )}

            {client.cancel_at_period_end && (
              <div className="bg-amber-50 border border-amber-100 text-amber-800 text-xs rounded-lg p-3">
                Tu plan se cancelará
                {periodEndLabel ? ` el ${periodEndLabel}` : ""} y volverás a
                Diagnostic.{" "}
                <Link
                  href="/panel/mi-cuenta/cancelar-plan"
                  className="underline font-medium"
                >
                  Deshacer cancelación
                </Link>
              </div>
            )}

            {!client.cancel_at_period_end &&
              client.pending_plan &&
              client.pending_plan !== currentPlan && (
                <div className="bg-blue-50 border border-blue-100 text-blue-800 text-xs rounded-lg p-3">
                  Cambiarás a {PLAN_LABELS[client.pending_plan]}
                  {periodEndLabel ? ` el ${periodEndLabel}` : ""}, cuando
                  termine tu período actual.
                </div>
              )}
          </>
        )}
        <div className="pt-2 border-t border-slate-100">
          <SignOutButton />
        </div>
        <div className="pt-2 border-t border-slate-100 flex gap-4 text-xs text-slate-400">
          <Link href="/terminos" className="hover:text-slate-600 underline">
            Términos de Servicio
          </Link>
          <Link href="/privacidad" className="hover:text-slate-600 underline">
            Política de Privacidad
          </Link>
        </div>
      </div>

      {client && !hasSubscription && !planAtLeast(currentPlan, "intelligence") && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 max-w-md mt-4">
          <p className="text-sm font-semibold text-slate-800 mb-1">
            Subir de plan
          </p>
          <p className="text-xs text-slate-400 mb-4">
            El pago se procesa de forma segura a través de Stripe.
          </p>
          <div className="flex flex-col sm:flex-row gap-2">
            {!planAtLeast(currentPlan, "pro") && (
              <UpgradePlanButton plan="pro" label={`Actualizar a ${PLAN_LABELS.pro}`} />
            )}
            <UpgradePlanButton
              plan="intelligence"
              label={`Actualizar a ${PLAN_LABELS.intelligence}`}
            />
          </div>
        </div>
      )}

      {client && hasSubscription && !client.cancel_at_period_end && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 max-w-md mt-4">
          <p className="text-sm font-semibold text-slate-800 mb-1">
            Cambiar de plan
          </p>
          <p className="text-xs text-slate-400 mb-4">
            Subir de plan se aplica de inmediato (con prorrateo). Bajar de
            plan se programa para cuando termine tu período actual — nunca
            pierdes lo que ya pagaste.
          </p>
          <div className="flex flex-col sm:flex-row gap-2">
            {currentPlan === "intelligence" && (
              <ChangePlanButton plan="pro" label={`Cambiar a ${PLAN_LABELS.pro}`} />
            )}
            {currentPlan === "pro" && (
              <ChangePlanButton
                plan="intelligence"
                label={`Actualizar a ${PLAN_LABELS.intelligence}`}
              />
            )}
          </div>
        </div>
      )}

      {client && hasSubscription && (
        <p className="text-xs text-slate-400 mt-4 max-w-md">
          ¿Ya no quieres continuar con tu plan?{" "}
          <Link
            href="/panel/mi-cuenta/cancelar-plan"
            className="underline hover:text-slate-600"
          >
            Cancelar mi plan
          </Link>
        </p>
      )}
    </PanelLayout>
  );
}
