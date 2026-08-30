import { getReportHistory } from "@/lib/queries";
import PanelLayout from "@/components/PanelLayout";
import { FileText } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ReportesPage() {
  const reports = await getReportHistory();

  return (
    <PanelLayout
      title="Reportes"
      subtitle="Todos los análisis publicados para tu negocio"
    >
      {reports.length === 0 ? (
        <p className="text-sm text-slate-500">
          Aún no hay reportes publicados.
        </p>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100 max-w-2xl">
          {reports.map((r) => (
            <div key={r.id} className="flex items-center gap-4 p-4">
              <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                <FileText size={16} className="text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-800">
                  Análisis del {r.analysisDate}
                </p>
                <p className="text-xs text-slate-500">{r.visScoreStatus}</p>
              </div>
              {r.visScoreCurrent !== null ? (
                <span className="text-lg font-bold text-slate-900">
                  {r.visScoreCurrent}
                  <span className="text-xs text-slate-400 font-normal">/100</span>
                </span>
              ) : (
                <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full">
                  Pendiente
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </PanelLayout>
  );
}
