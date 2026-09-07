import {
  getClientPlan,
  getVisScoreTrend,
  getReputationTrend,
  buildTrendInsight,
} from "@/lib/queries";
import PanelLayout from "@/components/PanelLayout";
import TrendChart from "@/components/TrendChart";
import TrendInsightCard from "@/components/TrendInsightCard";
import UpgradeNotice from "@/components/UpgradeNotice";
import { planAtLeast } from "@/lib/plan";

export const dynamic = "force-dynamic";

export default async function TendenciasPage() {
  const plan = await getClientPlan();

  if (!planAtLeast(plan, "intelligence")) {
    return (
      <PanelLayout title="Análisis de Tendencias">
        <UpgradeNotice
          feature="El Análisis de Tendencias (evolución de tu reputación y detección de patrones a través de tus reportes)"
          minPlan="intelligence"
        />
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
    <PanelLayout
      title="Análisis de Tendencias"
      subtitle="Exclusivo de tu plan Intelligence — construido solo con reportes reales ya publicados"
    >
      {!hasAnyHistory ? (
        <p className="text-sm text-slate-500 max-w-xl">
          Aún no hay ningún reporte publicado para tu negocio. Las tendencias
          aparecerán aquí a partir de tu primer reporte.
        </p>
      ) : (
        <div className="space-y-8 max-w-3xl">
          <section>
            <p className="text-sm font-semibold text-slate-800 mb-3">
              Evolución del VIS Score
            </p>
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
              <TrendChart points={scoreTrend} yDomain={[0, 100]} color="#2563eb" />
              <TrendInsightCard title="Lectura del VIS Score" insight={scoreInsight} />
            </div>
          </section>

          <section>
            <p className="text-sm font-semibold text-slate-800 mb-3">
              Evolución de la calificación promedio
            </p>
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
              <TrendChart
                points={reputationTrend.avgRating}
                yDomain={[0, 5]}
                color="#f59e0b"
                valueSuffix="/5"
              />
              <TrendInsightCard title="Lectura de la calificación" insight={ratingInsight} />
            </div>
          </section>

          <section>
            <p className="text-sm font-semibold text-slate-800 mb-3">
              Evolución de la cantidad de reseñas
            </p>
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
              <TrendChart points={reputationTrend.totalReviews} color="#10b981" />
              <TrendInsightCard title="Lectura del volumen de reseñas" insight={reviewsInsight} />
            </div>
          </section>
        </div>
      )}
    </PanelLayout>
  );
}
