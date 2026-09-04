import { getVisualEvidence, getEvidenceRecords } from "@/lib/queries";
import PanelLayout from "@/components/PanelLayout";
import {
  Camera,
  Video,
  ExternalLink,
  ShieldCheck,
  ShieldAlert,
  AlertOctagon,
  Star,
  Clock,
  Eye,
  MessageCircle,
  CheckCircle2,
} from "lucide-react";
import type { ImpactLevel, CertaintyLevel } from "@/lib/types";

export const dynamic = "force-dynamic";

const IMPACT_STYLES: Record<ImpactLevel, { emoji: string; bg: string; text: string; border: string; label: string }> = {
  low: { emoji: "🟢", bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", label: "BAJO" },
  medium: { emoji: "🟡", bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", label: "MEDIO" },
  high: { emoji: "🟠", bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200", label: "ALTO" },
  critical: { emoji: "🔴", bg: "bg-red-50", text: "text-red-700", border: "border-red-200", label: "CRÍTICO" },
};

const RESOLUTION_LABELS: Record<string, string> = {
  yes: "Sí",
  not_evident: "No evidente",
  unknown: "Desconocido",
};

function CertaintyPill({ level }: { level: CertaintyLevel }) {
  const styles: Record<string, string> = {
    Confirmado: "bg-emerald-50 text-emerald-700 border-emerald-200",
    Medido: "bg-blue-50 text-blue-700 border-blue-200",
    Estimado: "bg-amber-50 text-amber-700 border-amber-200",
    Potencial: "bg-orange-50 text-orange-700 border-orange-200",
    "No calculable": "bg-slate-100 text-slate-500 border-slate-200",
  };
  return (
    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${styles[level]}`}>
      {level}
    </span>
  );
}

export default async function EvidenciaPage() {
  const [evidence, records] = await Promise.all([
    getVisualEvidence(),
    getEvidenceRecords(),
  ]);

  const isEmpty = evidence.length === 0 && records.length === 0;

  if (isEmpty) {
    return (
      <PanelLayout title="Evidencia Visual">
        <div className="bg-white rounded-xl border border-slate-200 p-8 max-w-lg text-center">
          <Camera className="text-slate-400 mx-auto mb-3" size={28} />
          <p className="text-sm font-medium text-slate-800">
            Aún no hay evidencia cargada
          </p>
          <p className="text-sm text-slate-500 mt-1">
            Cuando VIS IA identifique reseñas, fotos o videos relevantes en
            fuentes públicas, aparecerán aquí — con enlace directo a la
            fuente original, sin copiar el archivo.
          </p>
        </div>
      </PanelLayout>
    );
  }

  return (
    <PanelLayout
      title="Evidencia Visual"
      subtitle="Referencia y análisis, con enlace directo a la fuente pública original — VIS IA no descarga ni almacena el contenido"
    >
      {/* VIS Evidence Records — reseñas completas y trazables */}
      {records.length > 0 && (
        <div className="space-y-5 max-w-2xl mb-8">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            VIS Evidence
          </p>
          {records.map((r, idx) => (
            <div key={idx} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="p-5 border-b border-slate-100">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    {r.rating !== null && (
                      <span className="flex items-center gap-1 text-sm font-semibold text-slate-900">
                        <Star size={14} className="fill-amber-400 text-amber-400" />
                        {r.rating}/5
                      </span>
                    )}
                    <span className="text-xs text-slate-400">— {r.source} Review</span>
                  </div>
                  {r.confidence && <CertaintyPill level={r.confidence} />}
                </div>

                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="flex items-center gap-1 bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full">
                    <Clock size={11} />
                    {r.temporalStatus === "historical" ? "Evidencia histórica" : "Evidencia reciente"}
                    {r.reviewDateLabel ? ` — ${r.reviewDateLabel}` : ""}
                  </span>
                  <span
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-full ${
                      r.publicPersistence
                        ? "bg-orange-50 text-orange-700"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    <Eye size={11} />
                    Exposición pública persistente — {r.publicPersistence ? "Sí" : "No"}
                  </span>
                  <span className="flex items-center gap-1 bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full">
                    <MessageCircle size={11} />
                    Respuesta del propietario — {r.ownerResponse ? "Sí" : "No"}
                  </span>
                  <span
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-full ${
                      r.resolutionDemonstrated === "yes"
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-red-50 text-red-600"
                    }`}
                  >
                    <CheckCircle2 size={11} />
                    Resolución demostrada — {RESOLUTION_LABELS[r.resolutionDemonstrated]}
                  </span>
                </div>
              </div>

              {r.issues.length > 0 && (
                <div className="p-5 border-b border-slate-100">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">
                    Issues Detected
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {r.issues.map((issue, i) => (
                      <span key={i} className="flex items-center gap-1.5 text-sm text-slate-700">
                        {IMPACT_STYLES[issue.severity].emoji} {issue.category}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="p-5 border-b border-slate-100">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">
                  Análisis VIS
                </p>
                <p className="text-sm text-slate-700 leading-relaxed">{r.analysis}</p>
                {r.requiresHumanReview && (
                  <div className="flex items-start gap-2 bg-slate-50 border border-slate-200 rounded-lg p-3 mt-3">
                    <AlertOctagon size={14} className="text-slate-500 mt-0.5 shrink-0" />
                    <p className="text-xs text-slate-600">
                      Requiere revisión humana antes de tomarse como concluyente.
                    </p>
                  </div>
                )}
              </div>

              {r.photos.length > 0 && (
                <div className="p-5 border-b border-slate-100">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-3">
                    Visual Evidence
                  </p>
                  <div className="space-y-3">
                    {r.photos.map((p, i) => {
                      const style = IMPACT_STYLES[p.impact];
                      const TypeIcon = p.evidenceType === "video" ? Video : Camera;
                      return (
                        <div key={i} className={`rounded-lg border ${style.border} ${style.bg} p-3`}>
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="text-xs font-medium text-slate-700 flex items-center gap-1">
                              <TypeIcon size={12} /> {p.description}
                            </span>
                            <span className={`text-[10px] font-semibold ${style.text}`}>
                              {style.emoji} {style.label}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mb-2">{p.analysis}</p>
                          <a
                            href={p.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-700"
                          >
                            Ver evidencia original <ExternalLink size={12} />
                          </a>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="p-5 flex items-center justify-between">
                <a
                  href={r.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                  Ver reseña original <ExternalLink size={14} />
                </a>
                {r.author && (
                  <span className="text-xs text-slate-400">— {r.author}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Evidencia visual simple (fotos/videos sin reseña asociada) */}
      {evidence.length > 0 && (
        <div className="space-y-4 max-w-2xl">
          {records.length > 0 && (
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Otra evidencia visual
            </p>
          )}
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
      )}
    </PanelLayout>
  );
}
