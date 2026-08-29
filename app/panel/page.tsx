import { getDashboardData } from "@/lib/queries";
import PanelShell from "@/components/PanelShell";

// Always fetch fresh data — this is a live client report, not static content.
export const dynamic = "force-dynamic";

export default async function PanelPage() {
  const data = await getDashboardData();

  if (!data) {
    return (
      <div className="min-h-screen w-full bg-slate-50 flex items-center justify-center px-4">
        <div className="max-w-md text-center bg-white rounded-2xl border border-slate-200 p-8">
          <h1 className="text-lg font-semibold text-slate-900 mb-2">
            Aún no hay un análisis disponible
          </h1>
          <p className="text-sm text-slate-500">
            Tu cuenta está activa, pero VIS IA todavía no ha publicado un
            reporte para tu negocio. Vuelve a intentarlo más tarde o
            contáctanos si crees que esto es un error.
          </p>
        </div>
      </div>
    );
  }

  return <PanelShell data={data} />;
}
