import { DollarSign, AlertCircle } from "lucide-react";
import type { CertaintyLevel } from "@/lib/types";

const CERTAINTY_STYLES: Record<CertaintyLevel, { bg: string; text: string; border: string }> = {
  Confirmado: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
  Medido: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
  Estimado: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
  Potencial: { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200" },
  "No calculable": { bg: "bg-slate-100", text: "text-slate-500", border: "border-slate-200" },
};

function formatMoney(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${amount.toLocaleString("en-US")} ${currency}`;
  }
}

/**
 * EconomicImpactCard
 * --------------------
 * Regla estructural de VIS IA (aplica a negocios, restaurantes y
 * hoteles por igual): nunca afirma "dinero perdido" sin evidencia.
 * Siempre muestra el nivel de certeza, y si no hay información
 * suficiente para una cifra, lo dice explícitamente en vez de
 * inventar un número.
 */
export default function EconomicImpactCard({
  kind,
  montoEstimado,
  moneda,
  supuestos,
  evidencia,
  nivelCerteza,
}: {
  kind: "perdida" | "oportunidad";
  montoEstimado: number | null;
  moneda: string;
  supuestos: string | null;
  evidencia: string | null;
  nivelCerteza: CertaintyLevel | null;
}) {
  if (!nivelCerteza && montoEstimado === null) return null;

  const certainty = nivelCerteza ?? "No calculable";
  const styles = CERTAINTY_STYLES[certainty];
  const label =
    kind === "perdida" ? "IMPACTO ECONÓMICO POTENCIAL" : "OPORTUNIDAD ECONÓMICA POTENCIAL";

  return (
    <div className={`rounded-xl border ${styles.border} ${styles.bg} p-4`}>
      <div className="flex items-center gap-2 mb-2">
        <DollarSign size={14} className={styles.text} />
        <p className={`text-[11px] font-semibold uppercase tracking-wide ${styles.text}`}>
          {label}
        </p>
      </div>

      {montoEstimado !== null ? (
        <p className="text-2xl font-bold text-slate-900 mb-1">
          {formatMoney(montoEstimado, moneda)}
          <span className="text-xs font-medium text-slate-400 ml-2">
            {certainty.toLowerCase()}
          </span>
        </p>
      ) : (
        <div className="flex items-start gap-2 mb-1">
          <AlertCircle size={14} className="text-slate-400 mt-0.5 shrink-0" />
          <p className="text-sm font-medium text-slate-500">
            No calculable con la información disponible
          </p>
        </div>
      )}

      <p className="text-xs text-slate-500 mb-2">
        No representa una {kind === "perdida" ? "pérdida" : "cifra"} económica
        confirmada salvo que el nivel de certeza sea "Confirmado".
      </p>

      {evidencia && (
        <p className="text-xs text-slate-600 mb-1">
          <span className="font-medium">Evidencia utilizada: </span>
          {evidencia}
        </p>
      )}
      {supuestos && (
        <p className="text-xs text-slate-600 mb-1">
          <span className="font-medium">Supuestos: </span>
          {supuestos}
        </p>
      )}

      <span
        className={`inline-block mt-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${styles.bg} ${styles.text} border ${styles.border}`}
      >
        Nivel de certeza: {certainty}
      </span>
    </div>
  );
}
