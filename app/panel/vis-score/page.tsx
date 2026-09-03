import { getDashboardData, getOnboardingStatus, getReportHistory, getClientPlan } from "@/lib/queries";
import PanelLayout from "@/components/PanelLayout";
import ScoreGauge from "@/components/ScoreGauge";
import ScoreTimelineChart from "@/components/ScoreTimelineChart";
import UpgradeNotice from "@/components/UpgradeNotice";
import { planAtLeast } from "@/lib/plan";
import { ArrowUp } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function VisScorePage() {
  const [data, onboarding, history, plan] = await Promise.all([
    getDashboardData(),
    getOnboardingStatus(),
    getReportHistory(),
    getClientPlan(),
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
