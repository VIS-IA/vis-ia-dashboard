import { getDashboardData } from "@/lib/queries";
import PanelLayout from "@/components/PanelLayout";
import { ICON_MAP } from "@/lib/icons";
import { Users } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function PerdidasPage() {
  const data = await getDashboardData();

  if (!data) {
    return (
      <PanelLayout title="Pérdida Invisible">
        <p className="text-sm text-slate-500">
          Aún no hay un análisis disponible para tu negocio.
        </p>
      </PanelLayout>
    );
  }

  return (
    <PanelLayout
      title="Pérdida Invisible"
      subtitle="Todo lo que VIS IA detectó que te está costando dinero o clientes"
    >
      {data.perdidas.length === 0 ? (
        <p className="text-sm text-slate-500">
          No se detectaron pérdidas invisibles en el último análisis. 🎉
        </p>
      ) : (
        <div className="space-y-4 max-w-2xl">
          {data.perdidas.map((p, idx) => {
            const Icon = ICON_MAP[p.icon_key] ?? Users;
            return (
              <div
                key={idx}
                className="bg-white rounded-xl border border-slate-200 p-5 flex items-start gap-4"
              >
                <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                  <Icon size={18} className="text-red-500" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-800">
                    {p.titulo}
                  </p>
                  <p className="text-sm text-slate-500 mt-1">{p.descripcion}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[11px] text-slate-400">Impacto</p>
                  <p className="text-sm font-semibold text-red-600">
                    {p.impacto}
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
