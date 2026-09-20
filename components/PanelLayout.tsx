import PanelSidebarNav from "@/components/PanelSidebarNav";
import { getClientPlan } from "@/lib/queries";

/**
 * PanelSidebar
 * -------------
 * Wrapper del lado del servidor: obtiene el plan del cliente que tiene
 * la sesión iniciada y se lo pasa a PanelSidebarNav (el componente
 * interactivo del lado del cliente que dibuja el menú agrupado por
 * plan). Así ninguna página necesita ir a buscar el plan solo para
 * poder mostrar el menú.
 */
export async function PanelSidebar() {
  const plan = await getClientPlan();
  return <PanelSidebarNav plan={plan} />;
}

/**
 * Standard shell for every /panel/* sub-page: sidebar + a simple content
 * header, so pages feel like part of the same app instead of a jump to
 * a different design.
 */
export default async function PanelLayout({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full bg-slate-50 flex flex-col lg:flex-row text-slate-800">
      <PanelSidebar />
      <main className="flex-1 min-w-0">
        <header className="bg-white border-b border-slate-200 px-4 py-4 lg:px-8 lg:py-5">
          <h1 className="text-lg font-semibold text-slate-900">{title}</h1>
          {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
        </header>
        <div className="p-4 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
