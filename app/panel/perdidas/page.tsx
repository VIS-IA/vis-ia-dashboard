import { getDashboardData, getClientLanguage } from "@/lib/queries";
import PanelLayout from "@/components/PanelLayout";
import { ICON_MAP } from "@/lib/icons";
import ShareFindingButton from "@/components/ShareFindingButton";
import EconomicImpactCard from "@/components/EconomicImpactCard";
import { Users, GitBranch } from "lucide-react";
import { getDictionary } from "@/lib/i18n";

export const dynamic = "force-dynamic";

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

export default async function PerdidasPage() {
  const [data, language] = await Promise.all([getDashboardData(), getClientLanguage()]);
  const t = getDictionary(language).perdidas;
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
      {data.perdidas.length === 0 ? (
        <p className="text-sm text-slate-500">{t.empty}</p>
      ) : (
        <div className="space-y-4 max-w-2xl">
          {data.perdidas.map((p, idx) => {
            const Icon = ICON_MAP[p.icon_key] ?? Users;
            const shareText = [
              t.shareTitle(data.business.name),
              p.titulo,
              p.descripcion,
              p.evidencia ? `${common.evidencia}: ${p.evidencia}` : null,
              p.causaProbable ? `${common.causaProbable}: ${p.causaProbable}` : null,
              `${common.impacto}: ${p.impacto}${p.nivelCerteza ? ` (${common.certeza}: ${p.nivelCerteza})` : ""}`,
            ]
              .filter(Boolean)
              .join("\n");
            return (
              <div
                key={idx}
                className="bg-white rounded-xl border border-slate-200 overflow-hidden"
              >
                <div className="p-5 flex flex-col sm:flex-row sm:items-start gap-4">
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                      <Icon size={18} className="text-red-500" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-800">
                        {p.titulo}
                      </p>
                      <p className="text-sm text-slate-500 mt-1">{p.descripcion}</p>
                    </div>
                  </div>
                  <div className="flex flex-row sm:flex-col items-center sm:items-end gap-3 sm:gap-1.5 shrink-0 pl-14 sm:pl-0">
                    <div className="text-left sm:text-right">
                      <p className="text-[11px] text-slate-400">{common.impacto}</p>
                      <p className="text-sm font-semibold text-red-600">
                        {p.impacto}
                      </p>
                    </div>
                    {p.nivelCerteza && (
                      <CertaintyPill level={p.nivelCerteza} certeza={common.certeza} />
                    )}
                  </div>
                </div>
                {(p.evidencia || p.causaProbable || p.nivelCerteza) && (
                  <div className="px-5 pb-5 space-y-3 border-t border-slate-100 pt-4">
                    {p.causaProbable && (
                      <div className="flex gap-2.5">
                        <GitBranch size={14} className="text-purple-500 mt-0.5 shrink-0" />
                        <p className="text-sm text-slate-600">
                          <span className="font-medium text-slate-700">{common.causaProbable}: </span>
                          {p.causaProbable}
                        </p>
                      </div>
                    )}
                    <EconomicImpactCard
                      kind="perdida"
                      montoEstimado={p.montoEstimado}
                      moneda={p.moneda}
                      supuestos={p.supuestos}
                      evidencia={p.evidencia}
                      nivelCerteza={p.nivelCerteza}
                    />
                  </div>
                )}
                <div className="px-5 pb-4 pt-1 flex justify-end">
                  <ShareFindingButton title={p.titulo} text={shareText} language={language} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </PanelLayout>
  );
}
