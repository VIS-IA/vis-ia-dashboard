import Link from "next/link";
import { listClientsOverview } from "@/lib/adminQueries";
import AdminPageLayout from "@/components/AdminPageLayout";
import { ChevronRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminClientesPage() {
  const clients = await listClientsOverview();

  return (
    <AdminPageLayout
      title="Clientes"
      subtitle="Editar plan, estado y datos de contacto de cada cliente"
    >
      {clients.length === 0 ? (
        <p className="text-sm text-slate-500">Todavía no hay clientes registrados.</p>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100 max-w-3xl">
          {clients.map((c) => (
            <Link
              key={c.id}
              href={`/admin/clientes/${c.id}`}
              className="flex items-center gap-4 p-4 hover:bg-slate-50"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800">{c.businessName}</p>
                <p className="text-xs text-slate-400">
                  {c.clientCode} · {c.location}
                </p>
              </div>
              <span className="text-xs font-medium text-slate-500 capitalize">
                {c.plan}
              </span>
              <span
                className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                  c.estado === "activo"
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {c.estado === "activo" ? "Activo" : "Pausado"}
              </span>
              <ChevronRight size={16} className="text-slate-400 shrink-0" />
            </Link>
          ))}
        </div>
      )}
    </AdminPageLayout>
  );
}
