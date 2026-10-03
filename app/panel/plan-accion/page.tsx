import { getDashboardData, getClientLanguage } from "@/lib/queries";
import PanelLayout from "@/components/PanelLayout";
import ShareFindingButton from "@/components/ShareFindingButton";
import { getDictionary } from "@/lib/i18n";
import {
  AlertTriangle,
  Search,
  GitBranch,
  TrendingDown,
  ShieldCheck,
  Target,
  Calendar,
} from "lucide-react";

export const dynamic = "force-dynamic";

function PriorityPill({ level }: { level: string }) {
  const styles: Record<string, string> = {
    Alta: "bg-red-50 text-red-600",
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

function CertaintyPill({ level, certeza }: { level: string; certeza: string }) {
  const styles: Record<string, string> = {
    Confirmado: "bg-emerald-50 text-emerald-700 border-emerald-200",
    Medido: "bg-blue-50 text-blue-700 border-blue-200",
    Estimado: "bg-amber-50 text-amber-700 border-amber-200",
    Potencial: "bg-orange-50 text-orange-700 border-orange-200",
    "No calculable": "bg-slate-100 text-slate-500 border-slate-200",
  };
  return (
    <span
      className={`text-xs font-medium px-2.5 py-1 rounded-full border whitespace-nowrap ${
        styles[level] || "bg-slate-100 text-slate-600 border-slate-200"
      }`}
    >
      {certeza}: {level}
    </span>
  );
}

function Section({
  icon: Icon,
  label,
  children,
  color,
}: {
  icon: any;
  label: string;
  children: React.ReactNode;
  color: string;
}) {
  return (
    <div className="flex gap-3">
      <div
        className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${color}`}
      >
        <Icon size={13} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 mb-0.5">
          {label}
        </p>
        <p className="text-sm text-slate-700 leading-relaxed">{children}</p>
      </div>
    </div>
  );
}

export default async function PlanAccionPage() {
  const [data, language] = await Promise.all([getDashboardData(), getClientLanguage()]);
  const t = getDictionary(language).planAccion;
  const common = getDictionary(language).common;

  if (!data) {
    return (
      <PanelLayout title={t.title}>
        <p className="text-sm text-slate-500">{common.noAnalysisAvailable}</p>
      </PanelLayout>
    );
  }

  return (
    <PanelLayout title={t.title} subtitle={t.subtitle}>
      {data.acciones.length === 0 ? (
        <p className="text-sm text-slate-500">{t.empty}</p>
      ) : (
        <div className="space-y-5 max-w-3xl">
          {data.acciones.map((a, idx) => {
            const hasFullStructure =
              a.problema || a.evidencia || a.causaProbable || a.nivelCerteza;

            const shareText = [
              t.shareTitle(data.business.name),
              a.texto,
              a.problema ? `${t.problema}: ${a.problema}` : null,
              a.evidencia ? `${t.evidencia}: ${a.evidencia}` : null,
              a.causaProbable ? `${t.causaProbable}: ${a.causaProbable}` : null,
              a.detalle ? `${t.impacto}: ${a.detalle}` : null,
              a.nivelCerteza ? `${common.certeza}: ${a.nivelCerteza}` : null,
              a.metrica ? `${t.successMetric}: ${a.metrica}` : null,
              `${t.priority}: ${a.prioridad}`,
            ]
              .filter(Boolean)
              .join("\n");

            return (
              <div
                key={idx}
                className="bg-white rounded-xl border border-slate-200 overflow-hidden"
              >
                {/* Header */}
                <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-start gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white text-sm font-semibold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </div>
                    <p className="text-base font-semibold text-slate-900 min-w-0 break-words">
                      {a.texto}
                    </p>
                  </div>
                  <div className="flex flex-row sm:flex-col items-start sm:items-end gap-1.5 shrink-0 pl-11 sm:pl-0">
                    <PriorityPill level={a.prioridad} />
                    {a.nivelCerteza && (
                      <CertaintyPill level={a.nivelCerteza} certeza={common.certeza} />
                    )}
                  </div>
                </div>

                {/* Full analysis */}
                {hasFullStructure ? (
                  <div className="p-5 space-y-4">
                    {a.problema && (
                      <Section
                        icon={AlertTriangle}
                        label={t.problema}
                        color="bg-red-50 text-red-500"
                      >
                        {a.problema}
                      </Section>
                    )}
                    {a.evidencia && (
                      <Section
                        icon={Search}
                        label={t.evidencia}
                        color="bg-blue-50 text-blue-500"
                      >
                        {a.evidencia}
                      </Section>
                    )}
                    {a.causaProbable && (
                      <Section
                        icon={GitBranch}
                        label={t.causaProbable}
                        color="bg-purple-50 text-purple-500"
                      >
                        {a.causaProbable}
                      </Section>
                    )}
                    {a.detalle && (
                      <Section
                        icon={TrendingDown}
                        label={t.impacto}
                        color="bg-amber-50 text-amber-600"
                      >
                        {a.detalle}
                      </Section>
                    )}
                    {a.metrica && (
                      <Section
                        icon={Target}
                        label={t.howWeWillKnowItWorked}
                        color="bg-emerald-50 text-emerald-600"
                      >
                        {a.metrica}
                      </Section>
                    )}
                    {a.fechaRevision && (
                      <Section
                        icon={Calendar}
                        label={t.reviewDate}
                        color="bg-slate-100 text-slate-500"
                      >
                        {a.fechaRevision}
                      </Section>
                    )}
                    <div className="flex justify-end pt-1">
                      <ShareFindingButton title={a.texto} text={shareText} language={language} />
                    </div>
                  </div>
                ) : (
                  <div className="p-5">
                    {a.detalle && (
                      <p className="text-sm text-slate-500 leading-relaxed mb-3">
                        {a.detalle}
                      </p>
                    )}
                    <div className="flex justify-end">
                      <ShareFindingButton title={a.texto} text={shareText} language={language} />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-6 max-w-3xl bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
        <ShieldCheck size={16} className="text-blue-600 mt-0.5 shrink-0" />
        <p className="text-xs text-blue-900">{t.footerNote}</p>
      </div>
    </PanelLayout>
  );
}
