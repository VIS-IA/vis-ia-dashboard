import { TrendingUp, TrendingDown, AlertTriangle, Info } from "lucide-react";
import type { TrendInsight } from "@/lib/types";

/**
 * Muestra la lectura honesta de una tendencia (buildTrendInsight en
 * lib/queries.ts). El ícono y color reflejan exactamente lo que dice
 * el texto — nunca "verde" solo porque sí, ni "alerta" sin una caída
 * real detectada.
 */
export default function TrendInsightCard({
  title,
  insight,
}: {
  title: string;
  insight: TrendInsight;
}) {
  const isReversal = insight.recentReversal;
  const isImproving = insight.status === "ok" && insight.improvingStreak && !isReversal;
  const isLowEvidence =
    insight.status === "sin_datos" ||
    insight.status === "primer_reporte" ||
    insight.status === "insuficiente";

  const Icon = isReversal
    ? AlertTriangle
    : isImproving
    ? TrendingUp
    : isLowEvidence
    ? Info
    : TrendingDown;

  const colorClasses = isReversal
    ? "bg-amber-50 border-amber-200 text-amber-800"
    : isImproving
    ? "bg-emerald-50 border-emerald-200 text-emerald-800"
    : isLowEvidence
    ? "bg-slate-50 border-slate-200 text-slate-600"
    : "bg-blue-50 border-blue-200 text-blue-800";

  return (
    <div className={`rounded-2xl border p-5 ${colorClasses}`}>
      <div className="flex items-start gap-3">
        <Icon size={18} className="mt-0.5 shrink-0" />
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide opacity-70">
            {title}
          </p>
          <p className="text-sm mt-1 leading-relaxed">{insight.summary}</p>
        </div>
      </div>
    </div>
  );
}
