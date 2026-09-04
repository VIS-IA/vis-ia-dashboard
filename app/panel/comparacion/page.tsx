import { getDashboardData, getReputationDetail, getExperienceDetail, getClientPlan } from "@/lib/queries";
import PanelLayout from "@/components/PanelLayout";
import UpgradeNotice from "@/components/UpgradeNotice";
import { planAtLeast } from "@/lib/plan";
import { ICON_MAP } from "@/lib/icons";
import { ArrowUp, ArrowDown, TrendingUp } from "lucide-react";

export const dynamic = "force-dynamic";

function ChangeRow({
  label,
  current,
  previous,
  currentSuffix = "",
  previousSuffix = "",
}: {
  label: string;
  current: number | string;
  previous: number | string;
  currentSuffix?: string;
  previousSuffix?: string;
}) {
  const curNum = typeof current === "number" ? current : parseFloat(String(current));
  const prevNum = typeof previous === "number" ? previous : parseFloat(String(previous));
  const diff = !isNaN(curNum) && !isNaN(prevNum) ? curNum - prevNum : null;
  const up = diff !== null && diff > 0;
  const down = diff !== null && diff < 0;

  return (
    <div className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
      <span className="text-sm text-slate-600">{label}</span>
      <div className="flex items-center gap-3">
        <span className="text-xs text-slate-400">
          Antes: {previous}
          {previousSuffix}
        </span>
        <span className="text-sm font-semibold text-slate-900">
          {current}
          {currentSuffix}
        </span>
        {diff !== null && diff !== 0 && (
          <span
            className={`text-xs font-semibold flex items-center gap-0.5 ${
              up ? "text-emerald-600" : down ? "text-red-500" : "text-slate-400"
            }`}
          >
            {up ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
            {up ? "+" : ""}
            {diff.toFixed(1).replace(/\.0$/, "")}
          </span>
        )}
      </div>
    </div>
  );
}

export default async function ComparacionPage() {
  const [data, reputation, experience, plan] = await Promise.all([
    getDashboardData(),
    getReputationDetail(),
    getExperienceDetail(),
    getClientPlan(),
  ]);

  if (!planAtLeast(plan, "pro")) {
    return (
      <PanelLayout
        title="Comparación Completa"
        subtitle="Antes y después de tu negocio, reporte a reporte"
      >
        <UpgradeNotice feature="La comparación completa" minPlan="pro" />
      </PanelLayout>
    );
  }

  if (!data) {
    return (
      <PanelLayout title="Comparación Completa">
        <p className="text-sm text-slate-500">
          Aún no hay un análisis disponible para tu negocio.
        </p>
      </PanelLayout>
    );
  }

  return (
    <PanelLayout
      title="Comparación Completa"
      subtitle={`Tu negocio: antes vs. ahora — comparado con el análisis previo a ${data.lastAnalysis}`}
    >
      <div className="space-y-6 max-w-2xl">
        {/* VIS Score */}
        {data.visScore.current !== null && (
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="text-sm font-semibold text-blue-600 mb-1 flex items-center gap-2">
              <TrendingUp size={15} /> VIS Score
            </h3>
            <ChangeRow
              label="Puntaje general"
              current={data.visScore.current}
              previous={data.visScore.previous ?? data.visScore.current}
              currentSuffix="/100"
              previousSuffix="/100"
            />
          </div>
        )}

        {/* Metrics */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="text-sm font-semibold text-slate-800 mb-1">
            Métricas de actividad
          </h3>
          {data.metrics.map((m, idx) => {
            const Icon = ICON_MAP[m.icon_key] ?? TrendingUp;
            return (
              <div
                key={idx}
                className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0"
              >
                <span className="text-sm text-slate-600 flex items-center gap-2">
                  <Icon size={14} className="text-slate-400" /> {m.label}
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-400">{m.previous}</span>
                  <span className="text-sm font-semibold text-slate-900">
                    {m.value}
                    {m.suffix ?? ""}
                  </span>
                  <span className="text-xs font-semibold text-emerald-600">
                    {m.delta}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Reputation */}
        {reputation && (
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="text-sm font-semibold text-amber-600 mb-1">
              Reputación
            </h3>
            <ChangeRow
              label="Calificación promedio"
              current={reputation.avgRating.toFixed(1)}
              previous={(reputation.avgRatingPrevious ?? reputation.avgRating).toFixed(1)}
            />
            <ChangeRow
              label="Reseñas totales"
              current={reputation.totalReviews}
              previous={reputation.totalReviewsPrevious ?? reputation.totalReviews}
            />
          </div>
        )}

        {/* Experience */}
        {experience && experience.signals.length > 0 && (
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="text-sm font-semibold text-purple-600 mb-3">
              Experiencia del Cliente
            </h3>
            <div className="space-y-2">
              {experience.signals.map((s, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0 text-sm"
                >
                  <span className="text-slate-600">
                    {s.category} <span className="text-slate-400">— {s.source}</span>
                  </span>
                  <span className="font-semibold text-slate-900">
                    {s.sourceType === "platform_score" && s.platformScore !== null
                      ? `${s.platformScore.toFixed(1)}/${s.platformScoreScale ?? 10}`
                      : s.positiveMentions !== null
                      ? `${s.positiveMentions} positivas / ${s.negativeMentions ?? 0} negativas`
                      : "—"}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-400 mt-3">
              Comparación detallada disponible próximamente — por ahora se
              muestra el estado actual de cada señal.
            </p>
          </div>
        )}
      </div>
    </PanelLayout>
  );
}
