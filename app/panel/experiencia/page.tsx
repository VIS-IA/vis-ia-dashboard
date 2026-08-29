import { getExperienceDetail } from "@/lib/queries";
import PanelLayout from "@/components/PanelLayout";
import { Clock, Smile, Users } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ExperienciaPage() {
  const detail = await getExperienceDetail();

  if (!detail) {
    return (
      <PanelLayout title="Experiencia del Cliente">
        <div className="bg-white rounded-xl border border-slate-200 p-8 max-w-lg text-center">
          <Users className="text-blue-400 mx-auto mb-3" size={28} />
          <p className="text-sm font-medium text-slate-800">
            Aún no hay datos de experiencia del cliente cargados
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
      title="Experiencia del Cliente"
      subtitle="Qué tan bien atiendes a quienes te contactan"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl">
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
            <Clock size={14} className="text-blue-500" /> Tiempo de respuesta
          </div>
          <p className="text-2xl font-bold text-slate-900">
            {detail.avgResponseTimeLabel}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Anterior: {detail.avgResponseTimePreviousLabel}
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
            <Smile size={14} className="text-emerald-500" /> Satisfacción
          </div>
          <p className="text-2xl font-bold text-slate-900">
            {detail.satisfactionScore}
            <span className="text-sm text-slate-400 font-normal">/100</span>
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Anterior: {detail.satisfactionPrevious}/100
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
            <Users size={14} className="text-purple-500" /> Interacciones
          </div>
          <p className="text-2xl font-bold text-slate-900">
            {detail.totalInteractions.toLocaleString("es-ES")}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Anterior: {detail.totalInteractionsPrevious.toLocaleString("es-ES")}
          </p>
        </div>
      </div>
    </PanelLayout>
  );
}
