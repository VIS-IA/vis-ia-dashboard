import { Lock } from "lucide-react";
import { PLAN_LABELS, type PlanTier } from "@/lib/plan";
import UpgradePlanButton from "@/components/UpgradePlanButton";

/**
 * Envuelve una vista previa de ejemplo (children) con un desenfoque y
 * una tarjeta encima invitando a subir de plan. A diferencia de
 * UpgradeNotice (que solo muestra texto), esto deja ver la FORMA real
 * de la función — con datos de muestra, nunca datos reales del
 * cliente — para que se note qué se está perdiendo.
 */
export default function LockedPreview({
  feature,
  minPlan,
  children,
}: {
  feature: string;
  minPlan: PlanTier;
  children: React.ReactNode;
}) {
  return (
    <div className="relative max-w-2xl">
      <div aria-hidden="true" className="pointer-events-none select-none blur-[3px] opacity-50">
        {children}
      </div>
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="bg-white border border-slate-200 rounded-2xl shadow-lg p-6 text-center max-w-sm space-y-3">
          <Lock className="text-slate-400 mx-auto" size={22} />
          <p className="text-sm font-medium text-slate-800">
            {feature} está disponible a partir del plan {PLAN_LABELS[minPlan]}
          </p>
          <p className="text-xs text-slate-500">
            Lo que ves detrás es un ejemplo con datos de muestra — así se vería con tu negocio real.
          </p>
          <UpgradePlanButton plan={minPlan} label={`Subir a ${PLAN_LABELS[minPlan]}`} />
        </div>
      </div>
    </div>
  );
}
