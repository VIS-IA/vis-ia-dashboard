import AdminPageLayout from "@/components/AdminPageLayout";
import AdminNewClientForm from "@/components/AdminNewClientForm";

export default function AdminNewClientPage() {
  return (
    <AdminPageLayout
      title="Nuevo cliente"
      subtitle="Da de alta un negocio nuevo y envíale su acceso al panel"
    >
      <AdminNewClientForm />
    </AdminPageLayout>
  );
}
