import { getDashboardData } from "@/lib/queries";
import PanelLayout from "@/components/PanelLayout";

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

export default async function PlanAccionPage() {
  const data = await getDashboardData();

  if (!data) {
    return (
      <PanelLayout title="Plan de Acción">
        <p className="text-sm text-slate-500">
          Aún no hay un análisis disponible para tu negocio.
        </p>
      </PanelLayout>
    );
  }

  return (
    <PanelLayout
      title="Plan de Acción"
      subtitle="Próximos pasos recomendados por VIS IA, en orden de prioridad"
    >
      {data.acciones.length === 0 ? (
        <p className="text-sm text-slate-500">
          No hay acciones pendientes en este momento.
        </p>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 p-5 max-w-2xl">
          <div className="space-y-4">
            {data.acciones.map((a, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-blue-600 text-white text-xs font-semibold flex items-center justify-center shrink-0">
                  {idx + 1}
                </div>
                <p className="flex-1 text-sm text-slate-800">{a.texto}</p>
                <PriorityPill level={a.prioridad} />
              </div>
            ))}
          </div>
        </div>
      )}
    </PanelLayout>
  );
}
