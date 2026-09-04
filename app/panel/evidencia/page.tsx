import { getVisualEvidence } from "@/lib/queries";
import PanelLayout from "@/components/PanelLayout";
import {
  Camera,
  Video,
  ExternalLink,
  ShieldCheck,
  ShieldAlert,
  AlertOctagon,
} from "lucide-react";
import type { ImpactLevel } from "@/lib/types";

export const dynamic = "force-dynamic";

const IMPACT_STYLES: Record<ImpactLevel, { emoji: string; bg: string; text: string; border: string; label: string }> = {
  low: { emoji: "🟢", bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", label: "BAJO" },
  medium: { emoji: "🟡", bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", label: "MEDIO" },
  high: { emoji: "🟠", bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200", label: "ALTO" },
  critical: { emoji: "🔴", bg: "bg-red-50", text: "text-red-700", border: "border-red-200", label: "CRÍTICO" },
};

export default async function EvidenciaPage() {
  const evidence = await getVisualEvidence();

  if (evidence.length === 0) {
    return (
      <PanelLayout title="Evidencia Visual">
        <div className="bg-white rounded-xl border border-slate-200 p-8 max-w-lg text-center">
          <Camera className="text-slate-400 mx-auto mb-3" size={28} />
          <p className="text-sm font-medium text-slate-800">
            Aún no hay evidencia visual cargada
          </p>
          <p className="text-sm text-slate-500 mt-1">
            Cuando VIS IA identifique fotos o videos relevantes en fuentes
            públicas, aparecerán aquí — con enlace directo a la fuente
            original, sin copiar el archivo.
          </p>
        </div>
      </PanelLayout>
    );
  }

  return (
    <PanelLayout
      title="Evidencia Visual"
      subtitle="Referencia y análisis, con enlace directo a la fuente pública original — VIS IA no descarga ni almacena las imágenes"
    >
      <div className="space-y-4 max-w-2xl">
        {evidence.map((e, idx) => {
          const style = IMPACT_STYLES[e.impact];
          const TypeIcon = e.evidenceType === "video" ? Video : Camera;

          return (
            <div
              key={idx}
              className={`bg-white rounded-xl border ${style.border} overflow-hidden`}
            >
              <div className="p-5">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <p className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                    <span>{style.emoji}</span> {e.title}
                  </p>
                  <span
                    className={`text-[11px] font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${style.bg} ${style.text} border ${style.border}`}
                  >
                    Impacto: {style.label}
                  </span>
                </div>

                <p className="text-sm text-slate-600 leading-relaxed mb-3">
                  {e.analysis}
                </p>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 mb-3">
                  <span className="flex items-center gap-1">
                    <TypeIcon size={12} /> {e.evidenceType === "video" ? "Video" : "Foto"}
                  </span>
                  <span>Fuente: {e.source}</span>
                  <span>Categoría: {e.category}</span>
                  {e.verified ? (
                    <span className="flex items-center gap-1 text-emerald-600">
                      <ShieldCheck size={12} /> Verificado
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-slate-400">
                      <ShieldAlert size={12} /> Sin verificar
                    </span>
                  )}
                </div>

                {e.requiresHumanReview && (
                  <div className="flex items-start gap-2 bg-slate-50 border border-slate-200 rounded-lg p-3 mb-3">
                    <AlertOctagon size={14} className="text-slate-500 mt-0.5 shrink-0" />
                    <p className="text-xs text-slate-600">
                      La interpretación definitiva de esta evidencia requiere
                      revisión humana antes de tomarse como concluyente.
                    </p>
                  </div>
                )}

                <a
                  href={e.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                  Ver evidencia original <ExternalLink size={14} />
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </PanelLayout>
  );
}
