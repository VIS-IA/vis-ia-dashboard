import PanelLayout from "@/components/PanelLayout";
import { Users } from "lucide-react";

export default function ExperienciaPage() {
  return (
    <PanelLayout title="Experiencia del Cliente">
      <div className="bg-white rounded-xl border border-slate-200 p-8 max-w-lg text-center">
        <Users className="text-blue-400 mx-auto mb-3" size={28} />
        <p className="text-sm font-medium text-slate-800">
          Esta sección está en construcción
        </p>
        <p className="text-sm text-slate-500 mt-1">
          Aquí verás tiempos de respuesta, interacciones y experiencia de
          tus clientes en próximas actualizaciones.
        </p>
      </div>
    </PanelLayout>
  );
}
