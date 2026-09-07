import { requireAdmin } from "@/lib/adminQueries";
import AdminSidebar from "@/components/AdminSidebar";

// Verifica sesión + rol de administrador en cada navegación dentro de
// /admin — nunca confía solo en el middleware (ese solo revisa que haya
// alguna sesión, no que sea admin).
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <AdminSidebar />
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}
