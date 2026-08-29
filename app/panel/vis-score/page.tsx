import { getDashboardData } from "@/lib/queries";
import PanelLayout from "@/components/PanelLayout";
import { TrendingUp, ArrowUp } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function VisScorePage() {
  const data = await getDashboardData();

  if (!data) {
    return (
      <PanelLayout title="VIS Score">
        <p className="text-sm text-slate-500">
          Aún no hay un análisis disponible para tu negocio.
        </p>
      </PanelLayout>
    );
  }

  return (
    <PanelLayout
      title="VIS Score"
      subtitle={`Último análisis: ${data.lastAnalysis}`}
    >
      <div className="bg-white rounded-2xl border border-slate-200 p-8 max-w-xl">
        <div className="flex items-end gap-3 mb-3">
          <span className="text-6xl font-bold text-emerald-500 leading-none">
            {data.visScore.current}
          </span>
          <span className="text-lg text-slate-400 pb-1">/100</span>
          <TrendingUp className="text-blue-400 mb-2" size={28} />
        </div>
        <div className="flex items-center gap-2 flex-wrap mb-6">
          <span className="bg-emerald-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
            {data.visScore.status}
          </span>
          <span className="text-xs text-slate-500">
            — {data.visScore.statusNote}
          </span>
        </div>
        <div className="flex items-center justify-between border-t border-slate-100 pt-4">
          <span className="text-sm text-slate-500">
            Puntaje anterior: {data.visScore.previous}/100
          </span>
          <span className="text-sm font-semibold text-emerald-600 flex items-center gap-1">
            <ArrowUp size={14} />
            {data.visScore.delta > 0 ? "+" : ""}
            {data.visScore.delta} puntos
          </span>
        </div>
      </div>

      <p className="text-xs text-slate-400 mt-4 max-w-xl">
        El historial completo de tu VIS Score a través del tiempo aparecerá
        aquí a medida que se publiquen más reportes. Puedes ver todos tus
        reportes anteriores en la sección "Reportes".
      </p>
    </PanelLayout>
  );
}
