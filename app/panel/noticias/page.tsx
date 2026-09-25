import { getNewsMentionsDetail, getClientPlan } from "@/lib/queries";
import PanelLayout from "@/components/PanelLayout";
import LockedPreview from "@/components/LockedPreview";
import { planAtLeast } from "@/lib/plan";
import { Newspaper, ExternalLink, BadgeCheck, ThumbsUp, Minus, ThumbsDown } from "lucide-react";
import type { NewsMention } from "@/lib/types";

export const dynamic = "force-dynamic";

const TONE_STYLES: Record<string, { bg: string; text: string; icon: typeof ThumbsUp }> = {
  Positivo: { bg: "bg-emerald-50", text: "text-emerald-600", icon: ThumbsUp },
  Neutral: { bg: "bg-slate-100", text: "text-slate-500", icon: Minus },
  Negativo: { bg: "bg-red-50", text: "text-red-600", icon: ThumbsDown },
};

function MentionCard({ mention }: { mention: NewsMention }) {
  const tone = TONE_STYLES[mention.tono] ?? TONE_STYLES.Neutral;
  const ToneIcon = tone.icon;
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            {mention.fuente}
            {mention.fechaLabel && <span className="normal-case font-normal"> · {mention.fechaLabel}</span>}
          </p>
          <p className="text-sm font-semibold text-slate-800 mt-0.5">{mention.titulo}</p>
        </div>
        <span
          className={`shrink-0 flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${tone.bg} ${tone.text}`}
        >
          <ToneIcon size={11} /> {mention.tono}
        </span>
      </div>
      <p className="text-sm text-slate-500">{mention.resumen}</p>
      {mention.url && (
        <a
          href={mention.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 mt-3"
        >
          Ver fuente <ExternalLink size={11} />
        </a>
      )}
    </div>
  );
}

const SAMPLE_MENTIONS: NewsMention[] = [
  {
    titulo: "Negocio local destacado en directorio de la cámara de comercio",
    fuente: "Cámara de Comercio local",
    url: null,
    fechaLabel: "Hace 4 meses",
    resumen: "Mención breve en un listado de negocios recomendados de la zona.",
    tono: "Positivo",
  },
];

export default async function NoticiasPage() {
  const plan = await getClientPlan();

  if (!planAtLeast(plan, "pro")) {
    return (
      <PanelLayout
        title="Noticias y Menciones"
        subtitle="Qué se dice de tu negocio fuera de tus propios canales — medios, blogs y directorios"
      >
        <LockedPreview feature="Noticias y Menciones" minPlan="pro">
          <div className="space-y-4 max-w-2xl">
            {SAMPLE_MENTIONS.map((m, idx) => (
              <MentionCard key={idx} mention={m} />
            ))}
          </div>
        </LockedPreview>
      </PanelLayout>
    );
  }

  const detail = await getNewsMentionsDetail();

  if (!detail) {
    return (
      <PanelLayout title="Noticias y Menciones">
        <div className="bg-white rounded-xl border border-slate-200 p-8 max-w-lg text-center">
          <Newspaper className="text-blue-400 mx-auto mb-3" size={28} />
          <p className="text-sm font-medium text-slate-800">
            Aún no hay un análisis de noticias y menciones cargado
          </p>
          <p className="text-sm text-slate-500 mt-1">
            Cuando VIS IA publique este detalle, aparecerá aquí.
          </p>
        </div>
      </PanelLayout>
    );
  }

  const { overallAssessment, mentions } = detail;

  return (
    <PanelLayout
      title="Noticias y Menciones"
      subtitle="Qué se dice de tu negocio fuera de tus propios canales — medios, blogs y directorios"
    >
      <div className="max-w-2xl space-y-6">
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 flex gap-3">
          <BadgeCheck size={18} className="text-blue-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-700 mb-1">
              Evaluación general
            </p>
            <p className="text-sm text-blue-900">{overallAssessment}</p>
          </div>
        </div>

        {mentions.length > 0 ? (
          <div className="space-y-4">
            {mentions.map((m, idx) => (
              <MentionCard key={idx} mention={m} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
              <Newspaper size={16} className="text-slate-400" />
            </div>
            <p className="text-sm text-slate-700">
              No se encontró ninguna mención de este negocio en medios, blogs o directorios
              fuera de las páginas estándar de reservas/reseñas.
            </p>
          </div>
        )}
      </div>
    </PanelLayout>
  );
}
