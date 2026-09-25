import { getWebsiteEvolution, getClientPlan } from "@/lib/queries";
import PanelLayout from "@/components/PanelLayout";
import LockedPreview from "@/components/LockedPreview";
import { planAtLeast } from "@/lib/plan";
import { History, TrendingUp, TrendingDown, Minus, HelpCircle, BadgeCheck, Users, Lightbulb } from "lucide-react";
import type { WebsiteEvolution } from "@/lib/types";

export const dynamic = "force-dynamic";

const TREND_STYLES: Record<string, { bg: string; text: string; icon: typeof TrendingUp; label: string }> = {
  Mejorando: { bg: "bg-emerald-50", text: "text-emerald-600", icon: TrendingUp, label: "Mejorando" },
  Empeorando: { bg: "bg-red-50", text: "text-red-600", icon: TrendingDown, label: "Empeorando" },
  Estable: { bg: "bg-slate-100", text: "text-slate-500", icon: Minus, label: "Estable" },
  "Sin datos suficientes": {
    bg: "bg-amber-50",
    text: "text-amber-600",
    icon: HelpCircle,
    label: "Sin datos suficientes",
  },
};

const SAMPLE_EVOLUTION: WebsiteEvolution = {
  resumenEvolucion:
    "Comparando capturas de Wayback Machine de hace 2 años contra hoy, el sitio actualizó su diseño y agregó reservas en línea, pero el contenido de servicios sigue siendo casi idéntico.",
  tendencia: "Mejorando",
  traficoEstimadoLabel: "~2,400 visitas/mes",
  traficoFuente: "SimilarWeb.com (gratuito)",
  traficoAlcanceNota: null,
  comportamientoVisitantes:
    "Duración promedio de 1:45 min y 2.1 páginas por visita — señal de interés moderado, no solo rebote inmediato.",
  accionRecomendada: "Agregar testimonios y precios claros en la página de inicio.",
  porQue: "Los visitantes se quedan pero no siempre encuentran la información que necesitan para decidir de inmediato.",
};

export default async function EvolucionWebPage() {
  const plan = await getClientPlan();

  if (!planAtLeast(plan, "pro")) {
    return (
      <PanelLayout
        title="Evolución del Sitio Web"
        subtitle="Cómo ha cambiado tu sitio con el tiempo y qué tan bien está convirtiendo visitantes en clientes"
      >
        <LockedPreview feature="Evolución del Sitio Web" minPlan="pro">
          <EvolutionContent evolution={SAMPLE_EVOLUTION} />
        </LockedPreview>
      </PanelLayout>
    );
  }

  const evolution = await getWebsiteEvolution();

  if (!evolution) {
    return (
      <PanelLayout title="Evolución del Sitio Web">
        <div className="bg-white rounded-xl border border-slate-200 p-8 max-w-lg text-center">
          <History className="text-blue-400 mx-auto mb-3" size={28} />
          <p className="text-sm font-medium text-slate-800">
            Aún no hay un análisis de evolución del sitio web cargado
          </p>
          <p className="text-sm text-slate-500 mt-1">
            Cuando VIS IA publique este detalle, aparecerá aquí.
          </p>
        </div>
      </PanelLayout>
    );
  }

  return (
    <PanelLayout
      title="Evolución del Sitio Web"
      subtitle="Cómo ha cambiado tu sitio con el tiempo y qué tan bien está convirtiendo visitantes en clientes"
    >
      <div className="max-w-2xl">
        <EvolutionContent evolution={evolution} />
      </div>
    </PanelLayout>
  );
}

function EvolutionContent({ evolution }: { evolution: WebsiteEvolution }) {
  const trend = TREND_STYLES[evolution.tendencia] ?? TREND_STYLES.Estable;
  const TrendIcon = trend.icon;

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 flex gap-3">
        <BadgeCheck size={18} className="text-blue-600 shrink-0 mt-0.5" />
        <div className="flex-1">
          <div className="flex items-center justify-between gap-3 mb-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
              Evolución histórica (Wayback Machine)
            </p>
            <span
              className={`shrink-0 flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${trend.bg} ${trend.text}`}
            >
              <TrendIcon size={11} /> {trend.label}
            </span>
          </div>
          <p className="text-sm text-blue-900">{evolution.resumenEvolucion}</p>
        </div>
      </div>

      {(evolution.traficoEstimadoLabel || evolution.comportamientoVisitantes) && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 flex items-center gap-1.5">
            <Users size={13} /> Tráfico y comportamiento de visitantes
          </p>

          {evolution.traficoEstimadoLabel && (
            <div>
              <p className="text-lg font-semibold text-slate-800">{evolution.traficoEstimadoLabel}</p>
              {evolution.traficoFuente && (
                <p className="text-[11px] text-slate-400 mt-0.5">Fuente: {evolution.traficoFuente}</p>
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
              <span className="font-semibold">Qué hacer: </span>
              {evolution.accionRecomendada}
            </p>
            {evolution.porQue && (
              <p className="text-sm text-purple-800/80 mt-1">
                <span className="font-semibold">Por qué: </span>
                {evolution.porQue}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
