import { getWebsiteDetail, getClientPlan } from "@/lib/queries";
import PanelLayout from "@/components/PanelLayout";
import LockedPreview from "@/components/LockedPreview";
import { planAtLeast } from "@/lib/plan";
import {
  Globe,
  Smartphone,
  BadgeCheck,
  CalendarClock,
  ExternalLink,
  AlertCircle,
  CheckCircle2,
  XCircle,
  HelpCircle,
} from "lucide-react";
import type { WebsiteFinding } from "@/lib/types";

export const dynamic = "force-dynamic";

function ImpactPill({ level }: { level: string }) {
  const styles: Record<string, string> = {
    Alto: "bg-red-50 text-red-600",
    Media: "bg-amber-50 text-amber-600",
    Baja: "bg-emerald-50 text-emerald-600",
  };
  return (
    <span
      className={`text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${
        styles[level] || "bg-slate-100 text-slate-600"
      }`}
    >
      {level}
    </span>
  );
}

function TriStateTile({
  label,
  value,
}: {
  label: string;
  value: boolean | null;
}) {
  const Icon = value === null ? HelpCircle : value ? CheckCircle2 : XCircle;
  const color =
    value === null ? "text-slate-400" : value ? "text-emerald-600" : "text-red-500";
  const text = value === null ? "No evaluado" : value ? "Sí" : "No";

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <p className="text-[11px] text-slate-400 mb-1">{label}</p>
      <div className={`flex items-center gap-1.5 font-semibold ${color}`}>
        <Icon size={16} />
        <span className="text-sm">{text}</span>
      </div>
    </div>
  );
}

function FindingCard({ finding }: { finding: WebsiteFinding }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="p-5 flex flex-col sm:flex-row sm:items-start gap-4">
        <div className="flex items-start gap-4 flex-1 min-w-0">
          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
            <Globe size={18} className="text-blue-500" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 mb-0.5">
              {finding.categoria}
            </p>
            <p className="text-sm font-semibold text-slate-800">{finding.titulo}</p>
            <p className="text-sm text-slate-500 mt-1">{finding.descripcion}</p>
          </div>
        </div>
        <div className="shrink-0 pl-14 sm:pl-0">
          <ImpactPill level={finding.impacto} />
        </div>
      </div>
      {finding.evidencia && (
        <div className="px-5 pb-5 pt-1 border-t border-slate-100">
          <div className="flex gap-2.5 pt-4">
            <AlertCircle size={14} className="text-slate-400 mt-0.5 shrink-0" />
            <p className="text-sm text-slate-600">
              <span className="font-medium text-slate-700">Evidencia: </span>
              {finding.evidencia}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

const SAMPLE_FINDINGS: WebsiteFinding[] = [
  {
    titulo: "El horario publicado no coincide con Google",
    descripcion:
      "La página web dice que cierran a las 6pm, pero Google Business Profile dice 8pm — esta inconsistencia genera desconfianza y llamadas perdidas.",
    impacto: "Alto",
    categoria: "Información de contacto",
    evidencia: null,
  },
  {
    titulo: "Sin botón de reserva directa",
    descripcion:
      "Los visitantes tienen que llamar por teléfono para reservar — no hay forma de reservar en línea desde la propia web.",
    impacto: "Media",
    categoria: "Reservas online",
    evidencia: null,
  },
];

export default async function PresenciaWebPage() {
  const plan = await getClientPlan();

  if (!planAtLeast(plan, "pro")) {
    return (
      <PanelLayout
        title="Presencia Web"
        subtitle="Qué tan bien está trabajando tu propia página web para ti"
      >
        <LockedPreview feature="El análisis de tu Presencia Web" minPlan="pro">
          <div className="space-y-6 max-w-2xl">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <TriStateTile label="¿Tiene página web?" value={true} />
              <TriStateTile label="Adaptada a celular" value={false} />
              <TriStateTile label="Info. de contacto consistente" value={false} />
              <TriStateTile label="Reservas en línea" value={false} />
            </div>
            <div className="space-y-4">
              {SAMPLE_FINDINGS.map((f, idx) => (
                <FindingCard key={idx} finding={f} />
              ))}
            </div>
          </div>
        </LockedPreview>
      </PanelLayout>
    );
  }

  const detail = await getWebsiteDetail();

  if (!detail) {
    return (
      <PanelLayout title="Presencia Web">
        <div className="bg-white rounded-xl border border-slate-200 p-8 max-w-lg text-center">
          <Globe className="text-blue-400 mx-auto mb-3" size={28} />
          <p className="text-sm font-medium text-slate-800">
            Aún no hay un análisis de tu página web cargado
          </p>
          <p className="text-sm text-slate-500 mt-1">
            Cuando VIS IA publique este detalle, aparecerá aquí.
          </p>
        </div>
      </PanelLayout>
    );
  }

  const { analysis, findings } = detail;

  return (
    <PanelLayout
      title="Presencia Web"
      subtitle="Qué tan bien está trabajando tu propia página web para ti — separado de tus reseñas y redes sociales"
    >
      <div className="max-w-2xl space-y-6">
        {analysis.websiteUrl && (
          <a
            href={analysis.websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            {analysis.websiteUrl} <ExternalLink size={13} />
          </a>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <TriStateTile label="¿Tiene página web?" value={analysis.hasWebsite} />
          <TriStateTile label="Adaptada a celular" value={analysis.mobileFriendly} />
          <TriStateTile
            label="Info. de contacto consistente"
            value={analysis.contactInfoConsistent}
          />
          <TriStateTile label="Reservas en línea" value={analysis.hasOnlineBooking} />
        </div>

        {analysis.lastContentUpdateLabel && (
          <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
              <CalendarClock size={16} className="text-slate-500" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">
                Última actualización de contenido estimada
              </p>
              <p className="text-xs text-slate-500">{analysis.lastContentUpdateLabel}</p>
            </div>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 flex gap-3">
          <BadgeCheck size={18} className="text-blue-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-700 mb-1">
              Evaluación general
            </p>
            <p className="text-sm text-blue-900">{analysis.overallAssessment}</p>
          </div>
        </div>

        {findings.length > 0 && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-3 flex items-center gap-1.5">
              <Smartphone size={13} /> Hallazgos específicos
            </p>
            <div className="space-y-4">
              {findings.map((f, idx) => (
                <FindingCard key={idx} finding={f} />
              ))}
            </div>
          </div>
        )}
      </div>
    </PanelLayout>
  );
}
