"use server";

import { requireAdmin } from "@/lib/adminQueries";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

/**
 * Actualiza los campos editables de un cliente desde el panel admin.
 * Vuelve a verificar is_admin() aquí mismo (no solo confiar en que la
 * página que llamó a esto ya lo hizo) — una Server Action es un
 * endpoint propio y puede ser invocada directamente.
 */
export async function updateClient(clientId: string, formData: FormData) {
  const { supabase } = await requireAdmin();

  const plan = String(formData.get("plan") ?? "");
  const estado = String(formData.get("estado") ?? "");
  const businessName = String(formData.get("businessName") ?? "").trim();
  const contactName = String(formData.get("contactName") ?? "").trim();
  const location = String(formData.get("location") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();
  const contactEmail = String(formData.get("contactEmail") ?? "").trim();
  const internalNotes = String(formData.get("internalNotes") ?? "").trim();

  if (!["diagnostic", "pro", "intelligence"].includes(plan)) {
    return { error: "Plan inválido." };
  }
  if (!["activo", "pausado"].includes(estado)) {
    return { error: "Estado inválido." };
  }
  if (!businessName || !location) {
    return { error: "Nombre del negocio y ubicación son obligatorios." };
  }

  const { error } = await supabase
    .from("clients")
    .update({
      plan,
      estado,
      business_name: businessName,
      contact_name: contactName || null,
      location,
      phone: phone || null,
      address: address || null,
      contact_email: contactEmail || null,
      internal_notes: internalNotes || null,
    })
    .eq("id", clientId);

  if (error) {
    return { error: "No se pudo guardar — inténtalo de nuevo." };
  }

  revalidatePath("/admin/clientes");
  revalidatePath(`/admin/clientes/${clientId}`);
  revalidatePath("/admin");
  return { success: true };
}

/**
 * Borra un cliente PERMANENTEMENTE: su fila en `clients` (que arrastra
 * en cascada todos sus reportes, pérdidas, oportunidades, competencia,
 * reputación, conversaciones con VIS, hechos guardados, etc. — así está
 * configurado en la base de datos) y también su cuenta de acceso
 * (auth.users), para que ya no pueda entrar al panel. No se puede
 * deshacer — por eso vuelve a verificar requireAdmin() aquí mismo y
 * pide el nombre exacto del negocio desde el formulario que llama a
 * esto, como confirmación.
 */
export async function deleteClient(clientId: string, confirmBusinessName: string) {
  await requireAdmin();

  const supabaseAdmin = createAdminClient();

  const { data: client } = await supabaseAdmin
    .from("clients")
    .select("id, user_id, business_name")
    .eq("id", clientId)
    .maybeSingle();

  if (!client) {
    return { error: "No se encontró este cliente." };
  }
  if (confirmBusinessName.trim() !== client.business_name) {
    return { error: "El nombre no coincide — escribe el nombre del negocio exactamente como aparece." };
  }

  const { error: deleteError } = await supabaseAdmin.from("clients").delete().eq("id", clientId);
  if (deleteError) {
    return { error: "No se pudo borrar — inténtalo de nuevo." };
  }

  // El acceso de auth.users se borra aparte — si esto llega a fallar,
  // el cliente y todos sus datos ya quedaron eliminados igual; solo
  // quedaría una cuenta de acceso huérfana para limpiar a mano después.
  if (client.user_id) {
    await supabaseAdmin.auth.admin.deleteUser(client.user_id);
  }

  revalidatePath("/admin/clientes");
  revalidatePath("/admin");
  redirect("/admin/clientes");
}
