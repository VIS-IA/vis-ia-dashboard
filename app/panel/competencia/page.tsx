import { getCompetitors } from "@/lib/queries";
import PanelLayout from "@/components/PanelLayout";
import { BarChart3, Star } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CompetenciaPage() {
  const competitors = await getCompetitors();

  if (competitors.length === 0) {
    return (
      <PanelLayout title="Competencia">
        <div className="bg-white rounded-xl border border-slate-200 p-8 max-w-lg text-center">
          <BarChart3 className="text-purple-400 mx-auto mb-3" size={28} />
          <p className="text-sm font-medium text-slate-800">
            Aún no hay comparación de competencia cargada
          </p>
          <p className="text-sm text-slate-500 mt-1">
            Cuando VIS IA publique este detalle, aparecerá aquí.
          </p>
        </div>
      </PanelLayout>
    );
  }

  const maxRating = Math.max(...competitors.map((c) => c.rating), 5);

  return (
    <PanelLayout
      title="Competencia"
      subtitle="Cómo te comparas con negocios similares en tu zona"
    >
      <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100 max-w-2xl">
        {competitors.map((c, idx) => (
          <div
            key={idx}
            className={`p-4 flex items-center gap-4 ${
              c.isYou ? "bg-blue-50/60" : ""
            }`}
          >
            <div className="flex-1 min-w-0">
              <p
                className={`text-sm font-medium truncate ${
                  c.isYou ? "text-blue-700" : "text-slate-800"
                }`}
              >
                {c.name} {c.isYou && "(Tú)"}
              </p>
              <div className="w-full h-1.5 rounded-full bg-slate-100 mt-2 overflow-hidden">
                <div
                  className={`h-full ${c.isYou ? "bg-blue-600" : "bg-slate-400"}`}
                  style={{ width: `${(c.rating / maxRating) * 100}%` }}
                />
              </div>
              {c.notes && (
                <p className="text-xs text-slate-400 mt-1">{c.notes}</p>
              )}
            </div>
            <div className="text-right shrink-0">
              <div className="flex items-center gap-1 justify-end">
                <Star size={14} className="fill-amber-400 text-amber-400" />
                <span className="text-sm font-semibold text-slate-900">
                  {c.rating.toFixed(1)}
                </span>
              </div>
              <p className="text-xs text-slate-400">{c.reviewCount} reseñas</p>
            </div>
          </div>
        ))}
      </div>
    </PanelLayout>
  );
}
