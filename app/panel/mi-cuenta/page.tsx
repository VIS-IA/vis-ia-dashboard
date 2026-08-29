import { createClient } from "@/lib/supabase/server";
import PanelLayout from "@/components/PanelLayout";
import SignOutButton from "@/components/SignOutButton";

export const dynamic = "force-dynamic";

export default async function MiCuentaPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: client } = user
    ? await supabase
        .from("clients")
        .select("business_name, client_code, contact_name")
        .eq("user_id", user.id)
        .single()
    : { data: null };

  return (
    <PanelLayout title="Mi Cuenta">
      <div className="bg-white rounded-xl border border-slate-200 p-6 max-w-md space-y-4">
        <div>
          <p className="text-xs text-slate-400">Correo</p>
          <p className="text-sm font-medium text-slate-800">{user?.email}</p>
        </div>
        {client && (
          <>
            <div>
              <p className="text-xs text-slate-400">Negocio</p>
              <p className="text-sm font-medium text-slate-800">
                {client.business_name}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400">ID VIS IA</p>
              <p className="text-sm font-medium text-slate-800">
                {client.client_code}
              </p>
            </div>
          </>
        )}
        <div className="pt-2 border-t border-slate-100">
          <SignOutButton />
        </div>
      </div>
    </PanelLayout>
  );
}
