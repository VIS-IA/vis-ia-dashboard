import { getReputationDetail, getOtherReputations } from "@/lib/queries";
import PanelLayout from "@/components/PanelLayout";
import { Star, MessageSquare, AlertTriangle, Globe } from "lucide-react";

export const dynamic = "force-dynamic";

function Stars({ rating }: { rating: number }) {
  const full = Math.floor(rating);
  return (
    <span className="inline-flex gap-0.5">
      {[0, 1, 2, 3, 4].map((i) => (
        <Star
          key={i}
          size={18}
          className={i < full ? "fill-amber-400 text-amber-400" : "text-slate-300"}
        />
      ))}
    </span>
  );
}

export default async function ReputacionPage() {
  const [detail, otherReputations] = await Promise.all([
    getReputationDetail(),
    getOtherReputations(),
  ]);

  if (!detail) {
    return (
      <PanelLayout title="Reputación">
        <div className="bg-white rounded-xl border border-slate-200 p-8 max-w-lg text-center">
          <Star className="text-amber-400 mx-auto mb-3" size={28} />
          <p className="text-sm font-medium text-slate-800">
            Aún no hay datos de reputación cargados
          </p>
          <p className="text-sm text-slate-500 mt-1">
            Cuando VIS IA publique el detalle de reseñas de tu negocio,
            aparecerá aquí.
          </p>
        </div>
      </PanelLayout>
    );
  }

  const hasBreakdown =
    detail.positiveCount !== null &&
    detail.neutralCount !== null &&
    detail.negativeCount !== null;
  const total = hasBreakdown
    ? (detail.positiveCount ?? 0) + (detail.neutralCount ?? 0) + (detail.negativeCount ?? 0)
    : 0;
  const pct = (n: number) => (total > 0 ? Math.round((n / total) * 100) : 0);

  // Señal VIS: brecha de reputación entre plataformas — cálculo
  // automático a partir de datos reales, nunca un texto inventado.
  const allRatingsOn5 = [
    detail.avgRating,
    ...otherReputations.map((r) => r.ratingOn5),
  ];
  const gap =
    allRatingsOn5.length > 1
      ? Math.max(...allRatingsOn5) - Math.min(...allRatingsOn5)
      : 0;
  const hasSignificantGap = gap >= 0.4;

  return (
    <PanelLayout
      title="Reputación"
      subtitle="Google es tu reputación principal — otras plataformas se muestran como contexto"
    >
      <div className="max-w-3xl space-y-6">
        {/* Reputación principal — Google */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Reputación principal — Google
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Rating card */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <p className="text-xs text-slate-400 mb-2">Calificación promedio</p>
              <div className="flex items-end gap-2 mb-1">
                <span className="text-4xl font-bold text-slate-900">
                  {detail.avgRating.toFixed(1)}
                </span>
                <Stars rating={detail.avgRating} />
              </div>
              <p className="text-xs text-slate-500">
                {detail.avgRatingPrevious !== null
                  ? `Anterior: ${detail.avgRatingPrevious.toFixed(1)}`
                  : "Primer reporte"}
              </p>
            </div>

            {/* Reviews total card */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <p className="text-xs text-slate-400 mb-2">Reseñas totales</p>
              <div className="flex items-center gap-2 mb-1">
                <MessageSquare size={20} className="text-blue-500" />
                <span className="text-4xl font-bold text-slate-900">
                  {detail.totalReviews}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {detail.totalReviewsPrevious !== null
                  ? `Anterior: ${detail.totalReviewsPrevious}`
                  : "Primer reporte"}
              </p>
            </div>

            {/* Sentiment breakdown — solo si hay evidencia clasificada */}
            {hasBreakdown && (
              <div className="bg-white rounded-xl border border-slate-200 p-6 md:col-span-2">
                <p className="text-sm font-semibold text-slate-800 mb-4">
                  Distribución de reseñas
                </p>
                <div className="w-full h-3 rounded-full overflow-hidden flex bg-slate-100 mb-4">
                  <div
                    className="bg-emerald-500 h-full"
                    style={{ width: `${pct(detail.positiveCount ?? 0)}%` }}
                  />
                  <div
                    className="bg-amber-400 h-full"
                    style={{ width: `${pct(detail.neutralCount ?? 0)}%` }}
                  />
                  <div
                    className="bg-red-500 h-full"
                    style={{ width: `${pct(detail.negativeCount ?? 0)}%` }}
                  />
                </div>
                <div className="flex flex-wrap gap-6 text-sm">
                  <span className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    Positivas: {detail.positiveCount} ({pct(detail.positiveCount ?? 0)}%)
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                    Neutrales: {detail.neutralCount} ({pct(detail.neutralCount ?? 0)}%)
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                    Negativas: {detail.negativeCount} ({pct(detail.negativeCount ?? 0)}%)
                  </span>
                </div>
              </div>
            )}

            {detail.unrespondedNegative !== null && detail.unrespondedNegative > 0 && (
              <div className="bg-white rounded-xl border border-slate-200 p-6 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                  <AlertTriangle size={18} className="text-red-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    {detail.unrespondedNegative} reseñas negativas sin responder
                  </p>
                  <p className="text-xs text-slate-500">
                    Revisa el Plan de Acción para priorizar esto
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Response Management — gestión de respuesta a reseñas, con detección automática de abandono */}
        {(detail.reviewsResponded !== null ||
          detail.reviewsUnresponded !== null ||
          detail.responseRatePercent !== null) && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Response Management
              </p>
            </div>

            {detail.responseManagementSignal && (
              <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-4 flex items-start gap-3">
                <AlertTriangle size={16} className="text-red-600 mt-0.5 shrink-0" />
                <p className="text-sm text-red-900">
                  <span className="font-semibold">🔴 Fricción VIS — abandono de gestión de reputación:</span>{" "}
                  la tasa de respuesta cayó de {detail.responseRatePercentPrevious}% a{" "}
                  {detail.responseRatePercent}% frente al reporte anterior. Esto suele
                  indicar un cambio operativo (menos personal, cambio de dueño, o
                  descuido) que vale la pena investigar antes de que afecte más la
                  reputación.
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {detail.reviewsResponded !== null && (
                <div className="bg-white rounded-xl border border-slate-200 p-4">
                  <p className="text-[11px] text-slate-400 mb-1">Respondidas</p>
                  <p className="text-xl font-bold text-emerald-600">{detail.reviewsResponded}</p>
                </div>
              )}
              {detail.reviewsUnresponded !== null && (
                <div className="bg-white rounded-xl border border-slate-200 p-4">
                  <p className="text-[11px] text-slate-400 mb-1">Sin responder</p>
                  <p className="text-xl font-bold text-red-500">{detail.reviewsUnresponded}</p>
                </div>
              )}
              {detail.responseRatePercent !== null && (
                <div className="bg-white rounded-xl border border-slate-200 p-4">
                  <p className="text-[11px] text-slate-400 mb-1">Tasa de respuesta</p>
                  <p className="text-xl font-bold text-slate-900">{detail.responseRatePercent}%</p>
                  {detail.responseRatePercentPrevious !== null && (
                    <p className="text-[11px] text-slate-400">
                      Anterior: {detail.responseRatePercentPrevious}%
                    </p>
                  )}
                </div>
              )}
              {detail.avgResponseTimeDays !== null && (
                <div className="bg-white rounded-xl border border-slate-200 p-4">
                  <p className="text-[11px] text-slate-400 mb-1">Tiempo promedio</p>
                  <p className="text-xl font-bold text-slate-900">
                    {detail.avgResponseTimeDays.toFixed(1)}
                    <span className="text-xs text-slate-400 font-normal"> días</span>
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Otras reputaciones */}
        {otherReputations.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-slate-400" />
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Otras reputaciones
              </p>
            </div>

            {hasSignificantGap && (
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 mb-4 flex items-start gap-3">
                <AlertTriangle size={16} className="text-amber-600 mt-0.5 shrink-0" />
                <p className="text-sm text-amber-900">
                  <span className="font-semibold">Señal VIS — brecha de reputación:</span>{" "}
                  la percepción de tu negocio no es uniforme entre plataformas
                  (diferencia de {gap.toFixed(1)} puntos sobre 5). Vale la pena
                  investigar qué está generando esta diferencia.
                </p>
              </div>
            )}

            <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
              {otherReputations.map((r, idx) => (
                <div key={idx} className="p-4 flex items-center gap-4">
                  <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                    <Globe size={16} className="text-slate-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800">
                      {r.platform}
                    </p>
                    {r.reviewCount !== null && (
                      <p className="text-xs text-slate-400">
                        {r.reviewCount} reseñas
                      </p>
                    )}
                  </div>
                  <span className="text-lg font-bold text-slate-900">
                    {r.rating.toFixed(1)}
                    <span className="text-xs text-slate-400 font-normal">
                      /{r.scale}
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </PanelLayout>
  );
}

