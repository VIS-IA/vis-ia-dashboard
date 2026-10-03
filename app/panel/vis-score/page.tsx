import {
  getDashboardData,
  getOnboardingStatus,
  getReportHistory,
  getClientPlan,
  getReputationDetail,
  getExperienceDetail,
  getCompetitors,
  getOtherReputations,
  getClientLanguage,
  type ReportSummary,
} from "@/lib/queries";
import PanelLayout from "@/components/PanelLayout";
import ScoreGauge from "@/components/ScoreGauge";
import ScoreTimelineChart from "@/components/ScoreTimelineChart";
import UpgradeNotice from "@/components/UpgradeNotice";
import { planAtLeast } from "@/lib/plan";
import { getVisStatusPresentation } from "@/lib/visStatus";
import { getDictionary } from "@/lib/i18n";
import { ArrowUp, Star, Users, Globe, BarChart3, AlertTriangle } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function VisScorePage() {
  const [data, onboarding, history, plan, reputation, experience, competitors, otherReputations, language] =
    await Promise.all([
      getDashboardData(),
      getOnboardingStatus(),
      getReportHistory(),
      getClientPlan(),
      getReputationDetail(),
      getExperienceDetail(),
      getCompetitors(),
      getOtherReputations(),
      getClientLanguage(),
    ]);
  const t = getDictionary(language).visScore;
  const common = getDictionary(language).common;

  if (!data) {
    return (
      <PanelLayout title={t.title}>
        <p className="text-sm text-slate-500">{t.noAnalysis}</p>
      </PanelLayout>
    );
  }

  if (data.visScore.current === null) {
    return (
      <PanelLayout title={t.title} subtitle={t.lastAnalysis(data.lastAnalysis)}>
        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-8 max-w-xl">
          <span className="bg-amber-500 text-white text-xs font-semibold px-3 py-1 rounded-full inline-block mb-3">
            {t.pendingBadge}
          </span>
          <p className="text-sm text-amber-900">
            {onboarding.completed ? t.pendingOnboardingDone : t.pendingOnboardingMissing}
          </p>
        </div>
      </PanelLayout>
    );
  }

  const scoredHistory = history
    .filter((r: ReportSummary) => r.visScoreCurrent !== null)
    .slice()
    .reverse()
    .map((r: ReportSummary) => ({ date: r.analysisDate, score: r.visScoreCurrent as number }));

  const statusPresentation = getVisStatusPresentation(data.visScore.status);

  // Presencia digital confirmada: Google (reputation_details) + cualquier
  // otra plataforma verificada (other_reputations, ej. Booking.com).
  // Esto NO mide tráfico ni interacciones — solo si hay perfil real y
  // verificable en cada plataforma. Si algún día se agrega una fuente de
  // tráfico real, este texto debe actualizarse para reflejarlo, no antes.
  const platformsConfirmed = [
    ...(reputation ? ["Google"] : []),
    ...otherReputations.map((r) => r.platform),
  ];

  return (
    <PanelLayout title={t.title} subtitle={t.lastAnalysis(data.lastAnalysis)}>
      <div className="bg-white rounded-2xl border border-slate-200 p-8 max-w-xl flex items-center gap-8 mb-6">
        <ScoreGauge score={data.visScore.current} size={190} />
        <div>
          <span
            className={`${statusPresentation.badgeClass} text-white text-xs font-semibold px-3 py-1 rounded-full inline-block`}
          >
            {statusPresentation.label}
          </span>
          <p className="text-sm text-slate-500 mt-2 mb-4">
            {data.visScore.statusNote}
          </p>
          {data.visScore.previous !== null && data.visScore.delta !== null && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-slate-500">{t.previousScore(data.visScore.previous)}</span>
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
          {t.whyThisScore}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center shrink-0">
              <Star size={14} className="text-amber-500" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">{t.reputation}</p>
              <p className="text-sm text-slate-800">
                {reputation
                  ? t.ratingOnGoogle(reputation.avgRating.toFixed(1), reputation.totalReviews)
                  : common.notCalculable}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center shrink-0">
              <Users size={14} className="text-purple-500" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">{t.customerExperience}</p>
              <p className="text-sm text-slate-800">
                {experience && experience.signals.length > 0
                  ? t.signalsAnalyzed(experience.signals.length)
                  : common.notCalculable}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
              <Globe size={14} className="text-blue-500" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">{t.digitalPresence}</p>
              <p className="text-sm text-slate-800">
                {platformsConfirmed.length > 0
                  ? t.confirmedOnPlatforms(platformsConfirmed.length, platformsConfirmed.join(", "))
                  : common.notCalculable}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
              <BarChart3 size={14} className="text-emerald-500" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">{t.competitiveness}</p>
              <p className="text-sm text-slate-800">
                {competitors.length > 0
                  ? t.competitorsCompared(competitors.length)
                  : common.notCalculable}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 sm:col-span-2">
            <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center shrink-0">
              <AlertTriangle size={14} className="text-red-500" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">{t.frictionsDetected}</p>
              <p className="text-sm text-slate-800">
                {data.perdidas.length > 0
                  ? t.invisibleLossesIdentified(data.perdidas.length)
                  : t.noFrictionsDetected}
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
            {t.mainVisSignals}
          </p>
          <div className="space-y-3">
            {reputation?.responseManagementSignal && (
              <div className="flex items-start gap-2.5">
                <span className="text-base leading-none">🔴</span>
                <p className="text-sm text-slate-700">
                  <span className="font-medium">{t.frictionLabel}</span>{" "}
                  {t.frictionResponseManagement(
                    reputation.responseRatePercentPrevious ?? 0,
                    reputation.responseRatePercent ?? 0
                  )}
                </p>
              </div>
            )}
            {data.perdidas.slice(0, 1).map((p, idx) => (
              <div key={`p-${idx}`} className="flex items-start gap-2.5">
                <span className="text-base leading-none">🔴</span>
                <p className="text-sm text-slate-700">
                  <span className="font-medium">{t.frictionLabel}</span> {p.titulo}
                </p>
              </div>
            ))}
            {data.perdidas.slice(1, 2).map((p, idx) => (
              <div key={`p2-${idx}`} className="flex items-start gap-2.5">
                <span className="text-base leading-none">🟠</span>
                <p className="text-sm text-slate-700">
                  <span className="font-medium">{t.gapLabel}</span> {p.titulo}
                </p>
              </div>
            ))}
            {data.oportunidades.slice(0, 1).map((o, idx) => (
              <div key={`o-${idx}`} className="flex items-start gap-2.5">
                <span className="text-base leading-none">🟢</span>
                <p className="text-sm text-slate-700">
                  <span className="font-medium">{t.strengthLabel}</span> {o.titulo}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {!planAtLeast(plan, "pro") ? (
        <UpgradeNotice feature={t.evolutionUpgradeFeature} minPlan="pro" language={language} />
      ) : scoredHistory.length >= 2 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-2xl">
          <p className="text-sm font-semibold text-slate-800 mb-4">
            {t.evolutionTitle}
          </p>
          <ScoreTimelineChart points={scoredHistory} />
        </div>
      ) : (
        <p className="text-xs text-slate-400 max-w-xl">{t.evolutionEmpty}</p>
      )}
    </PanelLayout>
  );
}
