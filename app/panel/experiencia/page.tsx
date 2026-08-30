import { getExperienceDetail } from "@/lib/queries";
import PanelLayout from "@/components/PanelLayout";
import { Users, ThumbsUp, ThumbsDown, MessageSquareText } from "lucide-react";

export const dynamic = "force-dynamic";

function DeltaTag({ current, previous }: { current: number; previous: number | null }) {
  if (previous === null) {
    return <span className="text-xs text-slate-400">Primer reporte</span>;
  }
  const diff = Math.round((current - previous) * 10) / 10;
  if (diff === 0) return <span className="text-xs text-slate-400">Sin cambio</span>;
  return (
    <span
      className={`text-xs font-semibold ${
        diff > 0 ? "text-emerald-600" : "text-red-500"
      }`}
    >
      {diff > 0 ? "+" : ""}
      {diff} vs. anterior
    </span>
  );
}

function SubratingBar({
  label,
  value,
  previous,
}: {
  label: string;
  value: number;
  previous: number | null;
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <p className="text-xs text-slate-500 mb-1">{label}</p>
      <div className="flex items-baseline gap-2 mb-2">
        <span className="text-2xl font-bold text-slate-900">{value.toFixed(1)}</span>
        <span className="text-xs text-slate-400">/10</span>
      </div>
      <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden mb-2">
        <div className="h-full bg-blue-600" style={{ width: `${(value / 10) * 100}%` }} />
      </div>
      <DeltaTag current={value} previous={previous} />
    </div>
  );
}

export default async function ExperienciaPage() {
  const detail = await getExperienceDetail();

  if (!detail) {
    return (
      <PanelLayout title="Experiencia del Cliente">
        <div className="bg-white rounded-xl border border-slate-200 p-8 max-w-lg text-center">
          <Users className="text-blue-400 mx-auto mb-3" size={28} />
          <p className="text-sm font-medium text-slate-800">
            Aún no hay datos de experiencia del cliente cargados
          </p>
          <p className="text-sm text-slate-500 mt-1">
            Cuando VIS IA publique este detalle, aparecerá aquí.
          </p>
        </div>
      </PanelLayout>
    );
  }

  if (detail.type === "hotel") {
    return (
      <PanelLayout
        title="Experiencia del Cliente"
        subtitle="Subcalificaciones reales de Booking, Expedia y TripAdvisor"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl">
          <SubratingBar
            label="Limpieza"
            value={detail.cleanliness}
            previous={detail.cleanlinessPrevious}
          />
          <SubratingBar
            label="Personal / Atención"
            value={detail.staff}
            previous={detail.staffPrevious}
          />
          <SubratingBar
            label="Comodidad"
            value={detail.comfort}
            previous={detail.comfortPrevious}
          />
          <SubratingBar
            label="Ubicación"
            value={detail.location}
            previous={detail.locationPrevious}
          />
          <SubratingBar
            label="Relación calidad-precio"
            value={detail.valueForMoney}
            previous={detail.valueForMoneyPrevious}
          />
        </div>
      </PanelLayout>
    );
  }

  return (
    <PanelLayout
      title="Experiencia del Cliente"
      subtitle="Qué tanto mencionan tu servicio y atención en las reseñas"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mb-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
            <MessageSquareText size={14} className="text-blue-500" /> Puntaje de
            sentimiento
          </div>
          <p className="text-2xl font-bold text-slate-900">
            {detail.sentimentScore}
            <span className="text-sm text-slate-400 font-normal">/100</span>
          </p>
          <div className="mt-1">
            <DeltaTag
              current={detail.sentimentScore}
              previous={detail.sentimentScorePrevious}
            />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
            <ThumbsUp size={14} className="text-emerald-500" /> Menciones
            positivas del servicio
          </div>
          <p className="text-2xl font-bold text-slate-900">
            {detail.positiveMentions}
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
            <ThumbsDown size={14} className="text-red-500" /> Menciones
            negativas del servicio
          </div>
          <p className="text-2xl font-bold text-slate-900">
            {detail.negativeMentions}
          </p>
        </div>
      </div>

      {detail.topTheme && (
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 max-w-3xl">
          <p className="text-sm text-blue-900">
            <span className="font-semibold">Tema más mencionado:</span>{" "}
            {detail.topTheme}
          </p>
        </div>
      )}

      <p className="text-xs text-slate-400 mt-4 max-w-3xl">
        Este análisis se basa en lo que la gente escribe en sus reseñas
        públicas (Google Maps, etc.), no en datos privados del negocio.
      </p>
    </PanelLayout>
  );
}
