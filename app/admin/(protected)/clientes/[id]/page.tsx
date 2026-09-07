import { notFound } from "next/navigation";
import { getClientById } from "@/lib/adminQueries";
import AdminPageLayout from "@/components/AdminPageLayout";
import AdminClientEditForm from "@/components/AdminClientEditForm";

export const dynamic = "force-dynamic";

export default async function AdminClientDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const client = await getClientById(params.id);
  if (!client) notFound();

  return (
    <AdminPageLayout title={client.businessName} subtitle={client.clientCode}>
      <AdminClientEditForm client={client} />

      <div className="mt-6 max-w-lg bg-white rounded-xl border border-slate-200 p-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-3">
          Último reporte
        </p>
        {client.latestReport ? (
          <div className="space-y-1 text-sm text-slate-700">
            <p>Fecha de análisis: {client.latestReport.analysisDate}</p>
            <p>
              VIS Score:{" "}
              {client.latestReport.visScoreCurrent !== null
                ? `${client.latestReport.visScoreCurrent}/100`
                : "Pendiente de calcular"}
            </p>
          </div>
        ) : (
          <p className="text-sm text-slate-400">
            Este cliente todavía no tiene ningún reporte publicado.
          </p>
        )}
        <p className="text-xs text-slate-400 mt-4">
          Publicar reportes y recalcular el VIS Score desde aquí llega en una
          próxima entrega — por ahora se hace directamente en Supabase.
        </p>
      </div>
    </AdminPageLayout>
  );
}
