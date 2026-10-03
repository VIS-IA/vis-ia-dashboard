import { getWebsiteEvolution, getClientPlan, getClientLanguage } from "@/lib/queries";
import PanelLayout from "@/components/PanelLayout";
import LockedPreview from "@/components/LockedPreview";
import { planAtLeast } from "@/lib/plan";
import { getDictionary } from "@/lib/i18n";
import { History, TrendingUp, TrendingDown, Minus, HelpCircle, BadgeCheck, Users, Lightbulb } from "lucide-react";
import type { WebsiteEvolution } from "@/lib/types";

export const dynamic = "force-dynamic";

const TREND_ICONS: Record<string, { bg: string; text: string; icon: typeof TrendingUp }> = {
  Mejorando: { bg: "bg-emerald-50", text: "text-emerald-600", icon: TrendingUp },
  Empeorando: { bg: "bg-red-50", text: "text-red-600", icon: TrendingDown },
  Estable: { bg: "bg-slate-100", text: "text-slate-500", icon: Minus },
  "Sin datos suficientes": { bg: "bg-amber-50", text: "text-amber-600", icon: HelpCircle },
};

export default async function EvolucionWebPage() {
  const [plan, language] = await Promise.all([getClientPlan(), getClientLanguage()]);
  const t = getDictionary(language).evolucionWeb;
  const sampleEvolution: WebsiteEvolution = { ...t.sample, tendencia: "Mejorando", traficoAlcanceNota: null };

  if (!planAtLeast(plan, "pro")) {
    return (
      <PanelLayout title={t.title} subtitle={t.subtitle}>
        <LockedPreview feature={t.title} minPlan="pro" language={language}>
          <EvolutionContent evolution={sampleEvolution} t={t} />
        </LockedPreview>
      </PanelLayout>
    );
  }

  const evolution = await getWebsiteEvolution();

  if (!evolution) {
    return (
      <PanelLayout title={t.title}>
        <div className="bg-white rounded-xl border border-slate-200 p-8 max-w-lg text-center">
          <History className="text-blue-400 mx-auto mb-3" size={28} />
          <p className="text-sm font-medium text-slate-800">{t.emptyTitle}</p>
          <p className="text-sm text-slate-500 mt-1">{t.emptyBody}</p>
        </div>
      </PanelLayout>
    );
  }

  return (
    <PanelLayout title={t.title} subtitle={t.subtitle}>
      <div className="max-w-2xl">
        <EvolutionContent evolution={evolution} t={t} />
      </div>
    </PanelLayout>
  );
}

function EvolutionContent({
  evolution,
  t,
}: {
  evolution: WebsiteEvolution;
  t: ReturnType<typeof getDictionary>["evolucionWeb"];
}) {
  const trend = TREND_ICONS[evolution.tendencia] ?? TREND_ICONS.Estable;
  const trendLabel =
    t.trendLabels[evolution.tendencia as keyof typeof t.trendLabels] ?? evolution.tendencia;
  const TrendIcon = trend.icon;

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 flex gap-3">
        <BadgeCheck size={18} className="text-blue-600 shrink-0 mt-0.5" />
        <div className="flex-1">
          <div className="flex items-center justify-between gap-3 mb-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
              {t.historicalEvolution}
            </p>
            <span
              className={`shrink-0 flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${trend.bg} ${trend.text}`}
            >
              <TrendIcon size={11} /> {trendLabel}
            </span>
          </div>
          <p className="text-sm text-blue-900">{evolution.resumenEvolucion}</p>
        </div>
      </div>

      {(evolution.traficoEstimadoLabel || evolution.comportamientoVisitantes) && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 flex items-center gap-1.5">
            <Users size={13} /> {t.trafficAndBehavior}
          </p>

          {evolution.traficoEstimadoLabel && (
            <div>
              <p className="text-lg font-semibold text-slate-800">{evolution.traficoEstimadoLabel}</p>
              {evolution.traficoFuente && (
                <p className="text-[11px] text-slate-400 mt-0.5">{t.source} {evolution.traficoFuente}</p>
              )}
              {evolution.traficoAlcanceNota && (
                <p className="text-xs text-amber-700 bg-amber-50 rounded-lg px-3 py-2 mt-2">
                  {evolution.traficoAlcanceNota}
                </p>
              )}
            </div>
          )}

          {evolution.comportamientoVisitantes && (
            <p className="text-sm text-slate-600 pt-2 border-t border-slate-100">
              {evolution.comportamientoVisitantes}
            </p>
          )}
        </div>
      )}

      {evolution.accionRecomendada && (
        <div className="bg-purple-50 border border-purple-100 rounded-xl p-5 flex gap-3">
          <Lightbulb size={18} className="text-purple-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-purple-900">
              <span className="font-semibold">{t.whatToDo} </span>
              {evolution.accionRecomendada}
            </p>
            {evolution.porQue && (
              <p className="text-sm text-purple-800/80 mt-1">
                <span className="font-semibold">{t.whyLabel} </span>
                {evolution.porQue}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
