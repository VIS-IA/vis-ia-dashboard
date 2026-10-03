import { getDashboardData, getReputationDetail, getExperienceDetail, getClientPlan, getClientLanguage } from "@/lib/queries";
import type { DashboardMetric, ExperienceSignal } from "@/lib/types";
import PanelLayout from "@/components/PanelLayout";
import LockedPreview from "@/components/LockedPreview";
import { planAtLeast } from "@/lib/plan";
import { ICON_MAP } from "@/lib/icons";
import { getDictionary, type Language } from "@/lib/i18n";
import { ArrowUp, ArrowDown, TrendingUp } from "lucide-react";

export const dynamic = "force-dynamic";

function ChangeRow({
  label,
  current,
  previous,
  currentSuffix = "",
  previousSuffix = "",
  language,
}: {
  label: string;
  current: number | string;
  // null = no hay reporte anterior con el que comparar. Nunca se sustituye
  // por el valor actual: eso mostraría "Antes: X" como si X fuera un dato
  // real del pasado cuando en realidad no existe ninguna medición previa.
  previous: number | string | null;
  currentSuffix?: string;
  previousSuffix?: string;
  language: Language;
}) {
  const common = getDictionary(language).common;
  const curNum = typeof current === "number" ? current : parseFloat(String(current));
  const prevNum =
    previous === null
      ? null
      : typeof previous === "number"
      ? previous
      : parseFloat(String(previous));
  const diff =
    prevNum !== null && !isNaN(curNum) && !isNaN(prevNum) ? curNum - prevNum : null;
  const up = diff !== null && diff > 0;
  const down = diff !== null && diff < 0;

  return (
    <div className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
      <span className="text-sm text-slate-600">{label}</span>
      <div className="flex items-center gap-3">
        <span className="text-xs text-slate-400">
          {previous === null ? common.firstReport : `${common.before}: ${previous}${previousSuffix}`}
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
  const [data, reputation, experience, plan, language] = await Promise.all([
    getDashboardData(),
    getReputationDetail(),
    getExperienceDetail(),
    getClientPlan(),
    getClientLanguage(),
  ]);
  const t = getDictionary(language).comparacion;

  if (!planAtLeast(plan, "pro")) {
    return (
      <PanelLayout title={t.title} subtitle={t.subtitle}>
        <LockedPreview feature={t.title} minPlan="pro" language={language}>
          <div className="space-y-6 max-w-2xl">
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h3 className="text-sm font-semibold text-blue-600 mb-1 flex items-center gap-2">
                <TrendingUp size={15} /> VIS Score
              </h3>
              <ChangeRow label={t.overallScore} current={71} previous={58} currentSuffix="/100" previousSuffix="/100" language={language} />
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h3 className="text-sm font-semibold text-slate-800 mb-1">{t.activityMetrics}</h3>
              <ChangeRow label={t.totalReviews} current={214} previous={178} language={language} />
              <ChangeRow label={t.webTrafficGoogle} current={1580} previous={1240} language={language} />
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h3 className="text-sm font-semibold text-amber-600 mb-1">{t.reputation}</h3>
              <ChangeRow label={t.averageRating} current="4.3" previous="3.9" language={language} />
              <ChangeRow label={t.totalReviews} current={214} previous={178} language={language} />
            </div>
          </div>
        </LockedPreview>
      </PanelLayout>
    );
  }

  if (!data) {
    return (
      <PanelLayout title={t.title}>
        <p className="text-sm text-slate-500">{t.noAnalysis}</p>
      </PanelLayout>
    );
  }

  return (
    <PanelLayout title={t.title} subtitle={t.subtitleWithDate(data.lastAnalysis)}>
      <div className="space-y-6 max-w-2xl">
        {/* VIS Score */}
        {data.visScore.current !== null && (
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="text-sm font-semibold text-blue-600 mb-1 flex items-center gap-2">
              <TrendingUp size={15} /> VIS Score
            </h3>
            <ChangeRow
              label={t.overallScore}
              current={data.visScore.current}
              previous={data.visScore.previous}
              currentSuffix="/100"
              previousSuffix="/100"
              language={language}
            />
          </div>
        )}

        {/* Metrics */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="text-sm font-semibold text-slate-800 mb-1">
            {t.activityMetrics}
          </h3>
          {data.metrics.map((m: DashboardMetric, idx: number) => {
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
              {t.reputation}
            </h3>
            <ChangeRow
              label={t.averageRating}
              current={reputation.avgRating.toFixed(1)}
              previous={
                reputation.avgRatingPrevious !== null
                  ? reputation.avgRatingPrevious.toFixed(1)
                  : null
              }
              language={language}
            />
            <ChangeRow
              label={t.totalReviews}
              current={reputation.totalReviews}
              previous={reputation.totalReviewsPrevious}
              language={language}
            />
          </div>
        )}

        {/* Experience */}
        {experience && experience.signals.length > 0 && (
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="text-sm font-semibold text-purple-600 mb-3">
              {t.customerExperience}
            </h3>
            <div className="space-y-2">
              {experience.signals.map((s: ExperienceSignal, idx: number) => (
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
                      ? t.positiveNegative(s.positiveMentions, s.negativeMentions ?? 0)
                      : "—"}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-400 mt-3">{t.comparisonComingSoon}</p>
          </div>
        )}
      </div>
    </PanelLayout>
  );
}
