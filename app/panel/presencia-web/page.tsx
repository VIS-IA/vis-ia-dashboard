import { getWebsiteDetail, getClientPlan, getClientLanguage } from "@/lib/queries";
import PanelLayout from "@/components/PanelLayout";
import LockedPreview from "@/components/LockedPreview";
import { planAtLeast } from "@/lib/plan";
import { getDictionary } from "@/lib/i18n";
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
  t,
}: {
  label: string;
  value: boolean | null;
  t: ReturnType<typeof getDictionary>["presenciaWeb"];
}) {
  const Icon = value === null ? HelpCircle : value ? CheckCircle2 : XCircle;
  const color =
    value === null ? "text-slate-400" : value ? "text-emerald-600" : "text-red-500";
  const text = value === null ? t.notEvaluated : value ? t.yes : t.no;

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

function FindingCard({
  finding,
  evidenciaLabel,
}: {
  finding: WebsiteFinding;
  evidenciaLabel: string;
}) {
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
              <span className="font-medium text-slate-700">{evidenciaLabel} </span>
              {finding.evidencia}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default async function PresenciaWebPage() {
  const [plan, language] = await Promise.all([getClientPlan(), getClientLanguage()]);
  const t = getDictionary(language).presenciaWeb;
  const sampleFindings: WebsiteFinding[] = t.sampleFindings.map((f) => ({ ...f, evidencia: null }));

  if (!planAtLeast(plan, "pro")) {
    return (
      <PanelLayout title={t.title} subtitle={t.subtitle}>
        <LockedPreview feature={t.title} minPlan="pro" language={language}>
          <div className="space-y-6 max-w-2xl">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <TriStateTile label={t.hasWebsite} value={true} t={t} />
              <TriStateTile label={t.mobileFriendly} value={false} t={t} />
              <TriStateTile label={t.consistentContactInfo} value={false} t={t} />
              <TriStateTile label={t.onlineBooking} value={false} t={t} />
            </div>
            <div className="space-y-4">
              {sampleFindings.map((f, idx) => (
                <FindingCard key={idx} finding={f} evidenciaLabel={t.evidencia} />
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
      <PanelLayout title={t.title}>
        <div className="bg-white rounded-xl border border-slate-200 p-8 max-w-lg text-center">
          <Globe className="text-blue-400 mx-auto mb-3" size={28} />
          <p className="text-sm font-medium text-slate-800">{t.emptyTitle}</p>
          <p className="text-sm text-slate-500 mt-1">{t.emptyBody}</p>
        </div>
      </PanelLayout>
    );
  }

  const { analysis, findings } = detail;

  return (
    <PanelLayout title={t.title} subtitle={t.subtitle}>
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
          <TriStateTile label={t.hasWebsite} value={analysis.hasWebsite} t={t} />
          <TriStateTile label={t.mobileFriendly} value={analysis.mobileFriendly} t={t} />
          <TriStateTile
            label={t.consistentContactInfo}
            value={analysis.contactInfoConsistent}
            t={t}
          />
          <TriStateTile label={t.onlineBooking} value={analysis.hasOnlineBooking} t={t} />
        </div>

        {analysis.lastContentUpdateLabel && (
          <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
              <CalendarClock size={16} className="text-slate-500" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">{t.lastContentUpdate}</p>
              <p className="text-xs text-slate-500">{analysis.lastContentUpdateLabel}</p>
            </div>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 flex gap-3">
          <BadgeCheck size={18} className="text-blue-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-700 mb-1">
              {t.overallAssessment}
            </p>
            <p className="text-sm text-blue-900">{analysis.overallAssessment}</p>
          </div>
        </div>

        {findings.length > 0 && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-3 flex items-center gap-1.5">
              <Smartphone size={13} /> {t.specificFindings}
            </p>
            <div className="space-y-4">
              {findings.map((f, idx) => (
                <FindingCard key={idx} finding={f} evidenciaLabel={t.evidencia} />
              ))}
            </div>
          </div>
        )}
      </div>
    </PanelLayout>
  );
}
