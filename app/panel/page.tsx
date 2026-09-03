import Link from "next/link";
import { ClipboardList, ChevronRight } from "lucide-react";
import { getDashboardData, getOnboardingStatus } from "@/lib/queries";
import VisIaPanelInicio from "@/components/VisIaPanelInicio";
import PanelLayout from "@/components/PanelLayout";

// Always fetch fresh data — this is a live client report, not static content.
export const dynamic = "force-dynamic";

export default async function PanelPage() {
  const [data, onboarding] = await Promise.all([
    getDashboardData(),
    getOnboardingStatus(),
  ]);

  if (!data) {
    return (
      <PanelLayout title="Bienvenido a VIS IA">
        <div className="max-w-lg bg-white rounded-2xl border border-slate-200 p-8">
          <h1 className="text-lg font-semibold text-slate-900 mb-2">
            Aún no hay un análisis publicado
          </h1>
          <p className="text-sm text-slate-500 mb-6">
            Tu cuenta está activa. VIS IA está preparando tu primer reporte —
            mientras tanto, ayúdanos respondiendo las 15 preguntas sobre tu
            negocio; esa información es parte del análisis.
          </p>
          {!onboarding.completed ? (
            <Link
              href="/panel/preguntas"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg px-5 py-2.5"
            >
              <ClipboardList size={16} />
              Responder las 15 preguntas
              <ChevronRight size={14} />
            </Link>
          ) : (
            <p className="text-sm text-emerald-600 font-medium">
              Ya respondiste las 15 preguntas — gracias. Te avisaremos cuando
              tu primer reporte esté listo.
            </p>
          )}
        </div>
      </PanelLayout>
    );
  }

  return (
    <div>
      {!onboarding.completed && (
        <Link
          href="/panel/preguntas"
          className="flex items-center gap-3 bg-blue-600 text-white px-6 py-3 hover:bg-blue-700 transition-colors"
        >
          <ClipboardList size={16} />
          <span className="text-sm font-medium flex-1 min-w-0">
            Nos faltan tus respuestas a las 15 preguntas sobre tu negocio —
            tómate unos minutos para completarlas
          </span>
          <ChevronRight size={16} />
        </Link>
      )}
      <VisIaPanelInicio data={data} onboardingCompleted={onboarding.completed} />
    </div>
  );
}
