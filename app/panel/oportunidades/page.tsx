import { getDashboardData } from "@/lib/queries";
import PanelLayout from "@/components/PanelLayout";
import { ICON_MAP } from "@/lib/icons";
import { Sparkles, Search, GitBranch } from "lucide-react";

export const dynamic = "force-dynamic";

function CertaintyPill({ level }: { level: string }) {
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
      Certeza: {level}
    </span>
  );
}

export default async function OportunidadesPage() {
  const data = await getDashboardData();

  if (!data) {
    return (
      <PanelLayout title="Valor Oculto">
        <p className="text-sm text-slate-500">
          Aún no hay un análisis disponible para tu negocio.
        </p>
      </PanelLayout>
    );
  }

  return (
    <PanelLayout
      title="Valor Oculto"
      subtitle="Oportunidades que VIS IA identificó para que crezcas más"
    >
      {data.oportunidades.length === 0 ? (
        <p className="text-sm text-slate-500">
          No se detectaron nuevas oportunidades en el último análisis.
        </p>
      ) : (
        <div className="space-y-4 max-w-2xl">
          {data.oportunidades.map((o, idx) => {
            const Icon = ICON_MAP[o.icon_key] ?? Sparkles;
            return (
              <div
                key={idx}
                className="bg-white rounded-xl border border-slate-200 overflow-hidden"
              >
                <div className="p-5 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                    <Icon size={18} className="text-emerald-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-800">
                      {o.titulo}
                    </p>
                    <p className="text-sm text-slate-500 mt-1">{o.descripcion}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <div className="text-right">
                      <p className="text-[11px] text-slate-400">Potencial</p>
                      <p
                        className={`text-sm font-semibold ${
                          o.potencial === "Alto" ? "text-emerald-600" : "text-amber-600"
                        }`}
                      >
                        {o.potencial}
                      </p>
                    </div>
                    {o.nivelCerteza && <CertaintyPill level={o.nivelCerteza} />}
                  </div>
                </div>
                {(o.evidencia || o.causaProbable) && (
                  <div className="px-5 pb-5 space-y-3 border-t border-slate-100 pt-4">
                    {o.evidencia && (
                      <div className="flex gap-2.5">
                        <Search size={14} className="text-blue-500 mt-0.5 shrink-0" />
                        <p className="text-sm text-slate-600">
                          <span className="font-medium text-slate-700">Evidencia: </span>
                          {o.evidencia}
                        </p>
                      </div>
                    )}
                    {o.causaProbable && (
                      <div className="flex gap-2.5">
                        <GitBranch size={14} className="text-purple-500 mt-0.5 shrink-0" />
                        <p className="text-sm text-slate-600">
                          <span className="font-medium text-slate-700">Por qué existe esta oportunidad: </span>
                          {o.causaProbable}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </PanelLayout>
  );
}
