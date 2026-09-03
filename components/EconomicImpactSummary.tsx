import { AlertCircle } from "lucide-react";
import type { DashboardLoss, DashboardOpportunity, CertaintyLevel } from "@/lib/types";

const TIERS: CertaintyLevel[] = ["Confirmado", "Medido", "Estimado", "Potencial"];

const TIER_STYLES: Record<CertaintyLevel, { bg: string; text: string; border: string }> = {
  Confirmado: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
  Medido: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
  Estimado: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
  Potencial: { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200" },
  "No calculable": { bg: "bg-slate-100", text: "text-slate-500", border: "border-slate-200" },
};

function formatMoney(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function EconomicImpactSummary({
  perdidas,
  oportunidades,
}: {
  perdidas: DashboardLoss[];
  oportunidades: DashboardOpportunity[];
}) {
  const allFindings = [
    ...perdidas.map((p) => ({ ...p, kind: "perdida" as const })),
    ...oportunidades.map((o) => ({ ...o, kind: "oportunidad" as const })),
  ];

  const withCertainty = allFindings.filter((f) => f.nivelCerteza !== null);
  if (withCertainty.length === 0) return null;

  const noCalculable = withCertainty.filter((f) => f.nivelCerteza === "No calculable");

  return (
    <section className="bg-white rounded-2xl border border-slate-200 p-5 lg:p-6">
      <p className="text-sm font-semibold text-slate-800 mb-1">
        Resumen de Impacto Económico
      </p>
      <p className="text-xs text-slate-500 mb-4">
        Clasificado por nivel de certeza — nunca presentamos una cifra como
        pérdida confirmada sin evidencia directa.
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {TIERS.map((tier) => {
          const items = withCertainty.filter((f) => f.nivelCerteza === tier);
          const total = items.reduce((sum, f) => sum + (f.montoEstimado ?? 0), 0);
          const hasAmounts = items.some((f) => f.montoEstimado !== null);
          const style = TIER_STYLES[tier];

          return (
            <div
              key={tier}
              className={`rounded-xl border ${style.border} ${style.bg} p-3`}
            >
              <p className={`text-[10px] font-semibold uppercase tracking-wide ${style.text} mb-1`}>
                {tier}
              </p>
              {items.length === 0 ? (
                <p className="text-sm text-slate-400">—</p>
              ) : hasAmounts ? (
                <p className="text-lg font-bold text-slate-900">{formatMoney(total)}</p>
              ) : (
                <p className="text-xs text-slate-500">
                  {items.length} hallazgo{items.length > 1 ? "s" : ""}
                </p>
              )}
              <p className="text-[11px] text-slate-400 mt-0.5">
                {items.length} {items.length === 1 ? "hallazgo" : "hallazgos"}
              </p>
            </div>
          );
        })}
      </div>

      {noCalculable.length > 0 && (
        <div className="flex items-start gap-2 mt-4 pt-4 border-t border-slate-100">
          <AlertCircle size={14} className="text-slate-400 mt-0.5 shrink-0" />
          <p className="text-xs text-slate-500">
            {noCalculable.length} hallazgo{noCalculable.length > 1 ? "s" : ""} sin
            suficiente información para asignar una cifra — preferimos decir
            "no calculable" antes que inventar un número.
          </p>
        </div>
      )}
    </section>
  );
}
