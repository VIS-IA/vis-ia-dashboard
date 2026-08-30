import { getDashboardData, getReputationDetail, getExperienceDetail } from "@/lib/queries";
import PanelLayout from "@/components/PanelLayout";
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
  const [data, reputation, experience] = await Promise.all([
    getDashboardData(),
    getReputationDetail(),
    getExperienceDetail(),
  ]);

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
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="text-sm font-semibold text-blue-600 mb-1 flex items-center gap-2">
            <TrendingUp size={15} /> VIS Score
          </h3>
          <ChangeRow
            label="Puntaje general"
            current={data.visScore.current}
            previous={data.visScore.previous}
            currentSuffix="/100"
            previousSuffix="/100"
          />
        </div>

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
              previous={reputation.avgRatingPrevious.toFixed(1)}
            />
            <ChangeRow
              label="Reseñas totales"
              current={reputation.totalReviews}
              previous={reputation.totalReviewsPrevious}
            />
          </div>
        )}

        {/* Experience */}
        {experience && (
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="text-sm font-semibold text-purple-600 mb-1">
              Experiencia del Cliente
            </h3>
            {experience.type === "negocio" ? (
              <ChangeRow
                label="Puntaje de sentimiento (reseñas)"
                current={experience.sentimentScore}
                previous={experience.sentimentScorePrevious ?? experience.sentimentScore}
                currentSuffix="/100"
                previousSuffix="/100"
              />
            ) : (
              <>
                <ChangeRow
                  label="Limpieza"
                  current={experience.cleanliness.toFixed(1)}
                  previous={(experience.cleanlinessPrevious ?? experience.cleanliness).toFixed(1)}
                />
                <ChangeRow
                  label="Personal / Atención"
                  current={experience.staff.toFixed(1)}
                  previous={(experience.staffPrevious ?? experience.staff).toFixed(1)}
                />
                <ChangeRow
                  label="Comodidad"
                  current={experience.comfort.toFixed(1)}
                  previous={(experience.comfortPrevious ?? experience.comfort).toFixed(1)}
                />
              </>
            )}
          </div>
        )}
      </div>
    </PanelLayout>
  );
}
