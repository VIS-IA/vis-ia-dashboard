import { getSocialMediaDetail, getClientPlan } from "@/lib/queries";
import PanelLayout from "@/components/PanelLayout";
import LockedPreview from "@/components/LockedPreview";
import { planAtLeast } from "@/lib/plan";
import {
  Instagram,
  Facebook,
  Share2,
  Users2,
  ExternalLink,
  AlertCircle,
  BadgeCheck,
  XCircle,
} from "lucide-react";
import type { SocialFinding, SocialProfile } from "@/lib/types";

export const dynamic = "force-dynamic";

const PLATFORM_ICON: Record<string, typeof Instagram> = {
  Instagram: Instagram,
  Facebook: Facebook,
};

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

function ProfileCard({ profile }: { profile: SocialProfile }) {
  const Icon = PLATFORM_ICON[profile.platform] ?? Share2;
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-purple-50 flex items-center justify-center shrink-0">
            <Icon size={16} className="text-purple-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800">{profile.platform}</p>
            {profile.handle && <p className="text-xs text-slate-500">{profile.handle}</p>}
          </div>
        </div>
        {profile.profileUrl && (
          <a
            href={profile.profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-400 hover:text-slate-600"
          >
            <ExternalLink size={14} />
          </a>
        )}
      </div>
      <div className="grid grid-cols-2 gap-3 text-sm">
        {profile.followers !== null && (
          <div>
            <p className="text-[11px] text-slate-400">Seguidores</p>
            <p className="font-semibold text-slate-800">{profile.followers.toLocaleString("en-US")}</p>
          </div>
        )}
        {profile.postingFrequencyLabel && (
          <div>
            <p className="text-[11px] text-slate-400">Frecuencia</p>
            <p className="font-semibold text-slate-800">{profile.postingFrequencyLabel}</p>
          </div>
        )}
        {profile.lastPostLabel && (
          <div>
            <p className="text-[11px] text-slate-400">Última publicación</p>
            <p className="font-semibold text-slate-800">{profile.lastPostLabel}</p>
          </div>
        )}
        {profile.respondsToComments !== null && (
          <div>
            <p className="text-[11px] text-slate-400">Responde comentarios</p>
            <p
              className={`font-semibold ${
                profile.respondsToComments ? "text-emerald-600" : "text-red-500"
              }`}
            >
              {profile.respondsToComments ? "Sí" : "No"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function FindingCard({ finding }: { finding: SocialFinding }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="p-5 flex flex-col sm:flex-row sm:items-start gap-4">
        <div className="flex items-start gap-4 flex-1 min-w-0">
          <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center shrink-0">
            <Share2 size={18} className="text-purple-500" />
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

const SAMPLE_PROFILES: SocialProfile[] = [
  {
    platform: "Instagram",
    handle: "@negocio_ejemplo",
    profileUrl: null,
    followers: 842,
    lastPostLabel: "Hace 6 semanas",
    postingFrequencyLabel: "~1 publicación al mes",
    respondsToComments: false,
  },
];

const SAMPLE_FINDINGS: SocialFinding[] = [
  {
    titulo: "Sin presencia propia en redes sociales",
    descripcion:
      "No se encontró una cuenta de Instagram o Facebook administrada específicamente por este negocio — solo aparece la cuenta genérica de la marca/franquicia.",
    impacto: "Alto",
    categoria: "Presencia",
    evidencia: null,
  },
];

export default async function RedesSocialesPage() {
  const plan = await getClientPlan();

  if (!planAtLeast(plan, "pro")) {
    return (
      <PanelLayout
        title="Redes Sociales"
        subtitle="Qué tan presente y activo está tu negocio en Instagram y Facebook"
      >
        <LockedPreview feature="El análisis de tus Redes Sociales" minPlan="pro">
          <div className="space-y-6 max-w-2xl">
            {SAMPLE_PROFILES.map((p, idx) => (
              <ProfileCard key={idx} profile={p} />
            ))}
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

  const detail = await getSocialMediaDetail();

  if (!detail) {
    return (
      <PanelLayout title="Redes Sociales">
        <div className="bg-white rounded-xl border border-slate-200 p-8 max-w-lg text-center">
          <Share2 className="text-purple-400 mx-auto mb-3" size={28} />
          <p className="text-sm font-medium text-slate-800">
            Aún no hay un análisis de tus redes sociales cargado
          </p>
          <p className="text-sm text-slate-500 mt-1">
            Cuando VIS IA publique este detalle, aparecerá aquí.
          </p>
        </div>
      </PanelLayout>
    );
  }

  const { overallAssessment, profiles, findings } = detail;

  return (
    <PanelLayout
      title="Redes Sociales"
      subtitle="Qué tan presente y activo está tu negocio en Instagram y Facebook — separado de tus reseñas"
    >
      <div className="max-w-2xl space-y-6">
        <div className="bg-purple-50 border border-purple-100 rounded-xl p-5 flex gap-3">
          <BadgeCheck size={18} className="text-purple-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-purple-700 mb-1">
              Evaluación general
            </p>
            <p className="text-sm text-purple-900">{overallAssessment}</p>
          </div>
        </div>

        {profiles.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {profiles.map((p, idx) => (
              <ProfileCard key={idx} profile={p} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-red-50 flex items-center justify-center shrink-0">
              <XCircle size={16} className="text-red-500" />
            </div>
            <p className="text-sm text-slate-700">
              No se encontró ninguna cuenta de Instagram o Facebook administrada
              específicamente por este negocio.
            </p>
          </div>
        )}

        {findings.length > 0 && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-3 flex items-center gap-1.5">
              <Users2 size={13} /> Hallazgos específicos
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
