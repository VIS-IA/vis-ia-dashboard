import PanelLayout from "@/components/PanelLayout";
import { BarChart3 } from "lucide-react";

export default function CompetenciaPage() {
  return (
    <PanelLayout title="Competencia">
      <div className="bg-white rounded-xl border border-slate-200 p-8 max-w-lg text-center">
        <BarChart3 className="text-purple-400 mx-auto mb-3" size={28} />
        <p className="text-sm font-medium text-slate-800">
          Esta sección está en construcción
        </p>
        <p className="text-sm text-slate-500 mt-1">
          Aquí verás cómo te comparas con negocios similares en tu zona en
          próximas actualizaciones.
        </p>
      </div>
    </PanelLayout>
  );
}
