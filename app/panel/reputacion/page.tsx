import PanelLayout from "@/components/PanelLayout";
import { Star } from "lucide-react";

export default function ReputacionPage() {
  return (
    <PanelLayout title="Reputación">
      <div className="bg-white rounded-xl border border-slate-200 p-8 max-w-lg text-center">
        <Star className="text-amber-400 mx-auto mb-3" size={28} />
        <p className="text-sm font-medium text-slate-800">
          Esta sección está en construcción
        </p>
        <p className="text-sm text-slate-500 mt-1">
          Aquí verás el detalle de reseñas, calificación y tendencia de
          reputación de tu negocio en próximas actualizaciones.
        </p>
      </div>
    </PanelLayout>
  );
}
