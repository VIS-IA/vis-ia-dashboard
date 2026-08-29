import { getDashboardData } from "@/lib/queries";
import PanelLayout from "@/components/PanelLayout";
import { ICON_MAP } from "@/lib/icons";
import { Sparkles } from "lucide-react";

export const dynamic = "force-dynamic";

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
                className="bg-white rounded-xl border border-slate-200 p-5 flex items-start gap-4"
              >
                <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                  <Icon size={18} className="text-emerald-500" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-800">
                    {o.titulo}
                  </p>
                  <p className="text-sm text-slate-500 mt-1">{o.descripcion}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[11px] text-slate-400">Potencial</p>
                  <p
                    className={`text-sm font-semibold ${
                      o.potencial === "Alto" ? "text-emerald-600" : "text-amber-600"
                    }`}
                  >
                    {o.potencial}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </PanelLayout>
  );
}
