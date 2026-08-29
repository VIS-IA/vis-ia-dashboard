import { getDashboardData } from "@/lib/queries";
import PanelLayout from "@/components/PanelLayout";
import ScoreGauge from "@/components/ScoreGauge";
import { ArrowUp } from "lucide-react";

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
      <div className="bg-white rounded-2xl border border-slate-200 p-8 max-w-xl flex items-center gap-8">
        <ScoreGauge score={data.visScore.current} size={190} />
        <div>
          <span className="bg-emerald-500 text-white text-xs font-semibold px-3 py-1 rounded-full inline-block">
            {data.visScore.status}
          </span>
          <p className="text-sm text-slate-500 mt-2 mb-4">
            {data.visScore.statusNote}
          </p>
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
