import {
  getClientPlan,
  getVisScoreTrend,
  getReputationTrend,
  buildTrendInsight,
  getClientLanguage,
} from "@/lib/queries";
import PanelLayout from "@/components/PanelLayout";
import TrendChart from "@/components/TrendChart";
import TrendInsightCard from "@/components/TrendInsightCard";
import UpgradeNotice from "@/components/UpgradeNotice";
import { planAtLeast } from "@/lib/plan";
import { getDictionary } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function TendenciasPage() {
  const [plan, language] = await Promise.all([getClientPlan(), getClientLanguage()]);
  const t = getDictionary(language).tendencias;

  if (!planAtLeast(plan, "intelligence")) {
    return (
      <PanelLayout title={t.title}>
        <UpgradeNotice feature={t.upgradeFeature} minPlan="intelligence" language={language} />
      </PanelLayout>
    );
  }

  const [scoreTrend, reputationTrend] = await Promise.all([
    getVisScoreTrend(),
    getReputationTrend(),
  ]);

  const scoreInsight = buildTrendInsight(scoreTrend);
  const ratingInsight = buildTrendInsight(reputationTrend.avgRating);
  const reviewsInsight = buildTrendInsight(reputationTrend.totalReviews);

  const hasAnyHistory = scoreTrend.length > 0;

  return (
    <PanelLayout title={t.title} subtitle={t.subtitle}>
      {!hasAnyHistory ? (
        <p className="text-sm text-slate-500 max-w-xl">{t.noHistory}</p>
      ) : (
        <div className="space-y-8 max-w-3xl">
          <section>
            <p className="text-sm font-semibold text-slate-800 mb-3">
              {t.visScoreEvolution}
            </p>
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
              <TrendChart points={scoreTrend} yDomain={[0, 100]} color="#2563eb" />
              <TrendInsightCard title={t.visScoreReading} insight={scoreInsight} />
            </div>
          </section>

          <section>
            <p className="text-sm font-semibold text-slate-800 mb-3">
              {t.averageRatingEvolution}
            </p>
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
              <TrendChart
                points={reputationTrend.avgRating}
                yDomain={[0, 5]}
                color="#f59e0b"
                valueSuffix="/5"
              />
              <TrendInsightCard title={t.ratingReading} insight={ratingInsight} />
            </div>
          </section>

          <section>
            <p className="text-sm font-semibold text-slate-800 mb-3">
              {t.reviewsCountEvolution}
            </p>
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
              <TrendChart points={reputationTrend.totalReviews} color="#10b981" />
              <TrendInsightCard title={t.reviewsVolumeReading} insight={reviewsInsight} />
            </div>
          </section>
        </div>
      )}
    </PanelLayout>
  );
}
