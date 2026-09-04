import {
  getDashboardData,
  getOnboardingStatus,
  getReportHistory,
  getClientPlan,
  getReputationDetail,
  getExperienceDetail,
  getCompetitors,
} from "@/lib/queries";
import PanelLayout from "@/components/PanelLayout";
import ScoreGauge from "@/components/ScoreGauge";
import ScoreTimelineChart from "@/components/ScoreTimelineChart";
import UpgradeNotice from "@/components/UpgradeNotice";
import { planAtLeast } from "@/lib/plan";
import { ArrowUp, Star, Users, Globe, BarChart3, AlertTriangle } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function VisScorePage() {
  const [data, onboarding, history, plan, reputation, experience, competitors] =
    await Promise.all([
      getDashboardData(),
      getOnboardingStatus(),
      getReportHistory(),
      getClientPlan(),
      getReputationDetail(),
      getExperienceDetail(),
      getCompetitors(),
    ]);

  if (!data) {
    return (
      <PanelLayout title="VIS Score">
        <p className="text-sm text-slate-500">
          Aún no hay un análisis disponible para tu negocio.
        </p>
      </PanelLayout>
    );
  }

  if (data.visScore.current === null) {
    return (
      <PanelLayout title="VIS Score" subtitle={`Último análisis: ${data.lastAnalysis}`}>
        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-8 max-w-xl">
          <span className="bg-amber-500 text-white text-xs font-semibold px-3 py-1 rounded-full inline-block mb-3">
            PENDIENTE
          </span>
          <p className="text-sm text-amber-900">
            {onboarding.completed
              ? "Ya recibimos tus respuestas a las 15 preguntas — VIS IA está terminando de calcular tu VIS Score con esa información."
              : "El análisis externo de tu negocio ya está listo, pero el VIS Score todavía no se calcula — falta que completes las 15 preguntas internas. VIS IA no asigna un puntaje sin esa información, para no basarlo en datos incompletos."}
          </p>
        </div>
      </PanelLayout>
    );
  }

  const scoredHistory = history
    .filter((r) => r.visScoreCurrent !== null)
    .slice()
    .reverse()
    .map((r) => ({ date: r.analysisDate, score: r.visScoreCurrent as number }));

  return (
    <PanelLayout
      title="VIS Score"
      subtitle={`Último análisis: ${data.lastAnalysis}`}
    >
      <div className="bg-white rounded-2xl border border-slate-200 p-8 max-w-xl flex items-center gap-8 mb-6">
        <ScoreGauge score={data.visScore.current} size={190} />
        <div>
          <span className="bg-emerald-500 text-white text-xs font-semibold px-3 py-1 rounded-full inline-block">
            {data.visScore.status}
          </span>
          <p className="text-sm text-slate-500 mt-2 mb-4">
            {data.visScore.statusNote}
          </p>
          {data.visScore.previous !== null && data.visScore.delta !== null && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-slate-500">
                Puntaje anterior: {data.visScore.previous}/100
              </span>
              <span className="font-semibold text-emerald-600 flex items-center gap-1">
                <ArrowUp size={14} />
                {data.visScore.delta > 0 ? "+" : ""}
                {data.visScore.delta}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ¿Por qué este Score? */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-2xl mb-6">
        <p className="text-sm font-semibold text-slate-800 mb-4">
          ¿Por qué este Score?
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center shrink-0">
              <Star size={14} className="text-amber-500" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Reputación</p>
              <p className="text-sm text-slate-800">
                {reputation
                  ? `${reputation.avgRating.toFixed(1)}/5 en Google (${reputation.totalReviews} reseñas)`
                  : "No calculable con la información disponible"}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center shrink-0">
              <Users size={14} className="text-purple-500" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Experiencia del Cliente</p>
              <p className="text-sm text-slate-800">
                {experience && experience.signals.length > 0
                  ? `${experience.signals.length} señal${experience.signals.length > 1 ? "es" : ""} analizada${experience.signals.length > 1 ? "s" : ""}`
                  : "No calculable con la información disponible"}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
              <Globe size={14} className="text-blue-500" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Presencia Digital</p>
              <p className="text-sm text-slate-800">
                No calculable con la información disponible
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
              <BarChart3 size={14} className="text-emerald-500" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Competitividad</p>
              <p className="text-sm text-slate-800">
                {competitors.length > 0
                  ? `${competitors.length} competidor${competitors.length > 1 ? "es" : ""} comparado${competitors.length > 1 ? "s" : ""}`
                  : "No calculable con la información disponible"}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 sm:col-span-2">
            <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center shrink-0">
              <AlertTriangle size={14} className="text-red-500" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Fricciones detectadas</p>
              <p className="text-sm text-slate-800">
                {data.perdidas.length > 0
                  ? `${data.perdidas.length} pérdida${data.perdidas.length > 1 ? "s" : ""} invisible${data.perdidas.length > 1 ? "s" : ""} identificada${data.perdidas.length > 1 ? "s" : ""}`
                  : "No se detectaron fricciones en el último análisis"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Principales señales VIS — reutiliza Pérdidas / Oportunidades / Response Management ya calculados */}
      {(data.perdidas.length > 0 ||
        data.oportunidades.length > 0 ||
        reputation?.responseManagementSignal) && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-2xl mb-6">
          <p className="text-sm font-semibold text-slate-800 mb-4">
            Principales señales VIS
          </p>
          <div className="space-y-3">
            {reputation?.responseManagementSignal && (
              <div className="flex items-start gap-2.5">
                <span className="text-base leading-none">🔴</span>
                <p className="text-sm text-slate-700">
                  <span className="font-medium">Fricción:</span> abandono de gestión
                  de reputación — la tasa de respuesta a reseñas cayó de{" "}
                  {reputation.responseRatePercentPrevious}% a {reputation.responseRatePercent}%
                </p>
              </div>
            )}
            {data.perdidas.slice(0, 1).map((p, idx) => (
              <div key={`p-${idx}`} className="flex items-start gap-2.5">
                <span className="text-base leading-none">🔴</span>
                <p className="text-sm text-slate-700">
                  <span className="font-medium">Fricción:</span> {p.titulo}
                </p>
              </div>
            ))}
            {data.perdidas.slice(1, 2).map((p, idx) => (
              <div key={`p2-${idx}`} className="flex items-start gap-2.5">
                <span className="text-base leading-none">🟠</span>
                <p className="text-sm text-slate-700">
                  <span className="font-medium">Brecha:</span> {p.titulo}
                </p>
              </div>
            ))}
            {data.oportunidades.slice(0, 1).map((o, idx) => (
              <div key={`o-${idx}`} className="flex items-start gap-2.5">
                <span className="text-base leading-none">🟢</span>
                <p className="text-sm text-slate-700">
                  <span className="font-medium">Fortaleza:</span> {o.titulo}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {!planAtLeast(plan, "pro") ? (
        <UpgradeNotice feature="Ver la evolución de tu VIS Score en el tiempo" minPlan="pro" />
      ) : scoredHistory.length >= 2 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-2xl">
          <p className="text-sm font-semibold text-slate-800 mb-4">
            Evolución del VIS Score
          </p>
          <ScoreTimelineChart points={scoredHistory} />
        </div>
      ) : (
        <p className="text-xs text-slate-400 max-w-xl">
          El historial completo de tu VIS Score a través del tiempo aparecerá
          aquí a medida que se publiquen más reportes. Puedes ver todos tus
          reportes anteriores en la sección "Reportes".
        </p>
      )}
    </PanelLayout>
  );
}
