import { listClientsOverview } from "@/lib/adminQueries";
import AdminPageLayout from "@/components/AdminPageLayout";
import { getVisStatusPresentation } from "@/lib/visStatus";
import { Building2, AlertCircle } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  const clients = await listClientsOverview();

  const activos = clients.filter((c) => c.estado === "activo");
  const sinReporte = clients.filter((c) => !c.latestReport);
  const pendienteScore = clients.filter(
    (c) => c.latestReport && c.latestReport.visScoreCurrent === null
  );

  return (
    <AdminPageLayout
      title="Vista General"
      subtitle="Todos los clientes de VIS IA, de un vistazo"
    >
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 max-w-3xl">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <p className="text-xs text-slate-400 mb-1">Clientes activos</p>
          <p className="text-2xl font-bold text-slate-900">
            {activos.length}
            <span className="text-sm text-slate-400 font-normal">
              {" "}
              / {clients.length}
            </span>
          </p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <p className="text-xs text-slate-400 mb-1">Sin ningún reporte aún</p>
          <p className="text-2xl font-bold text-slate-900">{sinReporte.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <p className="text-xs text-slate-400 mb-1">VIS Score pendiente</p>
          <p className="text-2xl font-bold text-slate-900">{pendienteScore.length}</p>
        </div>
      </div>

      {clients.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-8 max-w-lg text-center">
          <Building2 className="text-slate-400 mx-auto mb-3" size={28} />
          <p className="text-sm font-medium text-slate-800">
            Todavía no hay clientes registrados
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden max-w-4xl">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left">
                <th className="px-4 py-3 font-medium text-slate-500">Negocio</th>
                <th className="px-4 py-3 font-medium text-slate-500">Plan</th>
                <th className="px-4 py-3 font-medium text-slate-500">Estado</th>
                <th className="px-4 py-3 font-medium text-slate-500">
                  Último análisis
                </th>
                <th className="px-4 py-3 font-medium text-slate-500">VIS Score</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((c) => {
                const status = c.latestReport
                  ? getVisStatusPresentation(c.latestReport.visScoreStatus)
                  : null;
                return (
                  <tr key={c.id} className="border-b border-slate-50 last:border-0">
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-800">{c.businessName}</p>
                      <p className="text-xs text-slate-400">{c.clientCode}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-600 capitalize">{c.plan}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                          c.estado === "activo"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {c.estado === "activo" ? "Activo" : "Pausado"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {c.latestReport ? (
                        c.latestReport.analysisDate
                      ) : (
                        <span className="flex items-center gap-1 text-slate-400">
                          <AlertCircle size={12} /> Sin reporte
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {c.latestReport ? (
                        c.latestReport.visScoreCurrent !== null ? (
                          <span className="flex items-center gap-2">
                            <span className="font-bold text-slate-900">
                              {c.latestReport.visScoreCurrent}/100
                            </span>
                            {status && (
                              <span
                                className={`${status.badgeClass} text-white text-[10px] font-semibold px-2 py-0.5 rounded-full`}
                              >
                                {status.label}
                              </span>
                            )}
                          </span>
                        ) : (
                          <span className="text-xs text-amber-600 font-medium">
                            Pendiente
                          </span>
                        )
                      ) : (
                        "—"
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </AdminPageLayout>
  );
}
